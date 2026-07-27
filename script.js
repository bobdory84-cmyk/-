document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const note = document.getElementById('formNote');
  note.textContent = `${name}님, 상담 신청이 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.`;
  this.reset();
});
