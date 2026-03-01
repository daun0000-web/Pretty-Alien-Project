/**
 * 인트로 씬 - 간단한 컷신 시스템
 * 배경(번화가) + UFO(외계인) + 말풍선 텍스트, 클릭 시 다음 장면
 * 이미지 경로는 아래 ASSETS에서 교체 가능
 */
import { getTheme } from '../theme.js';

/** 컷신용 이미지 경로 (추후 리소스 교체 시 여기만 수정) */
const INTRO_ASSETS = {
  background: 'assets/intro/background.png',  // 지구 번화가 배경
  ufo: 'assets/intro/ufo.png',                 // UFO(안에서 밖을 바라보는 연출)
  arrowNext: 'assets/intro/arrow-next.png',   // 다음 대사 화살표 (없으면 삼각형으로 그림)
  arrowNextHover: 'assets/intro/arrow_next_hover.png',  // 호버 시
  arrowNextClick: 'assets/intro/arrow_next_click.png',   // 눌린 상태
  bubble: 'assets/intro/bubble.png',           // 말풍선 (9-slice 적용)
};

/** 말풍선 9-slice: 이미지 기준 상하좌우 고정 영역(px). 모서리는 유지, 중앙만 늘어남 */
const BUBBLE_SLICE_INSET = 760;

/** 장면별 말풍선 텍스트 (클릭 시 순서대로 진행) */
const CUTSCENE_FRAMES = [
  { text: '저기 봐… 저게 지구의 번화가구나.' },
  { text: '저 사람들처럼 변신하면 친구가 될 수 있을까?' },
  { text: '좋아. 인간의 모습으로 변신해 보자!' },
  { text: '외계인이 인간 친구를 만들 수 있도록 도와주세요!' },
];

/** 말풍선 밖에 따로 그리는 마지막 문구 (CUTSCENE_FRAMES 마지막 항목과 동기화) */
const LAST_FRAME_TEXT = CUTSCENE_FRAMES[CUTSCENE_FRAMES.length - 1].text;

const BUBBLE_PADDING = 20;
const BUBBLE_TAIL_OFFSET = 40;
const BUBBLE_LEFT = 40;
const BUBBLE_TOP = 40;
const FONT_SIZE = 25;
const LINE_HEIGHT = 32;
const MAX_BUBBLE_WIDTH = 320;

/** 말풍선 세로 비율 (1에 가까울수록 정사각형, 작을수록 납작) */
const BUBBLE_HEIGHT_RATIO = 0.65;

/** 말풍선 이미지 사용 시 하단 꼬리 때문에 텍스트를 위로 올리는 오프셋(px) */
const BUBBLE_TEXT_OFFSET_UP = 15;

/** UFO 둥실둥실 움직임: 주기(ms), 진폭(px) */
const UFO_FLOAT_PERIOD = 2400;
const UFO_FLOAT_AMPLITUDE = 24;

/** 다음 대사 화살표 버튼 크기(px) */
const ARROW_BUTTON_SIZE = 60; // 약 2배 축소 (120 → 60)

/** 말풍선 등장 전 대기 시간(ms). 이 시간이 지난 뒤 말풍선·화살표 표시 */
const BUBBLE_DELAY_MS = 1500;

/** 타이틀→인트로 전환 시 화이트 페이드 (결과 화면과 동일 타이밍) */
const FADE_IN_MS = 300;
const FADE_OUT_MS = 400;
const FULL_WHITE_MS = FADE_OUT_MS * 2;
const INTRO_FADE_TOTAL_MS = FADE_IN_MS + FULL_WHITE_MS + FADE_OUT_MS;

