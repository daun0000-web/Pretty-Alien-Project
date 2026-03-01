# 도전! 외계인 꾸미기 (HTML5 Canvas 웹 게임)

외계인이 인간의 모습으로 변신해 친해지기 위한 선택형 게임입니다.

## 실행 방법

로컬에서 ES 모듈을 사용하므로 **반드시 웹 서버**로 열어야 합니다.

- VS Code: Live Server 확장으로 `index.html` 열기
- 또는: `npx serve .` 후 브라우저에서 접속

## 파일 구조

```
├── index.html              # 진입점
├── css/
│   └── style.css           # 레이아웃·오버레이 스타일
├── js/
│   ├── main.js             # 캔버스 초기화, 게임 루프, 클릭/리사이즈
│   ├── game.js             # 게임 상태, 씬 전환, 씬 인스턴스 보관
│   ├── data/
│   │   └── partsData.js    # 파츠 종류·순서·옵션(이미지 경로) 정의
│   ├── logic/
│   │   └── scoreCalculator.js  # 점수·등급 계산 로직
│   ├── scenes/
│   │   ├── SceneBase.js    # 씬 공통 베이스
│   │   ├── IntroScene.js   # 인트로 컷신
│   │   ├── PartsSelectionScene.js  # 파츠 선택 (6라운드)
│   │   ├── ResultScene.js # 결과 연출 (합성 캐릭터)
│   │   └── ScoreScene.js   # 점수·등급 표시, 재시작
│   └── utils/
│       └── AssetLoader.js  # 이미지 로드·캐시
└── assets/
    └── parts/              # 파츠 이미지 (skin, hair, eyes, mouth, top, bottom)
        └── README.md       # 폴더별 파일명·규격 안내
```

## 이미지 교체

- `js/data/parts.js`에서 각 파츠의 이미지 경로를 수정합니다.
- **slotImagePath**: 슬롯머신에서 보여줄 썸네일 이미지
- **resultImagePath**: 최종 캐릭터 조합 화면에서 사용할 이미지
- **imagePath**: 위 두 경로가 없을 때 사용하는 공통 fallback
- 두 이미지 중 하나라도 없거나 로드 실패 시 `assets/parts/placeholder.png`로 fallback (기본 이미지 추가 권장)
- 나중에 `animationImagePath`, `previewImagePath` 등 확장 시 `IMAGE_USAGE_KEYS`와 `getPartImagePath(option, usageKey)`를 사용하면 됩니다.

## 게임 흐름

1. **인트로** → 스토리 텍스트 (스킵 가능)
2. **파츠 선택** → 피부색 → 헤어 → 눈 → 입 → 상의 → 하의 (각 라운드에서 1개 선택)
3. **결과** → 선택한 파츠 합성 캐릭터 표시
4. **점수** → 총점·등급(S/A/B/C/D/F)·재시작

점수 규칙은 `js/logic/scoreCalculator.js`에서 수정할 수 있습니다.
