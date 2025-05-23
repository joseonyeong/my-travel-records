document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const userId = document.getElementById("userId").value.trim();
  const password = document.getElementById("password").value.trim();

  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("password", password);

  try {
    const response = await fetch("/login", {
      method: "POST",
      body: formData,
    });

    if (response.redirected) {
      // FastAPI가 리다이렉트하면 그 URL로 이동
      window.location.href = response.url;
    } else if (!response.ok) {
      const data = await response.json();
      alert(data.detail || "로그인 실패");
    }
  } catch (error) {
    alert("서버와 연결할 수 없습니다.");
  }
});
