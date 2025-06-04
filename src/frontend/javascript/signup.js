document.addEventListener("DOMContentLoaded", () => {
  const userIdInput = document.getElementById("userId");
  const passwordInput = document.getElementById("password");
  const passwordCheckInput = document.getElementById("passwordCheck");
  const checkBtn = document.querySelector(".check-btn");
  const signupForm = document.getElementById("signupForm");

  let isIdChecked = false;

  // 아이디 중복 확인 (나중에 FastAPI와 연결 가능)
  checkBtn.addEventListener("click", async () => {
    const enteredId = userIdInput.value.trim();
    if (!enteredId) {
      alert("아이디를 입력해주세요.");
      return;
    }

    // 나중에 fetch("/check-id", { method: "POST", body: ... })로 변경 가능
    if (enteredId.toLowerCase() === "testuser") {
      alert("이미 존재하는 아이디입니다.");
      isIdChecked = false;
    } else {
      alert("사용 가능한 아이디입니다.");
      isIdChecked = true;
    }
  });

  // 회원가입 제출
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // 자동제출 막기

    if (!isIdChecked) {
      alert("아이디 중복 확인을 먼저 해주세요.");
      return;
    }

    const userId = userIdInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();

    if (password !== passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("password", password);

    try {
      const response = await fetch("/signup", {
        method: "POST",
        body: formData, // FastAPI에서 Form(...)으로 받을 수 있게
      });

      if (response.redirected) {
        // 회원가입 성공 → FastAPI가 지정한 URL로 리다이렉션
        window.location.href = response.url;
      } else if (!response.ok) {
        const data = await response.json();
        alert(data.detail || "회원가입 실패");
      }
    } catch (error) {
      console.error("서버 연결 실패:", error);
      alert("서버와의 연결 중 문제가 발생했습니다.");
    }
  });
});