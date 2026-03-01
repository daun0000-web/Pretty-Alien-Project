# 파츠 이미지 폴더

각 파츠 타입별로 **선택 화면용**과 **결과 화면용** 이미지를 아래 폴더에 넣으세요.  
- **skin**: `01.png` ~ `10.png`  
- **hair, eyes, mouth, top, bottom**: `01.png` ~ `13.png`

## 폴더 구조

```
assets/parts/
├── resultimagepath/   ← 결과 화면에서 보이는 이미지
│   ├── skin/
│   ├── hair/
│   ├── eyes/
│   ├── mouth/
│   ├── top/
│   └── bottom/
├── slotImagePath/      ← 선택 화면 썸네일 이미지 (피부색 선택 포함)
│   ├── skin/
│   ├── hair/
│   ├── eyes/
│   ├── mouth/
│   ├── top/
│   └── bottom/
└── placeholder.png     ← 로드 실패 시 사용 (선택)
```

- **resultimagepath**: 최종 캐릭터 조합 화면에서 레이어로 합성되는 이미지
- **slotImagePath**: 선택 화면에서 슬롯/그리드에 보이는 썸네일 (피부색도 이 이미지 사용)

경로 변경은 `js/data/parts.js`에서 각 파츠의 `slotImagePath`, `resultImagePath`를 수정하면 됩니다.

## 권장 규격

- 결과 화면 레이어 순서: skin → bottom → top → eyes → mouth → hair
- 합성 시 중앙 정렬되므로, 동일한 캔버스 크기(예: 400x500)로 제작하면 정렬이 맞습니다.
- 투명 PNG 사용 시 아래 레이어가 보입니다.
