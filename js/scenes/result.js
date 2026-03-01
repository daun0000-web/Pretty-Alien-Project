/**
 * 결과 씬: 변신 캐릭터 표시 → 클릭 시 점수 표시(캐릭터 오른쪽) → 클릭 시 재시작
 * - scoreSystem 사용 (GRADES 배열 기반 등급·문구 표시)
 */

import { PARTS_DATA, IMAGE_USAGE_KEYS, FALLBACK_IMAGE_PATH, getPartImagePath } from '../data/parts.js';
import { calculateScore, RANK_DESCRIPTIONS, GRADES } from '../system/scoreSystem.js';
import { getTheme } from '../theme.js';

/** 등급별 결과 배경 이미지 (assets/result/) */
const RESULT_BG_PATHS = {
  S: 'assets/result/last_bg_S.png',
  A: 'assets/result/last_bg_A.png',
  B: 'assets/result/last_bg_B.png',
  C: 'assets/result/last_bg_C.png',
  D: 'assets/result/last_bg_D.png',
};

/** 하위→상위 순서: skin → eyes → mouth → hair → bottom → top */
const LAYER_ORDER = ['skin', 'eyes', 'mouth', 'hair', 'bottom', 'top'];
/** 결과/캐릭터 이미지 영역 크기 */
const DRAW_W = 380;
const DRAW_H = 480;
const GAP = 40;
/** 결과 화면 캐릭터·방사선 세로 오프셋(px, 아래로) */
const RESULT_CHAR_OFFSET_Y = 36;

/** 클릭 후 흰색 페이드 연출 (ms) */
const FADE_IN_MS = 300;
const FADE_OUT_MS = 400;
/** 흰색 불투명도 1 유지 구간 (결과 장면 로드 시점), 기존 대비 2배 */
const FULL_WHITE_MS = FADE_OUT_MS * 2;
const TRANSITION_TOTAL_MS = FADE_IN_MS + FULL_WHITE_MS + FADE_OUT_MS;

/** 결과 화면 텍스트 흰색 외곽선 */
const TEXT_OUTLINE_WHITE = '#ffffff';
const TEXT_OUTLINE_WIDTH = 5;

/** 등급 설명: 상단에서의 여백(px) */
const RANK_DESC_TOP_PAD = 60;
/** 등급 설명 폰트: 기본 39px, ±3px 천천히 맥동 (rad/ms) */
const RANK_DESC_FONT_BASE = 39;
const RANK_DESC_FONT_AMP = 3;
const RANK_DESC_PULSE_RAD_PER_MS = 0.0025;
/** 등급/총점: 좌하단 여백(px) */
const SCORE_LEFT_PAD = 40;
const SCORE_BOTTOM_PAD = 100;

/** 다시하기 버튼 (우측 하단) */
const RESTART_BTN_PAD = 20;
const RESTART_BTN_W = 120;
const RESTART_BTN_H = 44;
const RESTART_BTN_R = 22;

/** 캐릭터 뒤 방사형 강조선(sunburst) */
const SUNBURST_COLOR = '#ffe985';
const SUNBURST_RADIUS = 320;
const SUNBURST_INNER_RADIUS = 60;
const SUNBURST_RAYS = 18;
const SUNBURST_GAP_RAD = 0.06;
const SUNBURST_INNER_SPAN_RATIO = 0.4;
const SUNBURST_ALPHA_PEAK = 0.5;
const SUNBURST_GLOBAL_ALPHA = 0.4;
const SUNBURST_BLEND_MODE = 'lighter';
const SUNBURST_ROTATION_RAD_PER_MS = 0.00016;

export class ResultScene {
  onEnter() {
    this.startTime = Date.now();
    this.transitionStartTime = 0;
    this.partImages = {};
    this.resultBgImages = {};
    this.resultBgLoadStarted = false; // 화이트 100% 시점에 한 번만 로드 시작
    this.phase = 'result';
    this.scoreResult = null;
    this.manager.showRestartButton?.(false);
    this.preloadImages();
  }

  onExit() {
    this.manager.showRestartButton?.(false);
  }

  async preloadImages() {
    const selected = this.manager.state.selectedParts || {};
    for (const partType of LAYER_ORDER) {
      const id = selected[partType];
      if (!id) continue;
      const list = PARTS_DATA[partType] || [];
      const opt = list.find((o) => o.id === id);
      if (!opt) continue;
      const path = getPartImagePath(opt, IMAGE_USAGE_KEYS.RESULT);
      let img = null;
      try {
        img = await this.manager.loadImage(path);
      } catch {
        if (path !== FALLBACK_IMAGE_PATH) {
          try {
            img = await this.manager.loadImage(FALLBACK_IMAGE_PATH);
          } catch {}
        }
      }
      if (img) this.partImages[partType] = img;
    }
  }

