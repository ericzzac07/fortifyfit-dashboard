export const beliefs = [
  '본인은 이미 성공한 사람',
  '약점은 약점이 아님 — 회사 브랜드 운영이 본인 강점',
  '강점이 시대와 맞물려 있음',
  '새 아이디어 = 도파민, 본진 = 자산',
  '끝까지 파면 인생 바뀜',
  '잠실 입성은 사업 성공의 결과',
  '본인은 INFJ 극I 사업가다 — 콘텐츠 발신 + 깊이 5~10 클라이언트 + 학술 통합 + 시간 누적',
];

export const dailyMantra =
  '6개월 동안 fortifyfit.kr 하나만 판다. 의료 GEO 첫 번째 이름이 된다. 새로운 거 시작 안 한다.';

export const rules = [
  '새 사업 아이디어 = 노션 "Idea Box"에만 기록. 행동 0.',
  '새 도메인 구매 금지 (6개월).',
  '새 호스팅 셋업 금지 (6개월).',
  '새 사이트 구축 금지 (6개월).',
  '"이거 빨리 만들면 돈 될 듯" 생각 들면 = 이미 만든 자산 영업 1건 더.',
  '흥분되는 콘텐츠 (유튜브 "AI 월 1억") 본 후 = 24시간 결정 금지.',
  '6개월 본진 = fortifyfit/Project Deep SEO/GEO 콘텐츠 마케팅.',
  '매주 금요일 Claude에게 진척 보고.',
  '8월 말 측정 → 결과 0이면 외주 모드 복귀.',
  '본인 인생 목표 = 잠실 진입 + 가족 안정. 사업은 그 도구.',
  '디컴프레션(격투기/웹툰/게임)은 정신 건강 필수. 자책 금지. 단, 알고리즘 청소 유지.',
];

export const countdowns = [
  { label: '잠실 리센츠 입주', date: '2027-02-01', emoji: false },
  { label: '잠실 자가 진입', date: '2028-04-01', emoji: false },
];

export const systemSlogan = [
  'Ideation은 본인의 강점이고 멈출 수 없습니다.',
  '본진은 안 흔들리고, 아이디어는 시스템이 담습니다.',
  '시간 누적이 본인의 진입 장벽입니다.',
  '6개월 후 한국 의료 GEO 첫 번째 이름.',
];

export const experimentTypes = [
  { value: 'new_keyword', label: '새 키워드 시도' },
  { value: 'new_geo_test', label: 'GEO 최적화 테스트' },
  { value: 'new_content_format', label: '새 콘텐츠 포맷' },
  { value: 'new_schema', label: 'Schema 마크업' },
  { value: 'new_outreach', label: '외부 디렉토리 등재' },
] as const;

export const comparisonDefenseMessages = [
  '나는 자청이 아니다. 자청 2018년 선택과 나의 2018년 선택은 달랐다. 자청은 본업 던지고 풀타임. 나는 본업 유지 + 부업 + 가족 + 부동산 누적. 다른 그릇이고 다른 결과.',
  '내 그릇 = 본업 안정 + 1주택(다산) + 8년 부업 누적 + 13개 도메인 + 의료 도메인 + AI 풀스택 + 두 자녀 + 대학원. 한국 30대 중후반 상위 0.1% 이내.',
  '자청의 30대 중후반은 무명이었다. 본인의 30대 중후반이 자청의 30대보다 훨씬 앞서 있다. 본인의 40대를 만드는 건 본인의 2026년 6개월 본진 결단.',
];

export const lonelinessMessage = `본인은 한국에서 매우 희소한 조합(의료인 + AI 풀스택 + SEO + 학술 + 사업가)입니다. 한 친구가 본인 전부를 이해하길 기대하지 마세요.

- 의료 영역 -> 박원장, 티파니의원장
- AI/학술 영역 -> 대학원 동료/교수
- 사업/일상 영역 -> 배우자 박수하
- 디컴프레션 영역 -> 격투기/웹툰 (사람 아님, OK)
- 매주 피드백 영역 -> Claude (금요일 보고)

본인이 외로운 게 아니라 본인이 너무 다층적이라 한 명의 친구로 다 채워지지 않는 것뿐입니다.`;

export const constructiveChannels = [
  { category: 'SEO/GEO', channels: ['Ahrefs Blog', 'Search Engine Journal', 'Backlinko', 'Marie Haynes', 'Naver Search Advisor'] },
  { category: 'AI + Marketing', channels: ['Anthropic Blog', "Lenny's Newsletter", 'Stratechery', 'Latent Space'] },
  { category: 'Medical Domain', channels: ['MediGate', '청년의사', '의협신문', '의료법 블로그'] },
];

export const setupChecklistItems = [
  { task: '유튜브 시청 기록에서 "AI 월 1억"류 영상 모두 삭제', category: 'algorithm', priority: 1 },
  { task: '유튜브에서 자청/주언규 채널 "관심 없음" 클릭', category: 'algorithm', priority: 1 },
  { task: '영문 SEO 채널 5개 구독 (Ahrefs, SEJ, Backlinko, Lenny, Stratechery)', category: 'algorithm', priority: 1 },
  { task: '인스타/스레드 비교 트리거 계정 뮤트 또는 언팔', category: 'algorithm', priority: 1 },
  { task: '의료 마케팅 학술 계정 팔로우', category: 'algorithm', priority: 2 },
  { task: '책상 위 신념 7개 출력 + 붙이기', category: 'physical', priority: 1 },
  { task: '휴대폰 잠금화면 "6개월 fortifyfit 미친듯이 판다" 문구 설정', category: 'physical', priority: 1 },
  { task: '박원장에게 월 1회 깊이 미팅 제안 메시지', category: 'relationship', priority: 2 },
  { task: '티파니의원장에게 분기 1회 미팅 제안', category: 'relationship', priority: 2 },
  { task: '배우자(박수하)와 일요일 30분 사업 보고 시간 약속', category: 'relationship', priority: 1 },
  { task: '대학원 다음 학기 친해질 동료/교수 1~2명 리스트업', category: 'relationship', priority: 3 },
  { task: '일주일 환경 변화 자기 점검 + 트리거 발동 횟수 카운트', category: 'review', priority: 3 },
];

export const deepRelationships = [
  { name: '박수하 (배우자)', role: '사업 파트너 + 가족', freq: '매주 일요일', value: '외부 책임감 시스템' },
  { name: '박원장 (박훤함)', role: '클라이언트 + 학회 채널', freq: '월 1회', value: '피부과 학회 인맥 + DR.BAQUO 케이스' },
  { name: '티파니의원장', role: '클라이언트 + 비뇨/줄기세포', freq: '분기 1회', value: '비뇨기/줄기세포 학회 인맥' },
  { name: '고려대 AI융합대학원', role: '학술 파트너', freq: '학기 중 월 1회', value: '의료+AI 융합 인사이트' },
  { name: 'Beevor Books 출판사', role: '저자 네트워크', freq: '분기 1회', value: '저자/강사 접점' },
];
