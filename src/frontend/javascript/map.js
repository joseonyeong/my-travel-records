document.getElementById('plusBtn').addEventListener('click', () => {
  alert('게시물 작성 버튼 생성 예정!');
  // 이 부분에 게시물 작성 modal 또는 버튼 표시 구현 예정
});

// 예: nav 버튼 클릭 시 active 클래스 토글
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