  update() {
    if (this.phase === 'transition') {
      const elapsed = Date.now() - this.transitionStartTime;
      if (elapsed >= TRANSITION_TOTAL_MS) {
        this.phase = 'score';
        this.manager.showRestartButton?.(true);
      }
      return;
    }
    if (this.phase === 'score' && this.scoreResult == null) {
      this.scoreResult = calculateScore(this.manager.state.selectedParts || {});
    }
  }

  draw() {
    const { ctx, width, height } = this.manager;
    const theme = getTheme();

    if (this.phase === 'result') {
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);
      const elapsed = Date.now() - this.startTime;
      const opacity = 0.3 + 0.7 * (Math.sin(elapsed * 0.0026) + 1) / 2;
      ctx.globalAlpha = opacity;
      ctx.fillStyle = theme.textMuted;
      ctx.font = `20px "${theme.fontFamily}"`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = TEXT_OUTLINE_WHITE;
      ctx.lineWidth = TEXT_OUTLINE_WIDTH;
      ctx.lineJoin = 'round';
      ctx.strokeText('화면을 클릭하면 결과를 확인합니다', width / 2, height / 2);
      ctx.fillText('화면을 클릭하면 결과를 확인합니다', width / 2, height / 2);
      ctx.globalAlpha = 1;
      return;
    }

    const rank = this.scoreResult?.rank;
    if (this.phase === 'transition') {
      const elapsed = Date.now() - this.transitionStartTime;
      if (elapsed >= FADE_IN_MS && rank && RESULT_BG_PATHS[rank] && !this.resultBgLoadStarted) {
        this.resultBgLoadStarted = true;
        this.manager.loadImage(RESULT_BG_PATHS[rank]).then((img) => {
          this.resultBgImages[rank] = img;
        }).catch(() => {});
      }
    }

