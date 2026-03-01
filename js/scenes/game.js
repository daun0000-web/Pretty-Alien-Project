/**
 * 파츠 선택 게임 씬 (6라운드)
 * - 1단계: 피부색 루프, 클릭 시 선택
 * - 2~4단계: 헤어/눈/입 슬롯머신 한 화면
 * - 5~6단계: 상의/하의 슬롯머신 한 화면
 * - 슬롯: 멈추면 선택된 하나만 확실히 표시, 파츠명 미표시
 */

import {
  PART_ORDER,
  PART_LABELS,
  PART_TYPES,
  IMAGE_USAGE_KEYS,
  FALLBACK_IMAGE_PATH,
  getPartOptions,
  getPartImagePath,
  drawPartOption,
} from '../data/parts.js';
import { getTheme } from '../theme.js';

/** 텍스트 외곽선: 일반 흰색, 연노란(accent) 텍스트는 #821e41 */
const TEXT_OUTLINE_WHITE = '#ffffff';
const TEXT_OUTLINE_ACCENT = '#821e41';
const TEXT_OUTLINE_WIDTH = 3;

const TITLE_HEIGHT = 80;

/** 1단계 피부색: 색상이 바뀌는 간격(ms) */
const SKIN_CYCLE_MS = 120;

/** 2~4단계: 헤어·눈·입 */
const SLOT_PARTS_2_4 = [PART_TYPES.HAIR, PART_TYPES.EYES, PART_TYPES.MOUTH];
/** 5~6단계: 상의·하의 */
const SLOT_PARTS_5_6 = [PART_TYPES.TOP, PART_TYPES.BOTTOM];

/** 슬롯 한 칸 높이 (썸네일이 상하로 도는 영역) */
const SLOT_CELL_HEIGHT = 170;
/** 슬롯 가로 크기 */
const SLOT_WIDTH = 190;
const SLOT_GAP = 28;
const SLOT_SCROLL_SPEED = 0.00328;
/** 슬롯 제목('피부색' 등) 위치: 슬롯 상단에서 위로 띄울 픽셀 */
const SLOT_TITLE_OFFSET_ABOVE = 28;
/** 추후 슬롯 프레임/디자인 이미지 교체용 (null이면 현재 사각형으로만 그림) */
const SLOT_FRAME_IMAGE_PATH = null;
/** 슬롯 라운드 배경 이미지 (없으면 SLOT_BG_COLOR 단색 사용) */
const SLOT_BG_IMAGE_PATH = 'assets/intro/slot_bg.png';

/** 슬롯 상단 유리 하이라이트: 상단 30% 영역 비율 */
const SLOT_GLASS_TOP_RATIO = 0.3;
/** 슬롯 내부 그림자: 가장자리 어두운 보라 */
const SLOT_INNER_SHADOW_COLOR = 'rgba(40, 28, 55, 0.26)';
const SLOT_INNER_SHADOW_INSET = 18;
/** 배경 radial 펄스: 주기(ms), 밝기 변동 폭(0~1) */
const BG_PULSE_PERIOD_MS = 3500;
const BG_PULSE_AMOUNT = 0.025;
/** 슬롯 멈춤 시 scale bounce: 지속(ms) */
const SLOT_BOUNCE_DURATION_MS = 150;

/** 슬롯 배경 단색 */
const SLOT_BG_COLOR = '#8162c1';
/** 슬롯 안쪽 배경 (연보라 단색) */
const SLOT_INNER_BG = '#e3d7fc';
/** 슬롯 프레임 굵은 테두리 */
const SLOT_FRAME_BORDER_COLOR = '#825bd2';
const SLOT_FRAME_BORDER_WIDTH = 10;
/** 슬롯 프레임 위 추가 외곽선 (얇게) */
const SLOT_FRAME_OUTER_BORDER_COLOR = '#392466';
const SLOT_FRAME_OUTER_BORDER_WIDTH = 4;
/** 파츠 이미지가 테두리 안쪽으로만 보이도록 클립 인셋(px) */
const SLOT_CONTENT_CLIP_INSET = 8;

