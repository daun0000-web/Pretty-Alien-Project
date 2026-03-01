/**
 * 6종 파츠 슬롯 관리 시스템
 * - 각 옵션: id, name, color, imagePath?, slotImagePath?, resultImagePath?, setId(1~10), type, category
 * - 이미지 용도별 경로 확장 가능: animationImagePath, previewImagePath 등 추가 가능
 */
import { getTheme } from '../theme.js';

/** 이미지 용도 키 (확장 시 여기에 추가) */
export const IMAGE_USAGE_KEYS = {
  SLOT: 'slot',
  RESULT: 'result',
  // ANIMATION: 'animation',
  // PREVIEW: 'preview',
};

/** 이미지 로드 실패 시 사용할 기본 이미지 경로 */
export const FALLBACK_IMAGE_PATH = 'assets/parts/placeholder.png';

export const PART_TYPES = {
  SKIN: 'skin',
  HAIR: 'hair',
  EYES: 'eyes',
  MOUTH: 'mouth',
  TOP: 'top',
  BOTTOM: 'bottom',
};

export const PART_LABELS = {
  [PART_TYPES.SKIN]: '피부색',
  [PART_TYPES.HAIR]: '헤어스타일',
  [PART_TYPES.EYES]: '눈',
  [PART_TYPES.MOUTH]: '입',
  [PART_TYPES.TOP]: '상의',
  [PART_TYPES.BOTTOM]: '하의',
};

export const PART_ORDER = [
  PART_TYPES.SKIN,
  PART_TYPES.HAIR,
  PART_TYPES.EYES,
  PART_TYPES.MOUTH,
  PART_TYPES.TOP,
  PART_TYPES.BOTTOM,
];

/**
 * 파츠 옵션 형태
 * @property {string} id
 * @property {string} name
 * @property {string} color
 * @property {string} [imagePath] - 공통 fallback 경로
 * @property {string} [slotImagePath] - 슬롯머신 썸네일용
 * @property {string} [resultImagePath] - 최종 캐릭터 조합용
 * @property {number} setId - 1~13 (파츠별 최대 개수)
 * @property {'normal'|'strange'|'bomb'} type
 * @property {'skin'|'hair'|'eyes'|'mouth'|'top'|'bottom'} category
 */
