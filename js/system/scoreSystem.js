/**
 * 점수 계산 시스템 (4단계 등급: S / A / B / C)
 * - 모든 수치는 scoreConfig에서 밸런스 조절
 */

import { PART_ORDER, PARTS_DATA, findOptionById } from '../data/parts.js';

/** 밸런스 조절용 설정 (숫자만 바꿔서 조정) */
export const scoreConfig = {
  skin: {
    normalSetIdMax: 5,
    strangePenalty: -15,
    bombPenalty: -65,
  },

  face: {
    diff0Bonus: 40,
    diff1_2Bonus: 20,
    diff3PlusPenalty: -5,
    strangePenalty: -30,
    bombPenalty: -60,
  },

  outfit: {
    sameSetIdBonus: 80,
    diff1Bonus: 15,
    diff2PlusPenalty: -5,
    strangePenalty: -10,
    bombPenalty: -40,
  },

  // 🔥 등급 기준 (D는 C 미만일 때만 → C 기준을 낮추면 D 확률 감소)
  gradeThresholds: {
    S: 110,
    A: 60,
    B: 10,
    C: -60,
  },

  // 🔥 등급 → 결과키 매핑
  resultKeys: {
    S: 'S',
    A: 'A',
    B: 'B',
    C: 'C',
    D: 'D',
  },
};

/**
 * 선택 결과로 옵션 객체 배열 반환 (없으면 null)
 */
function getSelectedOptions(selectedParts, partsData) {
  return PART_ORDER.map((partType) => {
    const id = selectedParts[partType];
    return id ? findOptionById(partsData, partType, id) : null;
  });
}

function scoreSkin(opt, cfg) {
  if (!opt) return 0;
  if (opt.type === 'bomb') return cfg.skin.bombPenalty;
  if (opt.setId >= 1 && opt.setId <= cfg.skin.normalSetIdMax) return 0;
  return cfg.skin.strangePenalty;
}

/**
 * 헤어/눈/입: 세 파츠 setId 차이 (max - min). 0→높은 가산, 1~2→소폭 가산, 3+→감점. bomb 있으면 큰 감점
 */
function scoreFace(hairOpt, eyesOpt, mouthOpt, cfg) {
  const opts = [hairOpt, eyesOpt, mouthOpt].filter(Boolean);
  for (const o of opts) if (o.type === 'bomb') return cfg.face.bombPenalty;
  if (opts.length < 3) return 0;
  const setIds = opts.map((o) => o.setId);
  const diff = Math.max(...setIds) - Math.min(...setIds);
  if (diff === 0) return cfg.face.diff0Bonus;
  if (diff <= 2) return cfg.face.diff1_2Bonus;
  return cfg.face.diff3PlusPenalty;
}

/**
 * 상의/하의: setId 동일→큰 가산, 1차이→약간 가산, 2+→큰 감점. bomb→매우 큰 감점
 */
function scoreOutfit(topOpt, bottomOpt, cfg) {
  if (!topOpt || !bottomOpt) return 0;
  if (topOpt.type === 'bomb' || bottomOpt.type === 'bomb') return cfg.outfit.bombPenalty;
  const diff = Math.abs(topOpt.setId - bottomOpt.setId);
  if (diff === 0) return cfg.outfit.sameSetIdBonus;
  if (diff === 1) return cfg.outfit.diff1Bonus;
  return cfg.outfit.diff2PlusPenalty;
}

/**
 * 최종 점수에 따른 등급 (S / A / B / C / D)
 */
function getGrade(total, cfg) {
  if (total >= cfg.gradeThresholds.S) return 'S';
  if (total >= cfg.gradeThresholds.A) return 'A';
  if (total >= cfg.gradeThresholds.B) return 'B';
  if (total >= cfg.gradeThresholds.C) return 'C';
  return 'D';
}

/**
 * 선택된 파츠로 점수 계산 및 등급·결과키 반환
 * @param {Object} selectedParts - { skin: 'skin_01', hair: 'hair_02', ... }
 * @param {Object} [partsData=PARTS_DATA] - 파츠 데이터
 * @returns {{ total: number, breakdown: Object, rank: 'S'|'A'|'B'|'C', resultKey: string }}
 */
export function calculateScore(selectedParts, partsData = PARTS_DATA) {
  const cfg = scoreConfig;
  const [skinOpt, hairOpt, eyesOpt, mouthOpt, topOpt, bottomOpt] = getSelectedOptions(
    selectedParts,
    partsData
  );

  const breakdown = {};
  let total = 0;

  const skinScore = scoreSkin(skinOpt, cfg);
  breakdown.skin = skinScore;
  total += skinScore;

  const faceScore = scoreFace(hairOpt, eyesOpt, mouthOpt, cfg);
  breakdown.face = faceScore;
  total += faceScore;

  const outfitScore = scoreOutfit(topOpt, bottomOpt, cfg);
  breakdown.outfit = outfitScore;
  total += outfitScore;

  const rank = getGrade(total, cfg);
  const resultKey = cfg.resultKeys[rank];

  return { total, breakdown, rank, resultKey };
}
/** 등급별 결과 설명 (UI 표시용) */
export const RANK_DESCRIPTIONS = {
  S: '인간들이 셀카 요청을 합니다. 성공이네요!',
  A: '아무도 관심이 없네요. 그래도 자연스러웠어!',
  B: '인간들이 수군거립니다...',
  C: '인간들이 경악합니다...',
  D: '경찰 출동!',
};
export const GRADES = ['S', 'A', 'B', 'C', 'D'];