export class IntroScene {
  onEnter() {
    this.frameIndex = 0;
    this.enterTime = Date.now();
    this.bgImage = null;
    this.ufoImage = null;
    this.bubbleImage = null;
    this.arrowImage = null;
    this.arrowHoverImage = null;
    this.arrowClickImage = null;
    this.arrowRect = null; // 클릭 판정용
    this.arrowHovered = false;
    this.arrowPressed = false;
    // 타이틀에서 넘어올 때만 페이드인 재생 (다시하기 시에는 사용 안 함)
    this.fadeStartTime = this.manager.state.enteringIntroFromTitle ? Date.now() : null;
    if (this.manager.state.enteringIntroFromTitle) this.manager.state.enteringIntroFromTitle = false;
    this.manager.showSkipButton(true);
    this.loadAssets();
  }

  onExit() {
    this.manager.showSkipButton(false);
  }

  async loadAssets() {
    try {
      this.bgImage = await this.manager.loadImage(INTRO_ASSETS.background);
    } catch (_) {
      this.bgImage = null;
    }
    try {
      this.ufoImage = await this.manager.loadImage(INTRO_ASSETS.ufo);
    } catch (_) {
      this.ufoImage = null;
    }
    try {
      this.bubbleImage = await this.manager.loadImage(INTRO_ASSETS.bubble);
    } catch (_) {
      this.bubbleImage = null;
    }
    try {
      this.arrowImage = await this.manager.loadImage(INTRO_ASSETS.arrowNext);
    } catch (_) {
      this.arrowImage = null;
    }
    try {
      this.arrowHoverImage = await this.manager.loadImage(INTRO_ASSETS.arrowNextHover);
    } catch (_) {
      this.arrowHoverImage = null;
    }
    try {
      this.arrowClickImage = await this.manager.loadImage(INTRO_ASSETS.arrowNextClick);
    } catch (_) {
      this.arrowClickImage = null;
    }
  }

  update() {}

  draw() {
    const { ctx, width, height } = this.manager;

    // 마지막 문구가 나오면 건너뛰기 버튼 숨김 (화살표와 겹치지 않도록)
    this.manager.showSkipButton(this.frameIndex < CUTSCENE_FRAMES.length - 1);

    // 타이틀→인트로 페이드: 페이드 인 중에는 인트로를 그리지 않고, 흰색 100% 시점부터 인트로를 그린 뒤 페이드 아웃
    if (this.fadeStartTime != null) {
      const elapsed = Date.now() - this.fadeStartTime;
      if (elapsed >= INTRO_FADE_TOTAL_MS) {
        this.fadeStartTime = null;
      } else if (elapsed < FADE_IN_MS) {
        // 페이드 인 구간: 인트로 미노출, 타이틀 화면 위로 흰색만 겹침
        const whiteOpacity = elapsed / FADE_IN_MS;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = whiteOpacity;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
        return;
      } else {
        // 흰색 100% 이후: 인트로 콘텐츠를 그린 다음 위에 흰색 오버레이(페이드 아웃)
        this.drawBackground(ctx, width, height);
        this.drawUfo(ctx, width, height);
        const introElapsed = Date.now() - this.enterTime;
        if (introElapsed >= BUBBLE_DELAY_MS) {
          this.drawSpeechBubble(ctx, width, height);
          this.drawLastFrameText(ctx, width, height);
        } else {
          this.arrowRect = null;
        }
        let whiteOpacity = 1;
        if (elapsed >= FADE_IN_MS + FULL_WHITE_MS) {
          whiteOpacity = 1 - (elapsed - (FADE_IN_MS + FULL_WHITE_MS)) / FADE_OUT_MS;
        }
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = whiteOpacity;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
        return;
      }
    }

    this.drawBackground(ctx, width, height);
    this.drawUfo(ctx, width, height);
    const introElapsed = Date.now() - this.enterTime;
    if (introElapsed >= BUBBLE_DELAY_MS) {
      this.drawSpeechBubble(ctx, width, height);
      this.drawLastFrameText(ctx, width, height);
    } else {
      this.arrowRect = null;
    }
  }

