const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/api/search', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ error: '검색어(q)가 필요합니다.' });
  }

  try {
    const url = new URL('https://html.duckduckgo.com/html/');
    url.searchParams.set('q', query);

    const ddgRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StarChatbot/1.0)',
      },
    });

    if (!ddgRes.ok) {
      return res.status(502).json({ error: '검색 요청이 실패했습니다.' });
    }

    const html = await ddgRes.text();
    res.json({ results: parseDuckDuckGoHtml(html).slice(0, 8) });
  } catch (err) {
    res.status(502).json({ error: '검색 서버 오류가 발생했습니다.' });
  }
});

function parseDuckDuckGoHtml(html) {
  const results = [];
  const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

  let match;
  while ((match = resultRegex.exec(html)) !== null) {
    const rawUrl = match[1];
    const title = stripTags(match[2]);
    const description = stripTags(match[3]);
    results.push({
      title,
      url: resolveDuckDuckGoUrl(rawUrl),
      description,
    });
  }
  return results;
}

function resolveDuckDuckGoUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl, 'https://duckduckgo.com');
    const target = parsed.searchParams.get('uddg');
    return target ? decodeURIComponent(target) : parsed.toString();
  } catch {
    return rawUrl;
  }
}

function stripTags(str) {
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

app.listen(PORT, () => {
  console.log(`스타 챗봇 서버 실행 중: http://localhost:${PORT}`);
});
