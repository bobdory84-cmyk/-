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
    const results = parseDuckDuckGoHtml(html).slice(0, 8);
    res.json({ results, summary: buildSummary(results) });
  } catch (err) {
    res.status(502).json({ error: '검색 서버 오류가 발생했습니다.' });
  }
});

function buildSummary(results) {
  if (!results.length) return '';

  const sentences = [];
  for (const item of results.slice(0, 3)) {
    if (item.description) sentences.push(item.description.replace(/\s+/g, ' ').trim());
  }
  return sentences.join(' ');
}

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

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';

app.get('/api/ask', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.status(400).json({ error: '질문(q)이 필요합니다.' });
  }

  try {
    const ollamaRes = await fetch(OLLAMA_URL + '/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: '다음 질문에 한국어로 짧고 친절하게, 초등학생도 이해하기 쉽게 3문장 이내로 답해줘.\n질문: ' + query,
        stream: false,
      }),
    });

    if (!ollamaRes.ok) {
      return res.status(502).json({ error: '올라마 서버 응답에 실패했습니다. ollama serve가 실행 중인지 확인해주세요.' });
    }

    const data = await ollamaRes.json();
    res.json({ answer: (data.response || '').trim() });
  } catch (err) {
    res.status(502).json({
      error: '올라마에 연결하지 못했습니다. 컴퓨터에서 Ollama 앱(또는 `ollama serve`)이 실행 중인지 확인해주세요.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`스타 챗봇 서버 실행 중: http://localhost:${PORT}`);
});