/** 슬롯 라운드 설정: [ partTypes, 제목 ] (단계명 없이 파츠명만) */
function getSlotRoundConfig(roundIndex) {
  if (roundIndex === 0) return { partTypes: [PART_TYPES.SKIN], title: '피부색' };
  if (roundIndex === 1) return { partTypes: SLOT_PARTS_2_4, title: '헤어 · 눈 · 입' };
  if (roundIndex === 4) return { partTypes: SLOT_PARTS_5_6, title: '상의 · 하의' };
  return null;
}

/** 배열 셔플 (Fisher–Yates). 파츠 개수 증감과 무관하게 동일 적용 */
function shuffleArray(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export class GameScene {
  onEnter() {
    this.roundIndex = this.manager.state.partsRoundIndex ?? 0;
    this.selectedInRound = null;
    this.skinSelectedAt = 0;
    this.partType = PART_ORDER[this.roundIndex];
    this.options = getPartOptions(this.partType);
    this.skinRoundStartTime = this.isSkinRound() ? Date.now() : 0;
    this.loadedImages = [];
    const slotConfig = getSlotRoundConfig(this.roundIndex);
    if (slotConfig) {
      this.initSlotRound(slotConfig);
    } else {
      // 피부색 포함 모든 1단계·그리드 라운드에서 슬롯/썸네일 이미지 로드
      this.loadImagesForOptions();
    }
  }

  isSkinRound() {
    return this.partType === PART_TYPES.SKIN;
  }

  isSlotRound() {
    return getSlotRoundConfig(this.roundIndex) != null;
  }

  getSlotConfig() {
    return getSlotRoundConfig(this.roundIndex);
  }

  isSkinSlotRound() {
    return this.slotCount === 1 && this.slotPartTypes[0] === PART_TYPES.SKIN;
  }

  getSlotDimensions() {
    return { width: SLOT_WIDTH, cellHeight: SLOT_CELL_HEIGHT };
  }

  initSlotRound(config) {
    this.slotPartTypes = config.partTypes;
    this.slotTitle = config.title;
    this.slotCount = config.partTypes.length;
    this.slotOptions = config.partTypes.map((t) => {
      const base =
        t === PART_TYPES.SKIN ? getPartOptions(t) : shuffleArray(getPartOptions(t));
      return [...base, ...base];
    });
    this.slotScrollOffset = this.slotOptions.map((opts, idx) =>
      this.slotPartTypes[idx] === PART_TYPES.SKIN ? 0 : Math.random() * (opts.length || 1)
    );
    this.slotStopped = this.slotOptions.map(() => false);
    this.slotStoppedAt = this.slotOptions.map(() => 0);
    this.slotSelectedIndex = this.slotOptions.map(() => 0);
    this.nextSlotToStop = 0;
    this.slotRoundComplete = false;
    this.slotRoundCompleteAt = 0;
    this.slotLoadedImages = this.slotOptions.map(() => []);
    this.slotFrameImage = null;
    this.slotBgImage = null;
    if (SLOT_FRAME_IMAGE_PATH) {
      this.manager.loadImage(SLOT_FRAME_IMAGE_PATH).then((img) => (this.slotFrameImage = img)).catch(() => {});
    }
    if (SLOT_BG_IMAGE_PATH) {
      this.manager.loadImage(SLOT_BG_IMAGE_PATH).then((img) => (this.slotBgImage = img)).catch(() => {});
    }
    this.loadSlotImages();
  }

  async loadSlotImages() {
    for (let i = 0; i < this.slotOptions.length; i++) {
      for (const opt of this.slotOptions[i]) {
        const path = getPartImagePath(opt, IMAGE_USAGE_KEYS.SLOT);
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
        this.slotLoadedImages[i].push({ option: opt, img });
      }
    }
  }

  getCurrentSkinIndex() {
    if (!this.isSkinRound() || this.options.length === 0) return 0;
    const elapsed = Date.now() - this.skinRoundStartTime;
    return Math.floor(elapsed / SKIN_CYCLE_MS) % this.options.length;
  }

  async loadImagesForOptions() {
    for (const opt of this.options) {
      const path = getPartImagePath(opt, IMAGE_USAGE_KEYS.SLOT);
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
      this.loadedImages.push({ option: opt, img });
    }
  }

  update(deltaTime) {
    if (this.isSlotRound()) {
      if (this.slotRoundComplete) {
        if (this.slotRoundCompleteAt === 0) this.slotRoundCompleteAt = Date.now();
        const waitMs = 1000;
        if (Date.now() - this.slotRoundCompleteAt < waitMs) return;
        this.slotPartTypes.forEach((partType, i) => {
          const opts = this.slotOptions[i];
          const idx = this.slotSelectedIndex[i];
          if (opts[idx]) this.manager.state.selectedParts[partType] = opts[idx].id;
        });
        this.manager.state.partsRoundIndex =
          this.roundIndex === 0 ? 1 : this.roundIndex === 1 ? 4 : 6;
        if (this.manager.state.partsRoundIndex >= PART_ORDER.length) {
          this.manager.switchScene('result');
        } else {
          this.manager.switchScene('game');
        }
        return;
      }
      this.slotOptions.forEach((opts, i) => {
        if (this.slotStopped[i] || !opts.length) return;
        const len = opts.length;
        const isSkinSlot = this.slotPartTypes[i] === PART_TYPES.SKIN;
        if (isSkinSlot) {
          this.slotScrollOffset[i] -= SLOT_SCROLL_SPEED * deltaTime;
          if (this.slotScrollOffset[i] < -1e6) this.slotScrollOffset[i] += len * Math.ceil(-this.slotScrollOffset[i] / len);
        } else {
          this.slotScrollOffset[i] += SLOT_SCROLL_SPEED * deltaTime;
          if (this.slotScrollOffset[i] > 1e6) this.slotScrollOffset[i] %= len;
        }
      });
      return;
    }
    if (this.selectedInRound === null) return;
    if (this.isSkinRound()) {
      if (this.skinSelectedAt === 0) this.skinSelectedAt = Date.now();
      if (Date.now() - this.skinSelectedAt < 1000) return;
    }
    this.manager.state.selectedParts[this.partType] = this.options[this.selectedInRound].id;
    this.manager.state.partsRoundIndex = this.roundIndex + 1;
    if (this.roundIndex + 1 >= PART_ORDER.length) {
      this.manager.switchScene('result');
    } else {
      this.manager.switchScene('game');
    }
  }

  draw() {
    const { ctx, width, height } = this.manager;
    const theme = getTheme();

    if (this.isSlotRound()) {
      if (this.slotBgImage) {
        const iw = this.slotBgImage.naturalWidth || this.slotBgImage.width;
        const ih = this.slotBgImage.naturalHeight || this.slotBgImage.height;
        const scale = Math.max(width / iw, height / ih);
        const drawW = iw * scale;
        const drawH = ih * scale;
        const dx = (width - drawW) / 2;
        const dy = (height - drawH) / 2;
        ctx.drawImage(this.slotBgImage, 0, 0, iw, ih, dx, dy, drawW, drawH);
      } else {
        ctx.fillStyle = SLOT_BG_COLOR;
        ctx.fillRect(0, 0, width, height);
      }

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.max(width, height) * 0.8;
      const t = Date.now() / BG_PULSE_PERIOD_MS * 2 * Math.PI;
      const pulse = BG_PULSE_AMOUNT * (1 + Math.sin(t));
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      g.addColorStop(0, `rgba(255,255,255,${pulse})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
      this.drawSlotRound(ctx, width, height);
      return;
    }

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    const label = PART_LABELS[this.partType];
    ctx.fillStyle = theme.text;
    ctx.font = `bold 28px "${theme.fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = TEXT_OUTLINE_WHITE;
    ctx.lineWidth = TEXT_OUTLINE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.strokeText(label, width / 2, 50);
    ctx.fillText(label, width / 2, 50);

    if (this.isSkinRound()) {
      this.drawSkinRound(ctx, width, height);
    } else {
      this.drawGridRound(ctx, width, height);
    }
  }

  /** 슬롯 한 칸에 옵션 1개만 그리기 (slotImagePath 기준 로드된 이미지 또는 색상) */
  drawSlotCellContent(ctx, opt, img, x, y, size) {
    const theme = getTheme();
    const pad = 6;
    const inner = size - pad * 2;
    const cx = x + size / 2;
    const cy = y + size / 2;
    if (img) {
      const scale = Math.min(inner / img.width, inner / img.height, 1);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
    } else {
      ctx.fillStyle = opt.color || theme.textMuted;
      ctx.strokeStyle = theme.slotStroke;
      ctx.lineWidth = 2;
      ctx.fillRect(x + pad, y + pad, inner, inner);
      ctx.strokeRect(x + pad, y + pad, inner, inner);
    }
  }

  /** 슬롯 멈춤 후 150ms 내 bounce scale (1 → 1.08 → 0.98 → 1) */
  getSlotBounceScale(slotIdx) {
    if (!this.slotStopped[slotIdx] || !this.slotStoppedAt) return 1;
    const elapsed = Date.now() - this.slotStoppedAt[slotIdx];
    if (elapsed >= SLOT_BOUNCE_DURATION_MS) return 1;
    const t = elapsed / SLOT_BOUNCE_DURATION_MS;
    if (t < 0.2) return 1 + (1.08 - 1) * (t / 0.2);
    if (t < 0.55) return 1.08 + (0.98 - 1.08) * ((t - 0.2) / 0.35);
    return 0.98 + (1 - 0.98) * ((t - 0.55) / 0.45);
  }

  drawSlotRound(ctx, width, height) {
    const theme = getTheme();
    const { width: slotW, cellHeight: slotH } = this.getSlotDimensions();
    const totalSlotW = this.slotCount * slotW + (this.slotCount - 1) * SLOT_GAP;
    const startX = (width - totalSlotW) / 2;
    const slotTop = (height - slotH) / 2 + 20;
    const slotCenterX = startX + totalSlotW / 2;
    const titleY = slotTop - SLOT_TITLE_OFFSET_ABOVE;

    ctx.fillStyle = theme.text;
    ctx.font = `bold 40px "${theme.fontFamily}"`;
    ctx.textAlign = 'center';
    ctx.strokeStyle = TEXT_OUTLINE_WHITE;
    ctx.lineWidth = TEXT_OUTLINE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.strokeText(this.slotTitle, slotCenterX, titleY);
    ctx.fillText(this.slotTitle, slotCenterX, titleY);

    for (let i = 0; i < this.slotCount; i++) {
      const opts = this.slotOptions[i];
      if (!opts.length) continue;
      const x = startX + i * (slotW + SLOT_GAP);
      const y = slotTop;
      const stopped = this.slotStopped[i];
      const scroll = this.slotScrollOffset[i];
      const len = opts.length;
      const isSkinSlot = this.slotPartTypes[i] === PART_TYPES.SKIN;
      const selectedIdx = stopped
        ? this.slotSelectedIndex[i]
        : isSkinSlot
          ? (len - 1 - (((Math.floor(scroll) + 1) % len + len) % len) + len) % len
          : ((Math.round(scroll) % len) + len) % len;
      const selectedOpt = opts[selectedIdx];
      const bounceScale = this.getSlotBounceScale(i);
      const slotCx = x + slotW / 2;
      const slotCy = y + slotH / 2;

      ctx.save();
      if (bounceScale !== 1) {
        ctx.translate(slotCx, slotCy);
        ctx.scale(bounceScale, bounceScale);
        ctx.translate(-slotCx, -slotCy);
      }

      if (SLOT_FRAME_IMAGE_PATH && this.slotFrameImage) {
        ctx.drawImage(this.slotFrameImage, x, y, slotW, slotH);
        ctx.strokeStyle = SLOT_FRAME_BORDER_COLOR;
        ctx.lineWidth = SLOT_FRAME_BORDER_WIDTH;
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.stroke();
        ctx.strokeStyle = SLOT_FRAME_OUTER_BORDER_COLOR;
        ctx.lineWidth = SLOT_FRAME_OUTER_BORDER_WIDTH;
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.clip();
      } else {
        ctx.fillStyle = SLOT_INNER_BG;
        ctx.strokeStyle = stopped ? theme.slotStrokeActive : theme.slotStroke;
        ctx.lineWidth = stopped ? 4 : 3;
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = SLOT_FRAME_BORDER_COLOR;
        ctx.lineWidth = SLOT_FRAME_BORDER_WIDTH;
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.stroke();
        ctx.strokeStyle = SLOT_FRAME_OUTER_BORDER_COLOR;
        ctx.lineWidth = SLOT_FRAME_OUTER_BORDER_WIDTH;
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.roundRect(x, y, slotW, slotH, 12);
        ctx.clip();
      }

      const clipInset = SLOT_CONTENT_CLIP_INSET;
      const clipR = Math.max(0, 12 - clipInset);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + clipInset, y + clipInset, slotW - clipInset * 2, slotH - clipInset * 2, clipR);
      ctx.clip();

      if (stopped) {
        const pad = 8;
        const boxSize = Math.min(slotW, slotH) - pad * 2;
        const boxX = x + (slotW - boxSize) / 2;
        const boxY = y + (slotH - boxSize) / 2;
        const entry = this.slotLoadedImages?.[i]?.find((e) => e.option === selectedOpt);
        const img = entry?.img ?? null;
        this.drawSlotCellContent(ctx, selectedOpt, img, boxX, boxY, boxSize);
      } else {
        const centerY = y + slotH / 2;
        for (let k = 0; k <= 2; k++) {
          let optIdx, drawY;
          if (isSkinSlot) {
            const floorScroll = Math.floor(scroll);
            const frac = scroll - floorScroll;
            const base = ((floorScroll + k) % len + len) % len;
            optIdx = (len - 1 - base + len) % len;
            drawY = centerY + (k - 1 - frac) * slotH;
          } else {
            const v = Math.floor(scroll) - 1 + k;
            optIdx = ((v % len) + len) % len;
            drawY = centerY - (v - scroll) * slotH;
          }
          const opt = opts[optIdx];
          const cellY = drawY - slotH / 2;
          const pad = 6;
          const boxSize = slotH - pad * 2;
          const boxX = x + (slotW - boxSize) / 2;
          const entry = this.slotLoadedImages?.[i]?.find((e) => e.option === opt);
          const img = entry?.img ?? null;
          this.drawSlotCellContent(ctx, opt, img, boxX, cellY + pad, boxSize);
        }
      }

      ctx.restore();

      if (!SLOT_FRAME_IMAGE_PATH || !this.slotFrameImage) {
        const ins = SLOT_INNER_SHADOW_INSET;
        const lgTop = ctx.createLinearGradient(x, y, x, y + ins);
        lgTop.addColorStop(0, SLOT_INNER_SHADOW_COLOR);
        lgTop.addColorStop(1, 'transparent');
        ctx.fillStyle = lgTop;
        ctx.fillRect(x, y, slotW, ins);
        const lgBot = ctx.createLinearGradient(x, y + slotH - ins, x, y + slotH);
        lgBot.addColorStop(0, 'transparent');
        lgBot.addColorStop(1, SLOT_INNER_SHADOW_COLOR);
        ctx.fillStyle = lgBot;
        ctx.fillRect(x, y + slotH - ins, slotW, ins);
        const lgLeft = ctx.createLinearGradient(x, y, x + ins, y);
        lgLeft.addColorStop(0, SLOT_INNER_SHADOW_COLOR);
        lgLeft.addColorStop(1, 'transparent');
        ctx.fillStyle = lgLeft;
        ctx.fillRect(x, y, ins, slotH);
        const lgRight = ctx.createLinearGradient(x + slotW - ins, y, x + slotW, y);
        lgRight.addColorStop(0, 'transparent');
        lgRight.addColorStop(1, SLOT_INNER_SHADOW_COLOR);
        ctx.fillStyle = lgRight;
        ctx.fillRect(x + slotW - ins, y, ins, slotH);
      }
      ctx.restore();

      ctx.save();
      if (bounceScale !== 1) {
        ctx.translate(slotCx, slotCy);
        ctx.scale(bounceScale, bounceScale);
        ctx.translate(-slotCx, -slotCy);
      }
      ctx.beginPath();
      ctx.roundRect(x, y, slotW, slotH, 12);
      ctx.clip();
      const glassH = slotH * SLOT_GLASS_TOP_RATIO;
      const lgGlass = ctx.createLinearGradient(x, y, x, y + glassH);
      lgGlass.addColorStop(0, 'rgba(255,255,255,0.5)');
      lgGlass.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = lgGlass;
      ctx.fillRect(x, y, slotW, glassH);
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();

      if (this.slotCount > 1 && this.nextSlotToStop === i && !stopped) {
        ctx.fillStyle = theme.accent;
        ctx.font = `16px "${theme.fontFamily}"`;
        ctx.strokeStyle = TEXT_OUTLINE_ACCENT;
        ctx.lineWidth = TEXT_OUTLINE_WIDTH;
        ctx.lineJoin = 'round';
        ctx.strokeText('클릭하여 멈추기', x + slotW / 2, y + slotH + 25);
        ctx.fillText('클릭하여 멈추기', x + slotW / 2, y + slotH + 25);
      }
    }

    ctx.fillStyle = theme.textMuted;
    ctx.font = `22px "${theme.fontFamily}"`;
    const slotHint = this.slotCount === 1 ? '클릭하여 멈추세요' : '왼쪽에서부터 순서대로 클릭해 멈추세요';
    const slotHintText = this.slotRoundComplete ? '잠시 후 다음으로...' : slotHint;
    ctx.strokeStyle = TEXT_OUTLINE_WHITE;
    ctx.lineWidth = TEXT_OUTLINE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.strokeText(slotHintText, width / 2, height - 32);
    ctx.fillText(slotHintText, width / 2, height - 32);
  }

  drawSkinRound(ctx, width, height) {
    if (this.options.length === 0) return;
    const idx = this.selectedInRound !== null ? this.selectedInRound : this.getCurrentSkinIndex();
    const opt = this.options[idx];
    const cx = width / 2;
    const cy = height / 2 - 20;
    const radius = Math.min(width, height) * 0.32;
    const boxSize = radius * 2;

    const entry = this.loadedImages?.find((e) => e.option === opt);
    const img = entry?.img ?? null;

    if (img) {
      const scale = Math.min(boxSize / img.width, boxSize / img.height, 1);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
    } else {
      ctx.fillStyle = opt.color || '#888';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const skinHint = this.selectedInRound !== null ? '잠시 후 다음으로...' : '원하는 피부가 나오면 클릭하세요';
    ctx.fillStyle = getTheme().text;
    ctx.font = `20px "${getTheme().fontFamily}"`;
    ctx.strokeStyle = TEXT_OUTLINE_WHITE;
    ctx.lineWidth = TEXT_OUTLINE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.strokeText(skinHint, width / 2, height - 50);
    ctx.fillText(skinHint, width / 2, height - 50);
  }

  drawGridRound(ctx, width, height) {
    const theme = getTheme();
    const COLS = 5;
    const TILE_PADDING = 12;
    const contentTop = TITLE_HEIGHT;
    const contentHeight = height - contentTop - 60;
    const rows = Math.ceil(this.options.length / COLS);
    const tileW = (width - TILE_PADDING * (COLS + 1)) / COLS;
    const tileH = (contentHeight - TILE_PADDING * (rows + 1)) / rows;
    const cellSize = Math.min(tileW, tileH, 120);
    const totalGridW = COLS * cellSize + (COLS + 1) * TILE_PADDING;
    const totalGridH = rows * cellSize + (rows + 1) * TILE_PADDING;
    const offsetX = (width - totalGridW) / 2 + TILE_PADDING;
    const offsetY = contentTop + (contentHeight - totalGridH) / 2 + TILE_PADDING;

    this.options.forEach((opt, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = offsetX + col * (cellSize + TILE_PADDING);
      const y = offsetY + row * (cellSize + TILE_PADDING);

      ctx.fillStyle = theme.slotFill;
      ctx.strokeStyle = theme.slotStroke;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x, y, cellSize, cellSize, 8);
      ctx.fill();
      ctx.stroke();

      const entry = this.loadedImages.find((e) => e.option === opt);
      const img = entry?.img ?? null;
      drawPartOption(ctx, opt, img, x, y, cellSize);
    });

    ctx.fillStyle = theme.textMuted;
    ctx.font = `18px "${theme.fontFamily}"`;
    ctx.strokeStyle = TEXT_OUTLINE_WHITE;
    ctx.lineWidth = TEXT_OUTLINE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.strokeText('원하는 항목을 클릭하세요', width / 2, height - 24);
    ctx.fillText('원하는 항목을 클릭하세요', width / 2, height - 24);
  }

  getSlotIndexAt(mx, my) {
    const { width, height } = this.manager;
    const { width: slotW, cellHeight: slotH } = this.getSlotDimensions();
    const totalSlotW = this.slotCount * slotW + (this.slotCount - 1) * SLOT_GAP;
    const startX = (width - totalSlotW) / 2;
    const slotTop = (height - slotH) / 2 + 20;

    for (let i = 0; i < this.slotCount; i++) {
      const x = startX + i * (slotW + SLOT_GAP);
      if (mx >= x && mx <= x + slotW && my >= slotTop && my <= slotTop + slotH) return i;
    }
    return -1;
  }

  getOptionIndexAt(mx, my) {
    const { width, height } = this.manager;
    const COLS = 5;
    const TILE_PADDING = 12;
    const contentTop = TITLE_HEIGHT;
    const contentHeight = height - contentTop - 60;
    const rows = Math.ceil(this.options.length / COLS);
    const tileW = (width - TILE_PADDING * (COLS + 1)) / COLS;
    const tileH = (contentHeight - TILE_PADDING * (rows + 1)) / rows;
    const cellSize = Math.min(tileW, tileH, 120);
    const totalGridW = COLS * cellSize + (COLS + 1) * TILE_PADDING;
    const totalGridH = rows * cellSize + (rows + 1) * TILE_PADDING;
    const offsetX = (width - totalGridW) / 2 + TILE_PADDING;
    const offsetY = contentTop + (contentHeight - totalGridH) / 2 + TILE_PADDING;

    for (let i = 0; i < this.options.length; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = offsetX + col * (cellSize + TILE_PADDING);
      const y = offsetY + row * (cellSize + TILE_PADDING);
      if (mx >= x && mx <= x + cellSize && my >= y && my <= y + cellSize) return i;
    }
    return -1;
  }

  handleClick(mx, my) {
    if (mx < 0 && my < 0) return;
    if (this.isSlotRound()) {
      const slotIdx = this.getSlotIndexAt(mx, my);
      if (slotIdx < 0 || this.slotStopped[slotIdx] || this.nextSlotToStop !== slotIdx) return;
      const opts = this.slotOptions[slotIdx];
      if (!opts.length) return;
      this.slotStopped[slotIdx] = true;
      this.slotStoppedAt[slotIdx] = Date.now();
      const len = opts.length;
      const isSkinSlot = this.slotPartTypes[slotIdx] === PART_TYPES.SKIN;
      this.slotSelectedIndex[slotIdx] = isSkinSlot
        ? (len - 1 - (((Math.floor(this.slotScrollOffset[slotIdx]) + 1) % len + len) % len) + len) % len
        : ((Math.round(this.slotScrollOffset[slotIdx]) % len) + len) % len;
      this.nextSlotToStop++;
      if (this.nextSlotToStop >= this.slotCount) {
        this.slotRoundComplete = true;
        this.slotRoundCompleteAt = 0;
      }
      return;
    }
    if (this.isSkinRound()) {
      this.selectedInRound = this.getCurrentSkinIndex();
      return;
    }
    const idx = this.getOptionIndexAt(mx, my);
    if (idx >= 0) this.selectedInRound = idx;
  }
}
