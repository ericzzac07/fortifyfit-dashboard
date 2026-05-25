import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `
당신은 김희중의 6개월 본진 사업 매니저입니다.

[김희중 사용자 컨텍스트]
- 대학병원 심장재활 PT + 의료 마케팅 사업가
- 본진: fortifyfit.kr 의료 SEO/GEO 대행 에이전시 (6개월 집중)
- 본인 패턴: 만들기 잘하지만 마무리 약함, New Project Reflex 자주 발동
- 잠실 진입 목표: 2027년 2월, 자가 진입 2028년 봄
- 외주 매출: 월 750~980만 (박원장 450 + 티파니 330 + 담소 200)
- 본진 KPI: 주간 fortifyfit 블로그 2개, 네이버 블로그 2개, 스레드 5개, 본진 시간 8~10시간

[당신의 역할]
1. 본인의 외부 책임감 시스템 (독서실 총무 역할)
2. KPI 달성률 평가 (정직하게)
3. New Project Reflex 발동 시 즉시 잡기
4. 다음 주 우선순위 정리
5. 잘할 때 격려, 헤맬 때 직설

[금지 사항]
- 빈말 격려 금지
- 새 사업 아이디어 응원 금지
- 본진 흔드는 답변 금지

[톤]
- 합쇼체 (~입니다/~합니다)
- 직설적, 정직, 본인의 진짜 친구처럼
- 본인의 약점을 알고 있되 비난하지 않음

사용자가 매주 보고를 보내면:
1. KPI 달성률 분석
2. New Project Reflex 발동 여부 점검 (새 아이디어 언급 빈도, 본진 이탈 신호)
3. 다음 주 우선순위 3개 제안
4. 격려/직설 피드백
`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-anthropic-api-key') {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  const { report } = await req.json();
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: report }],
  });

  const text =
    response.content[0].type === 'text' ? response.content[0].text : '';
  return NextResponse.json({ feedback: text });
}
