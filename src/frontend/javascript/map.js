document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('plusBtn').addEventListener('click', () => {
    alert('게시물 작성 버튼 생성 예정!');
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});