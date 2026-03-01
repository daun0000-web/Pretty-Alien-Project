/**
 * CSS 변수 기반 테마 (색상만 읽어서 캔버스 등에서 사용)
 * style.css의 :root 변수 변경 시 자동 반영됨.
 */

/** @font-face와 동일한 이름. 캔버스 ctx.font는 이 값만 사용해야 폰트가 적용됨. */
export const CANVAS_FONT_FAMILY = 'Pinkfong Baby Shark';

function getCssVar(name, fallback = '#000') {
  if (typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** 한 번 읽어서 캐시 (페이지 로드 후 CSS 적용된 시점에 사용) */
export function getTheme() {
  return {
    fontFamily: CANVAS_FONT_FAMILY,
    bg: getCssVar('--bg-main', '#E6D6FF'),
    text: getCssVar('--text', '#3A2E5E'),
    textMuted: getCssVar('--text-muted', '#5a4d7a'),
    accent: getCssVar('--accent', '#FFF4A3'),
    btnAccent: getCssVar('--btn-accent', '#C8A2FF'),
    panelBg: getCssVar('--panel-bg', '#f5eeff'),
    panelBorder: getCssVar('--panel-border', '#3A2E5E'),
    slotFill: getCssVar('--slot-fill', 'rgba(58, 46, 94, 0.06)'),
    slotStroke: getCssVar('--slot-stroke', 'rgba(58, 46, 94, 0.25)'),
    slotStrokeActive: getCssVar('--slot-stroke-active', 'rgba(200, 162, 255, 0.8)'),
    gradeS: getCssVar('--grade-s', '#e6b800'),
    gradeA: getCssVar('--grade-a', '#8899aa'),
    gradeB: getCssVar('--grade-b', '#b87333'),
    gradeC: getCssVar('--grade-c', '#8b5a9e'),
    gradeD: getCssVar('--grade-d', '#6b5b7a'),
  };
}
