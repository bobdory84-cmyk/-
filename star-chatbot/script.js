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
  results.innerHTML = '<p class="results-status">웹에서 실시간으로 검색 중...</p>';

  try {
    const res = await fetch('/api/search?q=' + encodeURIComponent(query));
    if (!res.ok) {
      throw new Error((await res.json().catch(() => ({}))).error || '검색 요청이 실패했습니다.');
    }
    const data = await res.json();
    renderResults(query, data.results || []);
  } catch (err) {
    results.innerHTML =
      '<p class="results-status results-error">검색에 실패했습니다: ' + escapeHtml(err.message) + '</p>';
  }
});

function renderResults(query, items) {
  if (!items.length) {
    results.innerHTML = '<p class="results-status">"' + escapeHtml(query) + '"에 대한 검색 결과가 없습니다.</p>';
    return;
  }

  const list = items
    .map(
      (item) => `
        <a class="result-card" href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer">
          <p class="result-title">${escapeHtml(item.title)}</p>
          <p class="result-url">${escapeHtml(item.url)}</p>
          <p class="result-desc">${escapeHtml(item.description)}</p>
        </a>
      `
    )
    .join('');

  results.innerHTML =
    '<p class="results-query">"' + escapeHtml(query) + '" 실시간 검색 결과</p>' +
    '<div class="results-list">' + list + '</div>';
}

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
