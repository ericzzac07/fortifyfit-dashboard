import { NextResponse } from 'next/server';
import { Resend } from 'resend';

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

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

export async function GET(request: Request) {
  // Cron 인증 (Vercel cron secret)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const today = new Date();
  const dayName = WEEKDAY[today.getDay()];
  const dateStr = today.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 4px;">FORTIFYFIT</h2>
      <p style="color: #9ca3af; font-size: 13px; margin-bottom: 24px;">${dateStr}</p>

      <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="color: #1e40af; font-size: 16px; font-weight: 500; line-height: 1.6; margin: 0;">
          "${quote}"
        </p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px 0;">오늘 할 일 확인하기:</p>
        <a href="https://fortifyfit-dashboard.vercel.app"
           style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px;">
          대시보드 열기
        </a>
      </div>

      <p style="color: #d1d5db; font-size: 11px; text-align: center;">매일 아침 자동 발송 | FORTIFYFIT Dashboard</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'FORTIFYFIT <onboarding@resend.dev>',
      to: process.env.REMINDER_EMAIL!,
      subject: `[${dayName}] ${quote.slice(0, 30)}...`,
      html,
    });
    return NextResponse.json({ success: true, quote });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
