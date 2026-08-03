const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BRAVE_API_KEY = process.env.BRAVE_API_KEY;

app.use(express.static(__dirname));

app.get('/api/search', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ error: '검색어(q)가 필요합니다.' });
  }
  if (!BRAVE_API_KEY) {
    return res.status(500).json({ error: '서버에 BRAVE_API_KEY가 설정되어 있지 않습니다.' });
  }

  try {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', '8');

    const braveRes = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY,
      },
    });

    if (!braveRes.ok) {
      return res.status(braveRes.status).json({ error: 'Brave Search API 요청이 실패했습니다.' });
    }

    const data = await braveRes.json();
    const results = (data.web?.results || []).map((item) => ({
      title: item.title,
      url: item.url,
      description: item.description,
    }));

    res.json({ results });
  } catch (err) {
    res.status(502).json({ error: '검색 서버 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`스타 챗봇 서버 실행 중: http://localhost:${PORT}`);
});