const SLOTS = {
  [PART_TYPES.SKIN]: [
    { id: 'skin_01', name: '갈색 피부', color: '#ffe4c9', imagePath: 'assets/parts/resultimagePath/skin/01.png', slotImagePath: 'assets/parts/slotImagePath/skin/01.png', resultImagePath: 'assets/parts/resultimagePath/skin/01.png', setId: 1, type: 'normal', category: 'skin' },
    { id: 'skin_02', name: '황토색 피부', color: '#e8c5a8', imagePath: 'assets/parts/resultimagePath/skin/02.png', slotImagePath: 'assets/parts/slotImagePath/skin/02.png', resultImagePath: 'assets/parts/resultimagePath/skin/02.png', setId: 2, type: 'normal', category: 'skin' },
    { id: 'skin_03', name: '황금색 피부', color: '#d4a574', imagePath: 'assets/parts/resultimagePath/skin/03.png', slotImagePath: 'assets/parts/slotImagePath/skin/03.png', resultImagePath: 'assets/parts/resultimagePath/skin/03.png', setId: 3, type: 'normal', category: 'skin' },
    { id: 'skin_04', name: '웜톤 피부', color: '#b8956b', imagePath: 'assets/parts/resultimagePath/skin/04.png', slotImagePath: 'assets/parts/slotImagePath/skin/04.png', resultImagePath: 'assets/parts/resultimagePath/skin/04.png', setId: 4, type: 'normal', category: 'skin' },
    { id: 'skin_05', name: '쿨톤 피부', color: '#a67c52', imagePath: 'assets/parts/resultimagePath/skin/05.png', slotImagePath: 'assets/parts/slotImagePath/skin/05.png', resultImagePath: 'assets/parts/resultimagePath/skin/05.png', setId: 5, type: 'normal', category: 'skin' },
    { id: 'skin_06', name: '푸른 피부', color: '#6b4423', imagePath: 'assets/parts/resultimagePath/skin/06.png', slotImagePath: 'assets/parts/slotImagePath/skin/06.png', resultImagePath: 'assets/parts/resultimagePath/skin/06.png', setId: 6, type: 'bomb', category: 'skin' },
    { id: 'skin_07', name: '회색 토끼', color: '#ffdab9', imagePath: 'assets/parts/resultimagePath/skin/07.png', slotImagePath: 'assets/parts/slotImagePath/skin/07.png', resultImagePath: 'assets/parts/resultimagePath/skin/07.png', setId: 7, type: 'strange', category: 'skin' },
    { id: 'skin_08', name: '흰색 고양이', color: '#e8b4a0', imagePath: 'assets/parts/resultimagePath/skin/08.png', slotImagePath: 'assets/parts/slotImagePath/skin/08.png', resultImagePath: 'assets/parts/resultimagePath/skin/08.png', setId: 8, type: 'strange', category: 'skin' },
    { id: 'skin_09', name: '골든 리트리버', color: '#f5f5dc', imagePath: 'assets/parts/resultimagePath/skin/09.png', slotImagePath: 'assets/parts/slotImagePath/skin/09.png', resultImagePath: 'assets/parts/resultimagePath/skin/09.png', setId: 9, type: 'strange', category: 'skin' },
    { id: 'skin_10', name: '외계인 스킨', color: '#3d2314', imagePath: 'assets/parts/resultimagePath/skin/10.png', slotImagePath: 'assets/parts/slotImagePath/skin/10.png', resultImagePath: 'assets/parts/resultimagePath/skin/10.png', setId: 10, type: 'bomb', category: 'skin' },
  ],
  [PART_TYPES.HAIR]: [
    { id: 'hair_01', name: '롱 웨이브', color: '#2c1810', imagePath: 'assets/parts/resultimagePath/hair/01.png', slotImagePath: 'assets/parts/slotImagePath/hair/01.png', resultImagePath: 'assets/parts/resultimagePath/hair/01.png', setId: 1, type: 'normal', category: 'hair' },
    { id: 'hair_02', name: '핑크 만두머리', color: '#4a3728', imagePath: 'assets/parts/resultimagePath/hair/02.png', slotImagePath: 'assets/parts/slotImagePath/hair/02.png', resultImagePath: 'assets/parts/resultimagePath/hair/02.png', setId: 2, type: 'normal', category: 'hair' },
    { id: 'hair_03', name: '짧은 머리', color: '#5c4033', imagePath: 'assets/parts/resultimagePath/hair/03.png', slotImagePath: 'assets/parts/slotImagePath/hair/03.png', resultImagePath: 'assets/parts/resultimagePath/hair/03.png', setId: 3, type: 'normal', category: 'hair' },
    { id: 'hair_04', name: '열혈 머리', color: '#3d2914', imagePath: 'assets/parts/resultimagePath/hair/04.png', slotImagePath: 'assets/parts/slotImagePath/hair/04.png', resultImagePath: 'assets/parts/resultimagePath/hair/04.png', setId: 4, type: 'normal', category: 'hair' },
    { id: 'hair_05', name: '단정한 숏컷', color: '#6b4423', imagePath: 'assets/parts/resultimagePath/hair/05.png', slotImagePath: 'assets/parts/slotImagePath/hair/05.png', resultImagePath: 'assets/parts/resultimagePath/hair/05.png', setId: 5, type: 'normal', category: 'hair' },
    { id: 'hair_06', name: '롱 스트레이트', color: '#1a0f0a', imagePath: 'assets/parts/resultimagePath/hair/06.png', slotImagePath: 'assets/parts/slotImagePath/hair/06.png', resultImagePath: 'assets/parts/resultimagePath/hair/06.png', setId: 6, type: 'normal', category: 'hair' },
    { id: 'hair_07', name: '금빛 단발', color: '#8b6914', imagePath: 'assets/parts/resultimagePath/hair/07.png', slotImagePath: 'assets/parts/slotImagePath/hair/07.png', resultImagePath: 'assets/parts/resultimagePath/hair/07.png', setId: 7, type: 'normal', category: 'hair' },
    { id: 'hair_08', name: '금빛 가르마', color: '#c4a574', imagePath: 'assets/parts/resultimagePath/hair/08.png', slotImagePath: 'assets/parts/slotImagePath/hair/08.png', resultImagePath: 'assets/parts/resultimagePath/hair/08.png', setId: 8, type: 'normal', category: 'hair' },
    { id: 'hair_09', name: '꽃단발', color: '#4a3520', imagePath: 'assets/parts/resultimagePath/hair/09.png', slotImagePath: 'assets/parts/slotImagePath/hair/09.png', resultImagePath: 'assets/parts/resultimagePath/hair/09.png', setId: 9, type: 'strange', category: 'hair' },
    { id: 'hair_10', name: '대머리', color: '#2d1f14', imagePath: 'assets/parts/resultimagePath/hair/10.png', slotImagePath: 'assets/parts/slotImagePath/hair/10.png', resultImagePath: 'assets/parts/resultimagePath/hair/10.png', setId: 10, type: 'strange', category: 'hair' },
    { id: 'hair_11', name: '덥수룩 머리', color: '#3a2a1a', imagePath: 'assets/parts/resultimagePath/hair/11.png', slotImagePath: 'assets/parts/slotImagePath/hair/11.png', resultImagePath: 'assets/parts/resultimagePath/hair/11.png', setId: 11, type: 'normal', category: 'hair' },
    { id: 'hair_12', name: '단아한 머리', color: '#4a3a2a', imagePath: 'assets/parts/resultimagePath/hair/12.png', slotImagePath: 'assets/parts/slotImagePath/hair/12.png', resultImagePath: 'assets/parts/resultimagePath/hair/12.png', setId: 12, type: 'normal', category: 'hair' },
    { id: 'hair_13', name: '붕대 머리', color: '#5a4a3a', imagePath: 'assets/parts/resultimagePath/hair/13.png', slotImagePath: 'assets/parts/slotImagePath/hair/13.png', resultImagePath: 'assets/parts/resultimagePath/hair/13.png', setId: 13, type: 'bomb', category: 'hair' },
  ],
  [PART_TYPES.EYES]: [
    { id: 'eyes_01', name: '화려한 눈', color: '#3d5a80', imagePath: 'assets/parts/resultimagePath/eyes/01.png', slotImagePath: 'assets/parts/slotImagePath/eyes/01.png', resultImagePath: 'assets/parts/resultimagePath/eyes/01.png', setId: 1, type: 'normal', category: 'eyes' },
    { id: 'eyes_02', name: '동그란 눈', color: '#2d4a6e', imagePath: 'assets/parts/resultimagePath/eyes/02.png', slotImagePath: 'assets/parts/slotImagePath/eyes/02.png', resultImagePath: 'assets/parts/resultimagePath/eyes/02.png', setId: 2, type: 'normal', category: 'eyes' },
    { id: 'eyes_03', name: '뾰족한 눈', color: '#1e3a5f', imagePath: 'assets/parts/resultimagePath/eyes/03.png', slotImagePath: 'assets/parts/slotImagePath/eyes/03.png', resultImagePath: 'assets/parts/resultimagePath/eyes/03.png', setId: 3, type: 'normal', category: 'eyes' },
    { id: 'eyes_04', name: '비대칭 눈', color: '#5c7c9a', imagePath: 'assets/parts/resultimagePath/eyes/04.png', slotImagePath: 'assets/parts/slotImagePath/eyes/04.png', resultImagePath: 'assets/parts/resultimagePath/eyes/04.png', setId: 4, type: 'normal', category: 'eyes' },
    { id: 'eyes_05', name: '안경 눈', color: '#2c3e50', imagePath: 'assets/parts/resultimagePath/eyes/05.png', slotImagePath: 'assets/parts/slotImagePath/eyes/05.png', resultImagePath: 'assets/parts/resultimagePath/eyes/05.png', setId: 5, type: 'normal', category: 'eyes' },
    { id: 'eyes_06', name: '윙크한 눈', color: '#4a6fa5', imagePath: 'assets/parts/resultimagePath/eyes/06.png', slotImagePath: 'assets/parts/slotImagePath/eyes/06.png', resultImagePath: 'assets/parts/resultimagePath/eyes/06.png', setId: 6, type: 'normal', category: 'eyes' },
    { id: 'eyes_07', name: '토끼 눈', color: '#6eb5d0', imagePath: 'assets/parts/resultimagePath/eyes/07.png', slotImagePath: 'assets/parts/slotImagePath/eyes/07.png', resultImagePath: 'assets/parts/resultimagePath/eyes/07.png', setId: 7, type: 'strange', category: 'eyes' },
    { id: 'eyes_08', name: '고양이 눈', color: '#1a252f', imagePath: 'assets/parts/resultimagePath/eyes/08.png', slotImagePath: 'assets/parts/slotImagePath/eyes/08.png', resultImagePath: 'assets/parts/resultimagePath/eyes/08.png', setId: 8, type: 'bomb', category: 'eyes' },
    { id: 'eyes_09', name: '리트리버 눈', color: '#7eb8da', imagePath: 'assets/parts/resultimagePath/eyes/09.png', slotImagePath: 'assets/parts/slotImagePath/eyes/09.png', resultImagePath: 'assets/parts/resultimagePath/eyes/09.png', setId: 9, type: 'strange', category: 'eyes' },
    { id: 'eyes_10', name: '외계인 눈', color: '#8b4513', imagePath: 'assets/parts/resultimagePath/eyes/10.png', slotImagePath: 'assets/parts/slotImagePath/eyes/10.png', resultImagePath: 'assets/parts/resultimagePath/eyes/10.png', setId: 10, type: 'bomb', category: 'eyes' },
    { id: 'eyes_11', name: '흉터 눈', color: '#3d6a90', imagePath: 'assets/parts/resultimagePath/eyes/11.png', slotImagePath: 'assets/parts/slotImagePath/eyes/11.png', resultImagePath: 'assets/parts/resultimagePath/eyes/11.png', setId: 11, type: 'normal', category: 'eyes' },
    { id: 'eyes_12', name: '단아한 눈', color: '#4d7aa0', imagePath: 'assets/parts/resultimagePath/eyes/12.png', slotImagePath: 'assets/parts/slotImagePath/eyes/12.png', resultImagePath: 'assets/parts/resultimagePath/eyes/12.png', setId: 12, type: 'normal', category: 'eyes' },
    { id: 'eyes_13', name: '무서운 눈', color: '#5d8ab0', imagePath: 'assets/parts/resultimagePath/eyes/13.png', slotImagePath: 'assets/parts/slotImagePath/eyes/13.png', resultImagePath: 'assets/parts/resultimagePath/eyes/13.png', setId: 13, type: 'normal', category: 'eyes' },
  ],
  [PART_TYPES.MOUTH]: [
    { id: 'mouth_01', name: '두꺼운 입', color: '#c97b7b', imagePath: 'assets/parts/resultimagePath/mouth/01.png', slotImagePath: 'assets/parts/slotImagePath/mouth/01.png', resultImagePath: 'assets/parts/resultimagePath/mouth/01.png', setId: 1, type: 'normal', category: 'mouth' },
    { id: 'mouth_02', name: '미소 입', color: '#d49090', imagePath: 'assets/parts/resultimagePath/mouth/02.png', slotImagePath: 'assets/parts/slotImagePath/mouth/02.png', resultImagePath: 'assets/parts/resultimagePath/mouth/02.png', setId: 2, type: 'normal', category: 'mouth' },
    { id: 'mouth_03', name: '진지한 입', color: '#e8a0a0', imagePath: 'assets/parts/resultimagePath/mouth/03.png', slotImagePath: 'assets/parts/slotImagePath/mouth/03.png', resultImagePath: 'assets/parts/resultimagePath/mouth/03.png', setId: 3, type: 'normal', category: 'mouth' },
    { id: 'mouth_04', name: '활짝 송곳니 입', color: '#a06060', imagePath: 'assets/parts/resultimagePath/mouth/04.png', slotImagePath: 'assets/parts/slotImagePath/mouth/04.png', resultImagePath: 'assets/parts/resultimagePath/mouth/04.png', setId: 4, type: 'normal', category: 'mouth' },
    { id: 'mouth_05', name: '지친 입', color: '#b07070', imagePath: 'assets/parts/resultimagePath/mouth/05.png', slotImagePath: 'assets/parts/slotImagePath/mouth/05.png', resultImagePath: 'assets/parts/resultimagePath/mouth/05.png', setId: 5, type: 'normal', category: 'mouth' },
    { id: 'mouth_06', name: '귀여운 입', color: '#805050', imagePath: 'assets/parts/resultimagePath/mouth/06.png', slotImagePath: 'assets/parts/slotImagePath/mouth/06.png', resultImagePath: 'assets/parts/resultimagePath/mouth/06.png', setId: 6, type: 'normal', category: 'mouth' },
    { id: 'mouth_07', name: '토끼 입', color: '#d49898', imagePath: 'assets/parts/resultimagePath/mouth/07.png', slotImagePath: 'assets/parts/slotImagePath/mouth/07.png', resultImagePath: 'assets/parts/resultimagePath/mouth/07.png', setId: 7, type: 'strange', category: 'mouth' },
    { id: 'mouth_08', name: '고양이 입', color: '#906060', imagePath: 'assets/parts/resultimagePath/mouth/08.png', slotImagePath: 'assets/parts/slotImagePath/mouth/08.png', resultImagePath: 'assets/parts/resultimagePath/mouth/08.png', setId: 8, type: 'strange', category: 'mouth' },
    { id: 'mouth_09', name: '리트리버 입', color: '#e0a8a8', imagePath: 'assets/parts/resultimagePath/mouth/09.png', slotImagePath: 'assets/parts/slotImagePath/mouth/09.png', resultImagePath: 'assets/parts/resultimagePath/mouth/09.png', setId: 9, type: 'strange', category: 'mouth' },
    { id: 'mouth_10', name: '외계인 입', color: '#f0b0b0', imagePath: 'assets/parts/resultimagePath/mouth/10.png', slotImagePath: 'assets/parts/slotImagePath/mouth/10.png', resultImagePath: 'assets/parts/resultimagePath/mouth/10.png', setId: 10, type: 'strange', category: 'mouth' },
    { id: 'mouth_11', name: '덥수룩 수염', color: '#c08080', imagePath: 'assets/parts/resultimagePath/mouth/11.png', slotImagePath: 'assets/parts/slotImagePath/mouth/11.png', resultImagePath: 'assets/parts/resultimagePath/mouth/11.png', setId: 11, type: 'normal', category: 'mouth' },
    { id: 'mouth_12', name: '단아한 입', color: '#d09090', imagePath: 'assets/parts/resultimagePath/mouth/12.png', slotImagePath: 'assets/parts/slotImagePath/mouth/12.png', resultImagePath: 'assets/parts/resultimagePath/mouth/12.png', setId: 12, type: 'normal', category: 'mouth' },
    { id: 'mouth_13', name: '밴드 입', color: '#e0a0a0', imagePath: 'assets/parts/resultimagePath/mouth/13.png', slotImagePath: 'assets/parts/slotImagePath/mouth/13.png', resultImagePath: 'assets/parts/resultimagePath/mouth/13.png', setId: 13, type: 'normal', category: 'mouth' },
  ],
  [PART_TYPES.TOP]: [
    { id: 'top_01', name: '블랙 크롭티', color: '#3498db', imagePath: 'assets/parts/resultimagePath/top/01.png', slotImagePath: 'assets/parts/slotImagePath/top/01.png', resultImagePath: 'assets/parts/resultimagePath/top/01.png', setId: 1, type: 'normal', category: 'top' },
    { id: 'top_02', name: '노란 후드티', color: '#ecf0f1', imagePath: 'assets/parts/resultimagePath/top/02.png', slotImagePath: 'assets/parts/slotImagePath/top/02.png', resultImagePath: 'assets/parts/resultimagePath/top/02.png', setId: 2, type: 'normal', category: 'top' },
    { id: 'top_03', name: '갑옷 상의', color: '#2c3e50', imagePath: 'assets/parts/resultimagePath/top/03.png', slotImagePath: 'assets/parts/slotImagePath/top/03.png', resultImagePath: 'assets/parts/resultimagePath/top/03.png', setId: 3, type: 'strange', category: 'top' },
    { id: 'top_04', name: '농구 상의', color: '#8e44ad', imagePath: 'assets/parts/resultimagePath/top/04.png', slotImagePath: 'assets/parts/slotImagePath/top/04.png', resultImagePath: 'assets/parts/resultimagePath/top/04.png', setId: 4, type: 'normal', category: 'top' },
    { id: 'top_05', name: '정장 상의', color: '#f5b7b1', imagePath: 'assets/parts/resultimagePath/top/05.png', slotImagePath: 'assets/parts/slotImagePath/top/05.png', resultImagePath: 'assets/parts/resultimagePath/top/05.png', setId: 5, type: 'normal', category: 'top' },
    { id: 'top_06', name: '세라복 상의', color: '#a569bd', imagePath: 'assets/parts/resultimagePath/top/06.png', slotImagePath: 'assets/parts/slotImagePath/top/06.png', resultImagePath: 'assets/parts/resultimagePath/top/06.png', setId: 6, type: 'normal', category: 'top' },
    { id: 'top_07', name: '드레스 상의', color: '#1a252f', imagePath: 'assets/parts/resultimagePath/top/07.png', slotImagePath: 'assets/parts/slotImagePath/top/07.png', resultImagePath: 'assets/parts/resultimagePath/top/07.png', setId: 7, type: 'normal', category: 'top' },
    { id: 'top_08', name: '집사 상의', color: '#d7bde2', imagePath: 'assets/parts/resultimagePath/top/08.png', slotImagePath: 'assets/parts/slotImagePath/top/08.png', resultImagePath: 'assets/parts/resultimagePath/top/08.png', setId: 8, type: 'normal', category: 'top' },
    { id: 'top_09', name: '김장조끼', color: '#e74c3c', imagePath: 'assets/parts/resultimagePath/top/09.png', slotImagePath: 'assets/parts/slotImagePath/top/09.png', resultImagePath: 'assets/parts/resultimagePath/top/09.png', setId: 9, type: 'strange', category: 'top' },
    { id: 'top_10', name: '난닝구', color: '#17202a', imagePath: 'assets/parts/resultimagePath/top/10.png', slotImagePath: 'assets/parts/slotImagePath/top/10.png', resultImagePath: 'assets/parts/resultimagePath/top/10.png', setId: 10, type: 'strange', category: 'top' },
    { id: 'top_11', name: '남자 해적 상의', color: '#2a3a4a', imagePath: 'assets/parts/resultimagePath/top/11.png', slotImagePath: 'assets/parts/slotImagePath/top/11.png', resultImagePath: 'assets/parts/resultimagePath/top/11.png', setId: 11, type: 'normal', category: 'top' },
    { id: 'top_12', name: '여자 한복 상의', color: '#3a4a5a', imagePath: 'assets/parts/resultimagePath/top/12.png', slotImagePath: 'assets/parts/slotImagePath/top/12.png', resultImagePath: 'assets/parts/resultimagePath/top/12.png', setId: 12, type: 'normal', category: 'top' },
    { id: 'top_13', name: '붕대 상의', color: '#4a5a6a', imagePath: 'assets/parts/resultimagePath/top/13.png', slotImagePath: 'assets/parts/slotImagePath/top/13.png', resultImagePath: 'assets/parts/resultimagePath/top/13.png', setId: 13, type: 'bomb', category: 'top' },
  ],
  [PART_TYPES.BOTTOM]: [
    { id: 'bottom_01', name: '와이드 청바지', color: '#1a5276', imagePath: 'assets/parts/resultimagePath/bottom/01.png', slotImagePath: 'assets/parts/slotImagePath/bottom/01.png', resultImagePath: 'assets/parts/resultimagePath/bottom/01.png', setId: 1, type: 'normal', category: 'bottom' },
    { id: 'bottom_02', name: '핑크 수면바지', color: '#273746', imagePath: 'assets/parts/resultimagePath/bottom/02.png', slotImagePath: 'assets/parts/slotImagePath/bottom/02.png', resultImagePath: 'assets/parts/resultimagePath/bottom/02.png', setId: 2, type: 'normal', category: 'bottom' },
    { id: 'bottom_03', name: '갑옷 하의', color: '#5d6d7e', imagePath: 'assets/parts/resultimagePath/bottom/03.png', slotImagePath: 'assets/parts/slotImagePath/bottom/03.png', resultImagePath: 'assets/parts/resultimagePath/bottom/03.png', setId: 3, type: 'strange', category: 'bottom' },
    { id: 'bottom_04', name: '농구 하의', color: '#a569bd', imagePath: 'assets/parts/resultimagePath/bottom/04.png', slotImagePath: 'assets/parts/slotImagePath/bottom/04.png', resultImagePath: 'assets/parts/resultimagePath/bottom/04.png', setId: 4, type: 'normal', category: 'bottom' },
    { id: 'bottom_05', name: '정장 하의', color: '#1b2631', imagePath: 'assets/parts/resultimagePath/bottom/05.png', slotImagePath: 'assets/parts/slotImagePath/bottom/05.png', resultImagePath: 'assets/parts/resultimagePath/bottom/05.png', setId: 5, type: 'normal', category: 'bottom' },
    { id: 'bottom_06', name: '세라복 하의', color: '#2e4053', imagePath: 'assets/parts/resultimagePath/bottom/06.png', slotImagePath: 'assets/parts/slotImagePath/bottom/06.png', resultImagePath: 'assets/parts/resultimagePath/bottom/06.png', setId: 6, type: 'normal', category: 'bottom' },
    { id: 'bottom_07', name: '드레스 치마', color: '#4a235a', imagePath: 'assets/parts/resultimagePath/bottom/07.png', slotImagePath: 'assets/parts/slotImagePath/bottom/07.png', resultImagePath: 'assets/parts/resultimagePath/bottom/07.png', setId: 7, type: 'normal', category: 'bottom' },
    { id: 'bottom_08', name: '집사 하의', color: '#1c2833', imagePath: 'assets/parts/resultimagePath/bottom/08.png', slotImagePath: 'assets/parts/slotImagePath/bottom/08.png', resultImagePath: 'assets/parts/resultimagePath/bottom/08.png', setId: 8, type: 'normal', category: 'bottom' },
    { id: 'bottom_09', name: '몸빼바지', color: '#17202a', imagePath: 'assets/parts/resultimagePath/bottom/09.png', slotImagePath: 'assets/parts/slotImagePath/bottom/09.png', resultImagePath: 'assets/parts/resultimagePath/bottom/09.png', setId: 9, type: 'strange', category: 'bottom' },
    { id: 'bottom_10', name: '트렁크', color: '#6c3483', imagePath: 'assets/parts/resultimagePath/bottom/10.png', slotImagePath: 'assets/parts/slotImagePath/bottom/10.png', resultImagePath: 'assets/parts/resultimagePath/bottom/10.png', setId: 10, type: 'bomb', category: 'bottom' },
    { id: 'bottom_11', name: '남자 해적 하의', color: '#2a4050', imagePath: 'assets/parts/resultimagePath/bottom/11.png', slotImagePath: 'assets/parts/slotImagePath/bottom/11.png', resultImagePath: 'assets/parts/resultimagePath/bottom/11.png', setId: 11, type: 'normal', category: 'bottom' },
    { id: 'bottom_12', name: '여자 한복 하의', color: '#3a5060', imagePath: 'assets/parts/resultimagePath/bottom/12.png', slotImagePath: 'assets/parts/slotImagePath/bottom/12.png', resultImagePath: 'assets/parts/resultimagePath/bottom/12.png', setId: 12, type: 'normal', category: 'bottom' },
    { id: 'bottom_13', name: '붕대 하의', color: '#4a6070', imagePath: 'assets/parts/resultimagePath/bottom/13.png', slotImagePath: 'assets/parts/slotImagePath/bottom/13.png', resultImagePath: 'assets/parts/resultimagePath/bottom/13.png', setId: 13, type: 'bomb', category: 'bottom' },
  ],
};