  drawBackground(ctx, width, height) {
    const theme = getTheme();
    if (this.bgImage) {
      const scale = Math.max(width / this.bgImage.width, height / this.bgImage.height);
      const sw = this.bgImage.width;
      const sh = this.bgImage.height;
      const dw = sw * scale;
      const dh = sh * scale;
      ctx.drawImage(this.bgImage, 0, 0, sw, sh, (width - dw) / 2, (height - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = theme.accent + '26';
      ctx.fillRect(0, height * 0.5, width, height * 0.5);
      ctx.fillStyle = theme.textMuted;
      ctx.font = `18px "${theme.fontFamily}"`;
      ctx.textAlign = 'center';
      ctx.fillText('(배경: assets/intro/background.png)', width / 2, height - 60);
    }
  }

  drawUfo(ctx, width, height) {
    const theme = getTheme();
    // 가운데와 우하단 사이: 화면 중앙~오른쪽, 살짝 위로
    const ufoX = width * 0.68;
    const baseY = height * 0.48;
    // 사이즈 약 3배 (220*3, 140*3)
    const ufoW = 660;
    const ufoH = 420;

    // 인트로 내내 위아래로 천천히 둥실둥실
    const elapsed = Date.now() - (this.enterTime || 0);
    const floatOffset = Math.sin((elapsed / UFO_FLOAT_PERIOD) * Math.PI * 2) * UFO_FLOAT_AMPLITUDE;
    const ufoY = baseY + floatOffset;

    if (this.ufoImage) {
      const scale = Math.min(ufoW / this.ufoImage.width, ufoH / this.ufoImage.height);
      const dw = this.ufoImage.width * scale;
      const dh = this.ufoImage.height * scale;
      ctx.drawImage(this.ufoImage, ufoX - dw / 2, ufoY - dh / 2, dw, dh);
    } else {
      ctx.fillStyle = 'rgba(180, 220, 255, 0.9)';
      ctx.beginPath();
      ctx.ellipse(ufoX, ufoY, ufoW / 2, ufoH / 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = 'rgba(100, 150, 200, 0.5)';
      ctx.beginPath();
      ctx.ellipse(ufoX, ufoY - 45, ufoW / 3, 60, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = `16px "${theme.fontFamily}"`;
      ctx.textAlign = 'center';
      ctx.fillText('(UFO: assets/intro/ufo.png)', ufoX, ufoY + ufoH / 2 + 16);
    }
  }

  drawSpeechBubble(ctx, width, height) {
    const theme = getTheme();
    const frame = CUTSCENE_FRAMES[this.frameIndex];
    const text = frame?.text ?? '';
    const isLastFrame = this.frameIndex === CUTSCENE_FRAMES.length - 1 && text === LAST_FRAME_TEXT;

    // 마지막 문구는 말풍선 없이 drawLastFrameText에서 가운데 하단에 따로 그림
    if (isLastFrame) return;

    ctx.font = `${FONT_SIZE}px "${theme.fontFamily}"`;

    const lines = this.wrapText(ctx, text, MAX_BUBBLE_WIDTH);
    const lineCount = lines.length;
    const contentW = MAX_BUBBLE_WIDTH + BUBBLE_PADDING * 2;
    const contentH = lineCount * LINE_HEIGHT + BUBBLE_PADDING * 2;
    const maxBubble = Math.min(Math.max(contentW, contentH), width - BUBBLE_LEFT * 2);
    const bubbleWidth = maxBubble;
    const bubbleHeight = Math.max(contentH, Math.floor(maxBubble * BUBBLE_HEIGHT_RATIO));

    // 좌상단 고정
    const left = BUBBLE_LEFT;
    const top = BUBBLE_TOP;
    // 말풍선 꼬리: 우하단에서 UFO 방향(오른쪽 아래)으로
    const tailFromX = left + bubbleWidth - 50;
    const tailFromY = top + bubbleHeight;
    const tailToX = left + bubbleWidth - 20;
    const tailToY = top + bubbleHeight + BUBBLE_TAIL_OFFSET - 4;

    if (this.bubbleImage) {
      this.drawImage9Slice(ctx, this.bubbleImage, left, top, bubbleWidth, bubbleHeight, BUBBLE_SLICE_INSET);
    } else {
      ctx.fillStyle = theme.panelBg;
      ctx.strokeStyle = theme.panelBorder;
      ctx.lineWidth = 3;
      this.roundRect(ctx, left, top, bubbleWidth, bubbleHeight, 16);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(tailFromX, tailFromY);
      ctx.lineTo(tailToX, tailToY);
      ctx.lineTo(tailFromX + 28, tailFromY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = theme.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const textCenterX = left + bubbleWidth / 2;
    const textBlockH = lineCount * LINE_HEIGHT;
    const textCenterY = top + bubbleHeight / 2 - (this.bubbleImage ? BUBBLE_TEXT_OFFSET_UP : 0);
    const textFirstLineY = textCenterY - textBlockH / 2 + LINE_HEIGHT / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, textCenterX, textFirstLineY + i * LINE_HEIGHT);
    });

    // 말풍선 우하단에 다음 대사 화살표 버튼
    const arrowX = left + bubbleWidth - BUBBLE_PADDING - ARROW_BUTTON_SIZE / 2 - 25;
    const arrowY = top + bubbleHeight - BUBBLE_PADDING - ARROW_BUTTON_SIZE / 2 - 35;
    this.drawArrowButton(ctx, arrowX, arrowY);
  }

  /** 마지막 프레임 문구: 가운데 하단, 중앙정렬(여러 줄 가능), 흰색 외곽선, 우측에 화살표 버튼 */
  drawLastFrameText(ctx, width, height) {
    if (this.frameIndex !== CUTSCENE_FRAMES.length - 1) return;
    const frame = CUTSCENE_FRAMES[this.frameIndex];
    if (frame?.text !== LAST_FRAME_TEXT) return;

    const theme = getTheme();
    const lastTextSize = 36;
    const lastLineHeight = 56;
    const gap = 20;
    const arrowSize = ARROW_BUTTON_SIZE;
    const maxTextWidth = width - gap * 2 - arrowSize - 40;

    ctx.font = `${lastTextSize}px "${theme.fontFamily}"`;
    const lines = this.wrapText(ctx, LAST_FRAME_TEXT, maxTextWidth);
    const blockH = lines.length * lastLineHeight;
    const centerY = height - 72;
    const startY = centerY - blockH / 2 + lastLineHeight / 2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';

    let maxLineW = 0;
    lines.forEach((line, i) => {
      const w = ctx.measureText(line).width;
      if (w > maxLineW) maxLineW = w;
    });

    const t = (Date.now() - (this.enterTime || 0)) / 2000;
    const textOpacity = 0.3 + 0.7 * (Math.sin(t * Math.PI * 2) + 1) / 2;
    ctx.globalAlpha = textOpacity;

    lines.forEach((line, i) => {
      const x = width / 2;
      const y = startY + i * lastLineHeight;
      ctx.strokeText(line, x, y);
      ctx.fillStyle = theme.text;
      ctx.fillText(line, x, y);
    });

    ctx.globalAlpha = 1;
    const arrowX = width / 2 + maxLineW / 2 + gap + arrowSize / 2;
    const arrowY = centerY;
    this.drawArrowButton(ctx, arrowX, arrowY);
  }

  /**
   * 다음 대사 화살표 버튼 그리기 (이미지 없으면 오른쪽 방향 삼각형)
   * hover 시 arrow_next_hover.png, 클릭 시 arrow_next_click.png
   */
  drawArrowButton(ctx, centerX, centerY) {
    const s = ARROW_BUTTON_SIZE / 2;
    this.arrowRect = {
      left: centerX - s,
      top: centerY - s,
      width: ARROW_BUTTON_SIZE,
      height: ARROW_BUTTON_SIZE,
    };

    const theme = getTheme();
    let img = this.arrowImage;
    if (this.arrowPressed && this.arrowClickImage) img = this.arrowClickImage;
    else if (this.arrowHovered && this.arrowHoverImage) img = this.arrowHoverImage;
    if (img) {
      ctx.drawImage(img, this.arrowRect.left, this.arrowRect.top, ARROW_BUTTON_SIZE, ARROW_BUTTON_SIZE);
    } else {
      ctx.fillStyle = theme.panelBorder;
      ctx.beginPath();
      ctx.moveTo(centerX - s * 0.4, centerY - s * 0.8);
      ctx.lineTo(centerX - s * 0.4, centerY + s * 0.8);
      ctx.lineTo(centerX + s * 0.6, centerY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = theme.text;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  /**
   * 9-slice로 이미지 그리기. 모서리는 원본 비율 유지, 중앙·가장자리만 늘어남.
   * @param {CanvasRenderingContext2D} ctx
   * @param {HTMLImageElement} img
   * @param {number} dx - 목적지 left
   * @param {number} dy - 목적지 top
   * @param {number} dw - 목적지 너비
   * @param {number} dh - 목적지 높이
   * @param {number} inset - 이미지 상하좌우 고정 영역(px)
   */
  drawImage9Slice(ctx, img, dx, dy, dw, dh, inset) {
    const W = img.width;
    const H = img.height;
    const s = inset;
    const swC = W - 2 * s;
    const shC = H - 2 * s;
    if (swC <= 0 || shC <= 0) {
      ctx.drawImage(img, dx, dy, dw, dh);
      return;
    }
    const cw = Math.max(1, Math.min(s, Math.floor(dw / 2), Math.floor(dh / 2)));
    const ch = cw;
    const dwC = Math.max(1, dw - 2 * cw);
    const dhC = Math.max(1, dh - 2 * ch);

    const draw = (sx, sy, sw, sh, ddx, ddy, ddw, ddh) => {
      if (sw <= 0 || sh <= 0 || ddw <= 0 || ddh <= 0) return;
      ctx.drawImage(img, sx, sy, sw, sh, ddx, ddy, ddw, ddh);
    };

    draw(0, 0, s, s, dx, dy, cw, ch);
    draw(s, 0, swC, s, dx + cw, dy, dwC, ch);
    draw(W - s, 0, s, s, dx + dw - cw, dy, cw, ch);
    draw(0, s, s, shC, dx, dy + ch, cw, dhC);
    draw(s, s, swC, shC, dx + cw, dy + ch, dwC, dhC);
    draw(W - s, s, s, shC, dx + dw - cw, dy + ch, cw, dhC);
    draw(0, H - s, s, s, dx, dy + dh - ch, cw, ch);
    draw(s, H - s, swC, s, dx + cw, dy + dh - ch, dwC, ch);
    draw(W - s, H - s, s, s, dx + dw - cw, dy + dh - ch, cw, ch);
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let line = '';
    for (const ch of words) {
      const test = line + ch;
      const m = ctx.measureText(test);
      if (m.width > maxWidth && line.length > 0) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  isArrowHit(mx, my) {
    const r = this.arrowRect;
    if (!r) return false;
    return mx >= r.left && mx <= r.left + r.width && my >= r.top && my <= r.top + r.height;
  }

  handleMouseMove(mx, my) {
    const { width, height } = this.manager;
    if (mx < 0 || my < 0 || mx > width || my > height) {
      this.arrowHovered = false;
      return;
    }
    this.arrowHovered = this.isArrowHit(mx, my);
  }

  handleMouseDown(mx, my) {
    if (this.isArrowHit(mx, my)) this.arrowPressed = true;
  }

  handleMouseUp(mx, my) {
    if (this.arrowPressed && this.isArrowHit(mx, my)) {
      this.frameIndex += 1;
      this.arrowHovered = false; // 프레임 전환 시 hover 초기화 (다음 프레임에서 잘못 hover 표시 방지)
      if (this.frameIndex >= CUTSCENE_FRAMES.length) {
        this.manager.switchScene('game');
      }
    }
    this.arrowPressed = false;
  }

  handleClick(mx, my) {
    if (mx === -1 && my === -1) {
      this.manager.switchScene('game');
      return;
    }
    if (this.isArrowHit(mx, my)) return;
  }
}
