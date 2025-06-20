const palette = {
  primary: {
    main: "#3B82F6", // 메인 포인트 색상 (파란색)
    contrastText: "#FFFFFF", // 대비 색상 (하얀색)
  },
  secondary: {
    main: "#EFF6FF", // 클릭 시 배경 색상 (연한 하늘색)
    contrastText: "#3B82F6", // 메인 포인트 색상 (파란색)
  },
  background: {
    default: "#F5F7FA",
    paper: "#FFFFFF",

  },
  text: {
    primary: "#334155", // 기본 텍스트 색상
    secondary: "#000000", // 블랙 텍스트 색상 (페이지 main명 등)
    disabled: "#64748B", // 선택되지 않은 텍스트 색상 (회색)
  },
  textColor: {
    red: "#EF4444",
    yellow: "#F59E0B",
    green: "#10B981"
  },
  success: {
    main: "#DCFCE7", // active 상태 및 성공 상태의 연두색 배경
    contrastText: "#16A34A", // 녹색 텍스트
  },
  error: {
    main: "#FBDFDF", // 오류 상태의 빨간색 배경
    contrastText: "#EF4444", // 빨간색 텍스트
  },
  increase: {
    contrastText: "#10B981"
  },
  decrease: {
    contrastText: "#EF4444"
  },
  grey: {
    100: "#F8FAFC", // 기본 연한 회색 색상 (버튼, 상태 등의 배경 색상)
    200: "#E2E8F0", // 구분선 색상
    300: "#CBD5E1", // 외곽선 (구분선보다 조금 더 진한 색상)
    400: "#64748B", // 연한 회색 텍스트 색상 (선택되지 않은 텍스트 색상과 동일)
  },
};

export default palette;
