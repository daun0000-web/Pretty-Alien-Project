/**
 * 타이틀 씬 - 최초 1회 진입 시에만 표시
 * 로고: 1초 흔들림 → 2초 정지 반복, 3~6초 후 인트로로 자동 전환
 */

import { getTheme } from '../theme.js';

const TITLE_LOGO_PATH = 'assets/intro/title.png';
const SHAKE_AMPLITUDE = 4;
const SHAKE_SPEED = 0.012;
const SHAKE_PHASE_MS = 1000;
const STILL_PHASE_MS = 2000;
const SHAKE_CYCLE_MS = SHAKE_PHASE_MS + STILL_PHASE_MS;
const TRANSITION_MIN_MS = 3000;
const TRANSITION_MAX_MS = 6000;
const LOADING_BAR_W = 280;
const LOADING_BAR_H = 12;
const LOADING_BAR_R = 6;
const LOADING_AREA_BOTTOM_PAD = 36;

/** 로고 뒤 방사형 강조선 (결과 화면과 동일, 타이틀만 컬러 #ff9edd) */
const SUNBURST_COLOR_RGB = '255, 158, 221';
const SUNBURST_RADIUS = 320;
const SUNBURST_INNER_RADIUS = 60;
const SUNBURST_RAYS = 18;
const SUNBURST_GAP_RAD = 0.06;
const SUNBURST_INNER_SPAN_RATIO = 0.4;
const SUNBURST_ALPHA_PEAK = 0.5;
const SUNBURST_GLOBAL_ALPHA = 0.4;
const SUNBURST_BLEND_MODE = 'lighter';
const SUNBURST_ROTATION_RAD_PER_MS = 0.00016;

export class TitleScene {
  onEnter() {
    this.startTime = Date.now();
    this.titleImage = null;
    this.transitionAt = this.startTime + TRANSITION_MIN_MS + Math.random() * (TRANSITION_MAX_MS - TRANSITION_MIN_MS);
    this.loadTitleImage();
  }

  async loadTitleImage() {
    try {
      this.titleImage = await this.manager.loadImage(TITLE_LOGO_PATH);
    } catch (_) {
      this.titleImage = null;
    }
  }

  update(deltaTime) {
    if (Date.now() >= this.transitionAt) {
      this.manager.state.hasSeenTitle = true;
      this.manager.state.enteringIntroFromTitle = true; // 인트로 페이드인만 타이틀→인트로 시에 사용
      this.manager.switchScene('intro');
    }
  }

  draw() {
    const { ctx, width, height } = this.manager;
    const theme = getTheme();
    const elapsed = Date.now() - this.startTime;

    ctx.fillStyle = '#8162c1';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    let centerY = height / 2 - 25;

    const drawSunburst = (cx, cy) => {
      const angle = (Date.now() * SUNBURST_ROTATION_RAD_PER_MS) % (2 * Math.PI);
      ctx.save();
      ctx.globalCompositeOperation = SUNBURST_BLEND_MODE;
      ctx.globalAlpha = SUNBURST_GLOBAL_ALPHA;
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.translate(-cx, -cy);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, SUNBURST_RADIUS);
      g.addColorStop(0, `rgba(${SUNBURST_COLOR_RGB},0)`);
      g.addColorStop(0.35, `rgba(${SUNBURST_COLOR_RGB},${SUNBURST_ALPHA_PEAK})`);
      g.addColorStop(1, `rgba(${SUNBURST_COLOR_RGB},0)`);
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
    drawSunburst(centerX, centerY);

    const cyclePos = elapsed % SHAKE_CYCLE_MS;
    const isShakePhase = cyclePos < SHAKE_PHASE_MS;
    const fade = isShakePhase ? Math.sin((cyclePos / SHAKE_PHASE_MS) * Math.PI) : 0;
    const offsetX = Math.sin(elapsed * SHAKE_SPEED) * SHAKE_AMPLITUDE * fade;

    if (this.titleImage) {
      const maxW = 950;
      const maxH = 500;
      const scale = Math.min(maxW / this.titleImage.width, maxH / this.titleImage.height, 1);
      const w = this.titleImage.width * scale;
      const h = this.titleImage.height * scale;
      ctx.save();
      ctx.translate(centerX + offsetX, centerY);
      ctx.drawImage(this.titleImage, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = theme.textMuted;
      ctx.font = `24px "${theme.fontFamily}"`;
      ctx.textAlign = 'center';
      ctx.fillText('(타이틀: assets/intro/title.png)', centerX + offsetX, centerY);
    }

    const barX = (width - LOADING_BAR_W) / 2;
    const barY = height - LOADING_AREA_BOTTOM_PAD - LOADING_BAR_H;
    const loadingTextY = barY - 22;
    ctx.font = `18px "${theme.fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeText('Now Loading...', centerX, loadingTextY);
    ctx.fillStyle = theme.textMuted;
    ctx.fillText('Now Loading...', centerX, loadingTextY);
    ctx.fillStyle = theme.slotFill;
    ctx.strokeStyle = theme.slotStroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(barX, barY, LOADING_BAR_W, LOADING_BAR_H, LOADING_BAR_R);
    ctx.fill();
    ctx.stroke();

    const duration = this.transitionAt - this.startTime;
    const progress = Math.min(1, (elapsed / duration) * 1.05);
    const fillW = (LOADING_BAR_W - 8) * progress;
    if (fillW > 0) {
      ctx.fillStyle = theme.btnAccent;
      ctx.beginPath();
      ctx.roundRect(barX + 4, barY + 2, fillW, LOADING_BAR_H - 4, LOADING_BAR_R - 2);
      ctx.fill();
    }
  }

  handleClick() {}
}
