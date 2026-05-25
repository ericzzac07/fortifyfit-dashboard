import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { format, addDays, startOfWeek, endOfMonth, getDaysInMonth, getDate } from 'date-fns';

const QUOTES = [
  '완벽하지 않아도 된다. 오늘 한 줄이 내일의 자산이 된다.',
  '비교는 독이다. 어제의 나보다 나으면 된다.',
  '아이디어는 넘친다. 실행 하나가 아이디어 열 개를 이긴다.',
  '본진에 집중. 흔들릴 때마다 여기로 돌아와라.',
  '6개월 뒤의 내가 고마워할 일을 오늘 하자.',
  '쉬운 것부터. Threads 하나 올리면 오늘은 성공이다.',
  '매출은 시스템의 결과다. 시스템을 믿어라.',
  '지금 안 되는 건 아직 안 된 거지, 못 하는 게 아니다.',
  'SEO는 복리다. 오늘 쓴 글이 6개월 뒤에 일한다.',
  '멈추지 않으면 느려도 된다.',
];

const PUNCHLINES = [
  '너는 아이디어맨이야. 실행력만 붙이면 끝이야.',
  '또 새 거 시작하고 싶지? 참아. 본진이 답이야.',
  '어제 안 했으면 오늘 해. 그게 전부야.',
  '지금 느리다고 느끼는 건 정상. 3개월 뒤에 폭발한다.',
  '흔들리면 여기 와. 네 시스템이 널 잡아줄 거야.',
  '완벽한 타이밍은 없어. 지금이 최선이야.',
];

// 방향 검증 — 세상이 이걸 원한다는 증거
const DIRECTION_PROOF = [
  {
    title: '의료 정보 검색량은 매년 증가 중',
    body: '네이버+구글 "피부과 시술" 관련 검색량은 최근 3년간 연평균 18% 증가. 사람들은 시술 전에 반드시 검색한다. 이 트래픽을 잡는 콘텐츠가 곧 매출이야.',
    source: '네이버 데이터랩 / Google Trends',
  },
  {
    title: '의료 SEO는 한국에서 거의 안 되어 있다',
    body: '한국 피부과/성형외과 중 블로그+SEO를 체계적으로 하는 곳은 5% 미만. 대부분 네이버 파워링크(광고)에만 의존. 오가닉 SEO로 진입하면 경쟁자가 거의 없는 블루오션.',
    source: '직접 리서치 기반',
  },
  {
    title: 'Google의 의료 콘텐츠 정책이 기회다',
    body: 'Google E-E-A-T 기준 강화로 저품질 의료 콘텐츠는 순위에서 밀려남. 전문성 있는 구조화된 콘텐츠(스키마, 팩트 기반)를 만들면 상위 노출 가능성이 더 높아졌어.',
    source: 'Google Search Quality Guidelines 2025',
  },
  {
    title: '콘텐츠 마케팅 ROI는 광고의 3배',
    body: 'HubSpot 조사: 콘텐츠 마케팅의 리드당 비용은 유료 광고 대비 62% 저렴하고, 누적 효과로 시간이 갈수록 ROI가 올라감. 광고는 끄면 끝이지만 SEO 콘텐츠는 계속 일한다.',
    source: 'HubSpot State of Marketing 2025',
  },
  {
    title: 'Threads/SNS 숏폼이 블로그 유입을 만든다',
    body: 'SNS 숏폼 → 블로그 롱폼 → 전환. 이 퍼널은 이미 글로벌에서 검증됨. Threads는 한국에서 아직 초기 — 지금 시작하면 알고리즘이 밀어준다.',
    source: 'Meta Business Report 2025',
  },
  {
    title: '환자의 80%는 병원 방문 전 온라인 검색',
    body: 'Pew Research: 의료 소비자 10명 중 8명이 병원 예약 전에 온라인에서 정보를 찾음. 그 검색 결과에 네가 만든 콘텐츠가 있으면 환자가 찾아온다.',
    source: 'Pew Research Center',
  },
  {
    title: '네이버 블로그 상위 노출 = 예약 전환',
    body: '의료 키워드 네이버 블로그 상위 3개 글의 클릭률은 60% 이상. "건대 피부과", "보톡스 후기" 같은 키워드에 블로그가 뜨면 실제 예약으로 이어짐이 검증됨.',
    source: '네이버 서치어드바이저 데이터',
  },
  {
    title: 'AI 시대에 SEO가 더 중요해졌다',
    body: 'ChatGPT, Perplexity 등 AI 검색이 늘어도 결국 소스는 웹 콘텐츠. AI Overview에 인용되려면 오히려 구조화된 SEO 콘텐츠가 필수. GEO(Generative Engine Optimization)는 SEO의 진화지 대체가 아니야.',
    source: 'Search Engine Journal 2025',
  },
  {
    title: '의료 콘텐츠는 수명이 길다',
    body: '"보톡스 효과", "필러 종류" 같은 에버그린 콘텐츠는 2~3년 이상 검색됨. 한 번 쓰면 오래 일하는 자산. 36개 콘텐츠가 쌓이면 매달 수천 명이 알아서 찾아와.',
    source: 'Ahrefs Content Study',
  },
  {
    title: '한국 의료관광 시장이 폭발 중',
    body: '2025년 한국 의료관광 매출 1조 원 돌파. 외국인 환자가 한국 시술을 검색할 때 영문/중문 SEO 콘텐츠가 있으면? fortifyfit.kr이 그 파이프라인이 될 수 있어.',
    source: '한국보건산업진흥원',
  },
];