    const bgImg = rank && this.resultBgImages[rank];
    if (bgImg) {
      const scale = Math.max(width / bgImg.width, height / bgImg.height);
      const dw = bgImg.width * scale;
      const dh = bgImg.height * scale;
      ctx.drawImage(bgImg, 0, 0, bgImg.width, bgImg.height, (width - dw) / 2, (height - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);
    }

    const centerY = height / 2;
    const charCenterY = centerY + RESULT_CHAR_OFFSET_Y;
    const charLeft = (width - (DRAW_W + GAP + 220)) / 2;
    const charCenterX = charLeft + DRAW_W / 2;

    const drawSunburst = (cx, cy) => {
      const angle = (Date.now() * SUNBURST_ROTATION_RAD_PER_MS) % (2 * Math.PI);
      ctx.save();
      ctx.globalCompositeOperation = SUNBURST_BLEND_MODE;
      ctx.globalAlpha = SUNBURST_GLOBAL_ALPHA;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.translate(-cx, -cy);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SUNBURST_RADIUS);
      g.addColorStop(0, 'rgba(255,233,133,0)');
      g.addColorStop(0.35, `rgba(255,233,133,${SUNBURST_ALPHA_PEAK})`);
      g.addColorStop(1, 'rgba(255,233,133,0)');
      ctx.fillStyle = g;
      const step = (2 * Math.PI) / SUNBURST_RAYS;
      for (let i = 0; i < SUNBURST_RAYS; i++) {
        const o0 = i * step + SUNBURST_GAP_RAD / 2;
        const o1 = (i + 1) * step - SUNBURST_GAP_RAD / 2;
        const outerSpan = o1 - o0;
        const innerHalfSpan = (outerSpan * SUNBURST_INNER_SPAN_RATIO) / 2;
        const mid = (o0 + o1) / 2;
        const i0 = mid - innerHalfSpan;
        const i1 = mid + innerHalfSpan;
        ctx.beginPath();
        ctx.moveTo(cx + SUNBURST_INNER_RADIUS * Math.cos(i0), cy + SUNBURST_INNER_RADIUS * Math.sin(i0));
        ctx.lineTo(cx + SUNBURST_INNER_RADIUS * Math.cos(i1), cy + SUNBURST_INNER_RADIUS * Math.sin(i1));
        ctx.lineTo(cx + SUNBURST_RADIUS * Math.cos(o1), cy + SUNBURST_RADIUS * Math.sin(o1));
        ctx.lineTo(cx + SUNBURST_RADIUS * Math.cos(o0), cy + SUNBURST_RADIUS * Math.sin(o0));
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    const drawResultContent = () => {
      drawSunburst(charCenterX, charCenterY);
      for (const partType of LAYER_ORDER) {
        const img = this.partImages[partType];
        if (!img) continue;
        const scale = Math.min(DRAW_W / img.width, DRAW_H / img.height, 1);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, charCenterX - dw / 2, charCenterY - dh / 2, dw, dh);
      }
      if (!this.scoreResult) return;
      const { total, rank } = this.scoreResult;
      const rankDesc = RANK_DESCRIPTIONS[rank] || '';
      const gradeColor = theme['grade' + rank] || theme.gradeD;
      ctx.strokeStyle = TEXT_OUTLINE_WHITE;
      ctx.lineWidth = TEXT_OUTLINE_WIDTH;
      ctx.lineJoin = 'round';

      // 1. 등급 설명: 가운데 상단, 3px 맥동
      ctx.fillStyle = theme.text;
      const descFontSize = RANK_DESC_FONT_BASE + Math.round(RANK_DESC_FONT_AMP * Math.sin(Date.now() * RANK_DESC_PULSE_RAD_PER_MS));
      ctx.font = `bold ${descFontSize}px "${theme.fontFamily}"`;
      ctx.textAlign = 'center';
      const descY = RANK_DESC_TOP_PAD;
      ctx.strokeText(rankDesc, width / 2, descY);
      ctx.fillText(rankDesc, width / 2, descY);

      // 2. 등급 이름·총점: 좌 하단 좌측 정렬, 등급 폰트는 총점과 동일(22px)
      const scoreY1 = height - SCORE_BOTTOM_PAD;
      const scoreY2 = scoreY1 + 28;
      ctx.textAlign = 'left';
      ctx.font = `22px "${theme.fontFamily}"`;
      ctx.fillStyle = gradeColor;
      ctx.strokeText(`${rank}등급`, SCORE_LEFT_PAD, scoreY1);
      ctx.fillText(`${rank}등급`, SCORE_LEFT_PAD, scoreY1);
      ctx.fillStyle = theme.textMuted;
      ctx.strokeText(`총점: ${total}점`, SCORE_LEFT_PAD, scoreY2);
      ctx.fillText(`총점: ${total}점`, SCORE_LEFT_PAD, scoreY2);
    };

    if (this.phase === 'transition') {
      const elapsed = Date.now() - this.transitionStartTime;
      const fadeInDone = elapsed >= FADE_IN_MS;
      if (fadeInDone) drawResultContent();

      let whiteOpacity = 0;
      if (elapsed < FADE_IN_MS) {
        whiteOpacity = elapsed / FADE_IN_MS;
      } else if (elapsed < FADE_IN_MS + FULL_WHITE_MS) {
        whiteOpacity = 1;
      } else if (elapsed < TRANSITION_TOTAL_MS) {
        whiteOpacity = 1 - (elapsed - (FADE_IN_MS + FULL_WHITE_MS)) / FADE_OUT_MS;
      }
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = whiteOpacity;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1;
      return;
    }

    drawResultContent();

    // 다시하기 버튼은 HTML #restart-btn으로 표시 (hover/active 효과), 캔버스에는 그리지 않음
  }

  isRestartButtonHit(mx, my) {
    if (mx < 0 || my < 0) return false;
    const { width, height } = this.manager;
    const btnX = width - RESTART_BTN_W - RESTART_BTN_PAD;
    const btnY = height - RESTART_BTN_H - RESTART_BTN_PAD;
    return mx >= btnX && mx <= btnX + RESTART_BTN_W && my >= btnY && my <= btnY + RESTART_BTN_H;
  }

  handleClick(mx, my) {
    if (this.phase === 'result') {
      this.phase = 'transition';
      this.transitionStartTime = Date.now();
      this.scoreResult = calculateScore(this.manager.state.selectedParts || {});
      return;
    }
    if (this.phase === 'transition') return;
    if (this.phase === 'score') {
      const isRestart = (mx === -2 && my === -2) || this.isRestartButtonHit(mx, my);
      if (!isRestart) return;
      this.manager.state.selectedParts = {};
      this.manager.state.partsRoundIndex = 0;
      this.manager.switchScene('intro');
    }
  }
}
