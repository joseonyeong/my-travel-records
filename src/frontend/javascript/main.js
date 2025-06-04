// 로그아웃 시 토큰 삭제 및 페이지 이동
document.querySelector('.nav .nav-btn[href="/logout"]').addEventListener("click", async (e) => {
  e.preventDefault();

  // localStorage에 저장된 인증 정보 삭제
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");
  localStorage.setItem("is_login", "false");

  // 로그아웃 후 로그인 페이지로 이동 (필요 시 경로 변경 가능)
  window.location.href = "/index.html";
});