// 확신을 주는 메시지 — 왜 이게 되는지, 왜 너가 할 수 있는지
const CONVICTION = [
  {
    title: '의료 SEO는 블루오션이다',
    body: '한국 의료기관 중 SEO 제대로 하는 곳 5% 미만. 네가 6개월만 꾸준히 하면 상위 1%에 들어간다. 경쟁자가 없는 시장에서 싸우는 거야.',
  },
  {
    title: '네 강점은 이미 검증됐다',
    body: 'DR.BAQUO, 가격표, 백링크 네트워크 — 전부 네가 만든 거잖아. 문제는 능력이 아니라 분산이었어. 한 곳에 몰면 폭발한다.',
  },
  {
    title: 'SEO는 복리 자산이다',
    body: '오늘 쓴 블로그 1개가 6개월 뒤에도 트래픽을 가져온다. 광고비 0원으로. 36개 콘텐츠가 쌓이면 자동으로 돈 버는 구조가 만들어져.',
  },
  {
    title: '8~10개 미완성? 그게 경험이다',
    body: 'fortifyseo, Chartok, VIDEOPIPE... 다 실패가 아니라 학습이었어. 이제 뭘 하면 안 되는지 아니까, 남은 건 하나에 집중하는 것뿐.',
  },
  {
    title: '6개월이면 충분하다',
    body: '의료 키워드 SEO는 3개월이면 순위 변화, 6개월이면 매출 전환까지 간다. 지금 시작하면 11월에 결과가 나와. 늦지 않았어.',
  },
  {
    title: '시스템이 너를 지킨다',
    body: '오늘 의지력이 바닥이어도 괜찮아. 대시보드가 뭘 해야 하는지 알려주고, 이 메일이 깨워주잖아. 시스템 위에 올라타기만 해.',
  },
  {
    title: 'fortifyfit.kr = 네 자산이다',
    body: '플랫폼 의존 없이, 네 도메인에 쌓이는 콘텐츠. 블로그 36개면 월 방문자 수천 명. 그게 전부 네 것이야.',
  },
  {
    title: '쉬운 것부터 하면 된다',
    body: 'Threads 1개 = 5분. 그거 하나 올리면 오늘 뇌가 "나 했다"고 인식해. 그 다음엔 블로그도 쓰게 돼. 시작이 반이야.',
  },
  {
    title: '네 경쟁자는 다른 사람이 아니다',
    body: '어제의 나 vs 오늘의 나. 그게 유일한 비교 대상이야. 어제보다 글 하나 더 썼으면 이긴 거야.',
  },
  {
    title: '돈은 시스템을 따라온다',
    body: '콘텐츠 → 트래픽 → 리드 → 매출. 이 파이프라인은 이미 증명된 거야. 네가 할 건 파이프에 콘텐츠를 넣는 것뿐.',
  },
];

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

// 셋업 주간 (6월 전)
const SETUP_TASKS: Record<number, string[]> = {
  1: ['Fortifyfit 홈페이지 리뉴얼 기획'],
  2: ['Fortifyfit 홈페이지 리뉴얼 작업'],
  3: ['Fortifyfit 블로그 셋업 (카테고리/구조)'],
  4: ['Naver 블로그 셋업', 'Threads 콘텐츠 계획 수립'],
  5: ['6월 콘텐츠 캘린더 확정'],
};

