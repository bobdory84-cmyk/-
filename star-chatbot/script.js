const micBtn = document.getElementById('micBtn');
const promptInput = document.getElementById('promptInput');
const promptForm = document.getElementById('promptForm');
const landingTop = document.getElementById('landingTop');
const results = document.getElementById('results');

promptForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const query = promptInput.value.trim();
  if (!query) return;

  landingTop.hidden = true;
  results.hidden = false;
  results.innerHTML =
    '<p class="results-status"><span class="dot-spinner"><span></span><span></span><span></span></span> 스타가 생각하는 중...</p>';

  const [askResult, searchResult] = await Promise.allSettled([
    fetch('/api/ask?q=' + encodeURIComponent(query)).then(async (res) => {
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'AI 응답 실패');
      return res.json();
    }),
    fetch('/api/search?q=' + encodeURIComponent(query)).then(async (res) => {
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || '검색 실패');
      return res.json();
    }),
  ]);

  const summaryBlock =
    askResult.status === 'fulfilled' && askResult.value.answer
      ? `
          <div class="summary-card">
            <p class="summary-label">✦ 스타의 답변</p>
            <p class="summary-text">${escapeHtml(askResult.value.answer)}</p>
          </div>
        `
      : `
          <div class="notice-card">
            <p class="notice-desc">${escapeHtml(
              askResult.status === 'rejected' ? askResult.reason.message : 'AI 답변을 가져오지 못했어요.'
            )}</p>
          </div>
        `;

  const items = searchResult.status === 'fulfilled' ? searchResult.value.results || [] : [];
  const sourcesBlock = items.length
    ? '<p class="sources-label">참고할 만한 검색 결과</p><div class="results-list">' +
      items
        .map(
          (item) => `
            <a class="result-card" href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer">
              <p class="result-title">${escapeHtml(item.title)}</p>
              <p class="result-url">${escapeHtml(item.url)}</p>
              <p class="result-desc">${escapeHtml(item.description)}</p>
            </a>
          `
        )
        .join('') +
      '</div>'
    : '';

  results.innerHTML =
    '<p class="results-query">"' + escapeHtml(query) + '"</p>' + summaryBlock + sourcesBlock;
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  micBtn.disabled = true;
  micBtn.title = '이 브라우저는 음성 입력을 지원하지 않습니다.';
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR';
  recognition.interimResults = true;
  recognition.continuous = false;

  let listening = false;

  recognition.addEventListener('result', (event) => {
    let transcript = '';
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    promptInput.value = transcript;
  });

  recognition.addEventListener('end', () => {
    listening = false;
    micBtn.classList.remove('recording');
  });

  recognition.addEventListener('error', () => {
    listening = false;
    micBtn.classList.remove('recording');
  });

  micBtn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
      return;
    }
    listening = true;
    micBtn.classList.add('recording');
    promptInput.focus();
    recognition.start();
  });
}
