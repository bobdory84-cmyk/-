const micBtn = document.getElementById('micBtn');
const promptInput = document.getElementById('promptInput');

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