export const PARTS_DATA = SLOTS;

/**
 * 용도별 이미지 경로 반환 (slot | result | 추후 animation, preview 등)
 * @param {Object} option - 파츠 옵션 객체
 * @param {string} usageKey - IMAGE_USAGE_KEYS 값 ('slot', 'result' 등)
 * @returns {string} 사용할 이미지 경로 (없으면 imagePath, 그것도 없으면 FALLBACK_IMAGE_PATH)
 */
export function getPartImagePath(option, usageKey) {
  if (!option) return FALLBACK_IMAGE_PATH;
  const key = usageKey + 'ImagePath';
  const path = option[key] || option.imagePath;
  return path || FALLBACK_IMAGE_PATH;
}

export function getPartOptions(partType) {
  return SLOTS[partType] ? [...SLOTS[partType]] : [];
}

export function getRandomOption(partType) {
  const arr = SLOTS[partType];
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomSelection() {
  const result = {};
  for (const partType of PART_ORDER) {
    const opt = getRandomOption(partType);
    if (opt) result[partType] = opt.id;
  }
  return result;
}

/** id로 옵션 찾기 (partsData = PARTS_DATA) */
export function findOptionById(partsData, partType, optionId) {
  const list = partsData[partType] || [];
  return list.find((o) => o.id === optionId) || null;
}

export function drawPartOption(ctx, option, img, x, y, size) {
  const padding = size * 0.05;
  const inner = size - padding * 2;
  const cx = x + size / 2;
  const cy = y + size / 2;

  if (img) {
    const scale = Math.min(inner / img.width, inner / img.height, 1);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    const theme = getTheme();
    const color = option.color || theme.textMuted;
    ctx.fillStyle = color;
    ctx.strokeStyle = theme.slotStroke;
    ctx.lineWidth = 2;
    const rx = x + padding;
    const ry = y + padding;
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + inner - r, ry);
    ctx.quadraticCurveTo(rx + inner, ry, rx + inner, ry + r);
    ctx.lineTo(rx + inner, ry + inner - r);
    ctx.quadraticCurveTo(rx + inner, ry + inner, rx + inner - r, ry + inner);
    ctx.lineTo(rx + r, ry + inner);
    ctx.quadraticCurveTo(rx, ry + inner, rx, ry + inner - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}
