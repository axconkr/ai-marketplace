// 한국어 번역
export const ko = {
  common: {
    loading: '로딩 중...',
    error: '오류가 발생했습니다',
    success: '성공',
    cancel: '취소',
    confirm: '확인',
    save: '저장',
    delete: '삭제',
    edit: '수정',
    search: '검색',
    filter: '필터',
    sort: '정렬',
    actions: '작업',
    view: '보기',
    download: '다운로드',
    upload: '업로드',
    login: '로그인',
    logout: '로그아웃',
    register: '회원가입',
    profile: '프로필',
    settings: '설정',
    dashboard: '대시보드',
  },

  navigation: {
    home: '홈',
    products: '제품',
    cart: '장바구니',
    orders: '주문',
    myProducts: '내 제품',
    sales: '판매',
    purchases: '구매',
    verification: '검증',
    reviews: '리뷰',
  },

  product: {
    title: '제품',
    name: '제품명',
    description: '설명',
    price: '가격',
    category: '카테고리',
    status: '상태',
    verification: '검증',
    rating: '평점',
    reviews: '리뷰',
    downloads: '다운로드',
    seller: '판매자',
    uploadDate: '등록일',
    lastUpdated: '최종 수정일',

    categories: {
      n8n: 'n8n 워크플로우',
      aiAgent: 'AI 에이전트',
      vibeCoding: '바이브코딩 앱',
      automation: '자동화 도구',
      integration: '통합 솔루션',
    },

    statuses: {
      draft: '임시저장',
      active: '판매중',
      archived: '판매종료',
    },

    verification: {
      level0: '기본 검증',
      level1: 'Level 1 검증',
      level2: 'Level 2 검증',
      level3: 'Level 3 검증',
      failed: '검증 실패',
    },
  },

  cart: {
    title: '장바구니',
    empty: '장바구니가 비어있습니다',
    items: '상품',
    total: '총액',
    checkout: '결제하기',
    remove: '삭제',
    continue: '쇼핑 계속하기',
  },

  order: {
    title: '주문',
    orderNumber: '주문번호',
    orderDate: '주문일',
    status: '주문상태',
    total: '총액',
    buyer: '구매자',
    seller: '판매자',

    statuses: {
      pending: '결제 대기',
      paid: '결제 완료',
      completed: '주문 완료',
      refunded: '환불 완료',
      cancelled: '취소됨',
    },
  },

  payment: {
    title: '결제',
    method: '결제수단',
    total: '결제금액',
    success: '결제가 완료되었습니다',
    failed: '결제가 실패했습니다',

    methods: {
      card: '신용/체크카드',
      bank: '계좌이체',
      virtual: '가상계좌',
      kakaopay: '카카오페이',
      tosspay: '토스페이',
    },
  },

  auth: {
    login: {
      title: '로그인',
      email: '이메일',
      password: '비밀번호',
      remember: '로그인 상태 유지',
      forgot: '비밀번호를 잊으셨나요?',
      submit: '로그인',
      noAccount: '계정이 없으신가요?',
      signUp: '회원가입',
    },

    register: {
      title: '회원가입',
      name: '이름',
      email: '이메일',
      password: '비밀번호',
      confirmPassword: '비밀번호 확인',
      agree: '이용약관에 동의합니다',
      submit: '가입하기',
      hasAccount: '이미 계정이 있으신가요?',
      signIn: '로그인',
    },
  },

  validation: {
    required: '필수 항목입니다',
    email: '올바른 이메일 형식이 아닙니다',
    password: '비밀번호는 8자 이상이어야 합니다',
    confirmPassword: '비밀번호가 일치하지 않습니다',
    min: '최소 {min}자 이상 입력해주세요',
    max: '최대 {max}자까지 입력 가능합니다',
  },

  dashboard: {
    overview: '개요',
    sales: '판매 현황',
    revenue: '수익',
    orders: '주문',
    products: '제품',
    analytics: '분석',
    recentOrders: '최근 주문',
    topProducts: '인기 제품',
    earnings: '수익',
    thisMonth: '이번 달',
    lastMonth: '지난 달',
  },

  error: {
    notFound: '페이지를 찾을 수 없습니다',
    serverError: '서버 오류가 발생했습니다',
    unauthorized: '권한이 없습니다',
    forbidden: '접근이 거부되었습니다',
    badRequest: '잘못된 요청입니다',
    tryAgain: '다시 시도해주세요',
    goBack: '뒤로 가기',
    goHome: '홈으로',
  },
};

export type Translation = typeof ko;
