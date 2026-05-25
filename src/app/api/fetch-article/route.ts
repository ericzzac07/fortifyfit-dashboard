import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FortifyfitBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();

    // og:title > title tag > URL
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1];
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
    const title = ogTitle || titleTag || url;

    // og:description > meta description
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)?.[1];
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i)?.[1];
    const description = ogDesc || metaDesc || '';

    // og:image
    const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];

    // site name
    const siteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1]
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i)?.[1]
      || new URL(url).hostname.replace('www.', '');

    // auto-detect tags
    const tags: string[] = [];
    const lower = (title + ' ' + description).toLowerCase();
    if (/seo/i.test(lower)) tags.push('SEO');
    if (/geo|generative engine/i.test(lower)) tags.push('GEO');
    if (/aeo|answer engine/i.test(lower)) tags.push('AEO');
    if (/의료|medical|healthcare|병원|피부과/i.test(lower)) tags.push('의료마케팅');
    if (/키워드|keyword/i.test(lower)) tags.push('키워드');
    if (/네이버|naver/i.test(lower)) tags.push('네이버');
    if (/thread|스레드/i.test(lower)) tags.push('Threads');
    if (/trend|트렌드/i.test(lower)) tags.push('트렌드');
    if (/schema|structured|technical|기술/i.test(lower)) tags.push('기술');
    if (tags.length === 0) tags.push('트렌드');

    return NextResponse.json({
      title: title.trim().slice(0, 200),
      description: description.trim().slice(0, 300),
      image: ogImage || null,
      siteName,
      tags,
    });
  } catch {
    return NextResponse.json({ title: url, description: '', image: null, siteName: '', tags: ['트렌드'] });
  }
}
