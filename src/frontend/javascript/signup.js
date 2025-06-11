document.addEventListener("DOMContentLoaded", () => {
  const userIdInput = document.getElementById("userId");
  const passwordInput = document.getElementById("password");
  const passwordCheckInput = document.getElementById("passwordCheck");
  const checkBtn = document.querySelector(".check-btn");
  const signupForm = document.getElementById("signupForm");

  let isIdChecked = false;
  let lastCheckedId = "";

  // 아이디 중복 확인
  checkBtn.addEventListener("click", async () => {
    const enteredId = userIdInput.value.trim();
    if (!enteredId) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/api/user/check-id?id=${encodeURIComponent(enteredId)}`);
      const data = await response.json();

      if (response.ok && data.available) {
        alert("사용 가능한 아이디입니다.");
        isIdChecked = true;
        lastCheckedId = enteredId;
      } else {
        alert(data.detail || "이미 존재하는 아이디입니다.");
        isIdChecked = false;
      }
    } catch (error) {
      console.error("아이디 중복 확인 중 오류:", error);
      alert("서버와 연결할 수 없습니다.");
      isIdChecked = false;
    }
  });

  // 회원가입 제출
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = userIdInput.value.trim();
    const pw = passwordInput.value.trim();
    const pw_confirm = passwordCheckInput.value.trim();

    if (!isIdChecked || lastCheckedId !== id) {
      alert("아이디 중복 확인을 다시 해주세요.");
      return;
    }

    if (pw !== pw_confirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch("/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, pw, pw_confirm }),
      });

      if (response.status === 204) {
        alert("회원가입이 완료되었습니다.");
        window.location.href = "/index.html";
      } else {
        const data = await response.json();
        alert(data.detail || "회원가입 실패");
      }
    } catch (error) {
      console.error("회원가입 중 오류:", error);
      alert("서버와 연결할 수 없습니다.");
    }
  });
});