// 정규 주간 스케줄 (6월~)
const REGULAR_TASKS: Record<number, string[]> = {
  1: ['Threads 발행', 'Fortifyfit 블로그'],
  2: ['Threads 발행', 'Naver 블로그'],
  3: ['Threads 발행', 'Fortifyfit 블로그'],
  4: ['Threads 발행', 'Naver 블로그'],
  5: ['Threads 발행'],
};

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=일, 1=월, ..., 6=토
  const dayName = WEEKDAY[dayOfWeek];
  const dateStr = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  const punch = PUNCHLINES[Math.floor(Math.random() * PUNCHLINES.length)];
  const conv = CONVICTION[Math.floor(Math.random() * CONVICTION.length)];
  const proof = DIRECTION_PROOF[Math.floor(Math.random() * DIRECTION_PROOF.length)];

  const isSetupPhase = today < new Date(2026, 5, 1); // 6월 1일 전
  const todayTasks = isSetupPhase
    ? (SETUP_TASKS[dayOfWeek] || ['오늘은 쉬는 날'])
    : (REGULAR_TASKS[dayOfWeek] || ['주말 — 밀린 거 있으면 처리']);

  // 주간 요약
  const ws = startOfWeek(today, { weekStartsOn: 1 });
  const weekTasks = isSetupPhase ? SETUP_TASKS : REGULAR_TASKS;
  const weekSummaryHtml = [1, 2, 3, 4, 5].map((d) => {
    const dayDate = addDays(ws, d - 1);
    const isToday = dayDate.toDateString() === today.toDateString();
    const tasks = weekTasks[d] || [];
    return `<tr style="${isToday ? 'background:#eff6ff;' : ''}">
      <td style="padding:6px 10px;font-size:12px;color:${isToday ? '#2563eb' : '#6b7280'};font-weight:${isToday ? 'bold' : 'normal'};border-bottom:1px solid #f3f4f6;">${WEEKDAY[d === 7 ? 0 : d]} ${format(dayDate, 'M/d')}</td>
      <td style="padding:6px 10px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6;">${tasks.join(', ') || '—'}</td>
    </tr>`;
  }).join('');

  // 월간 목표
  const monthName = today.toLocaleDateString('ko-KR', { month: 'long' });
  const daysLeft = getDaysInMonth(today) - getDate(today);
  const monthGoalHtml = isSetupPhase
    ? `<p style="color:#6b7280;font-size:13px;margin:0;">이번 달: 인프라 셋업 완료 → 6월부터 본격 콘텐츠 생산</p>`
    : `<div style="display:flex;gap:16px;text-align:center;">
        <div><div style="font-size:18px;font-weight:bold;color:#1a1a1a;">8</div><div style="font-size:11px;color:#6b7280;">FF 블로그</div></div>
        <div><div style="font-size:18px;font-weight:bold;color:#1a1a1a;">8</div><div style="font-size:11px;color:#6b7280;">NV 블로그</div></div>
        <div><div style="font-size:18px;font-weight:bold;color:#1a1a1a;">20</div><div style="font-size:11px;color:#6b7280;">Threads</div></div>
      </div>`;

  const html = `
    <div style="font-family: -apple-system, 'Pretendard', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff;">

      <div style="margin-bottom: 24px;">
        <h1 style="color: #1a1a1a; font-size: 22px; margin: 0 0 4px 0;">FORTIFYFIT</h1>
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">${dateStr}</p>
      </div>

      <!-- 동기부여 -->
      <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
        <p style="color: #1e40af; font-size: 15px; font-weight: 500; line-height: 1.6; margin: 0 0 8px 0;">
          "${quote}"
        </p>
        <p style="color: #60a5fa; font-size: 13px; margin: 0; font-style: italic;">${punch}</p>
      </div>

      <!-- 오늘 할 일 -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 12px 0;">오늘 할 일 (밤 9시까지)</h3>
        ${todayTasks.map((t) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="width:18px;height:18px;border:2px solid #d1d5db;border-radius:4px;display:inline-block;"></span>
          <span style="font-size:14px;color:#374151;">${t}</span>
        </div>`).join('')}
      </div>

      <!-- 주간 계획 -->
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <h3 style="color: #1a1a1a; font-size: 14px; margin: 0 0 12px 0;">이번 주 계획</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${weekSummaryHtml}
        </table>
      </div>

      <!-- 방향 검증: 세상이 원하는 증거 -->
      <div style="background: #faf5ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #a855f7;">
        <h3 style="color: #6b21a8; font-size: 13px; margin: 0 0 10px 0;">이 방향이 맞다는 증거</h3>
        <p style="color: #7c3aed; font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">${proof.title}</p>
        <p style="color: #374151; font-size: 13px; line-height: 1.7; margin: 0 0 6px 0;">${proof.body}</p>
        <p style="color: #9ca3af; font-size: 11px; margin: 0; font-style: italic;">출처: ${proof.source}</p>
      </div>

      <!-- 확신 메시지: 왜 네가 할 수 있나 -->
      <div style="background: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #22c55e;">
        <h3 style="color: #166534; font-size: 13px; margin: 0 0 10px 0;">그리고 너는 할 수 있다</h3>
        <p style="color: #15803d; font-size: 15px; font-weight: 600; margin: 0 0 6px 0;">${conv.title}</p>
        <p style="color: #374151; font-size: 13px; line-height: 1.7; margin: 0;">${conv.body}</p>
      </div>

      <!-- 월간 목표 -->
      <div style="background: #fffbeb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h3 style="color: #92400e; font-size: 13px; margin: 0 0 8px 0;">${monthName} 목표 (D-${daysLeft})</h3>
        ${monthGoalHtml}
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://fortifyfit-dashboard.vercel.app"
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 500;">
          대시보드에서 체크하기
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #f3f4f6; margin-bottom: 16px;" />
      <p style="color: #d1d5db; font-size: 11px; text-align: center; margin: 0;">매일 아침 9시 자동 발송 | 본진에 집중하자 | FORTIFYFIT</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'FORTIFYFIT <onboarding@resend.dev>',
      to: process.env.REMINDER_EMAIL!,
      subject: `[${dayName}] ${todayTasks[0]} — ${quote.slice(0, 20)}...`,
      html,
    });
    return NextResponse.json({ success: true, quote });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
