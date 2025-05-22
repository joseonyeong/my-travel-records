document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const userId = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value.trim();

  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("password", password);

  try {
    // '/login' = fastapi쪽 서버의 API 엔드포인트(즉, 백엔드에서 처리하는 경로)
    const response = await fetch("/login", {
      method: "POST",
      body: formData,
    });

    if (response.redirected) {
      // 로그인 성공: 서버가 리다이렉트 응답하면 그 페이지로 이동
      window.location.href = response.url; // 해당 url (action_main.html) 지정은 fastapi가
    } else if (!response.ok) {
      // 실패: 서버가 에러 응답 주면 에러 메시지 띄움
      const data = await response.json();
      alert(data.detail || "로그인 실패");
    }
  } catch (error) {
    alert("서버와 연결할 수 없습니다.");
  }
});
