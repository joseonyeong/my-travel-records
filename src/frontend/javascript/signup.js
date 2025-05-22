document.addEventListener("DOMContentLoaded", () => {
  const userIdInput = document.getElementById("userId");
  const passwordInput = document.getElementById("password");
  const passwordCheckInput = document.getElementById("passwordCheck");
  const checkBtn = document.querySelector(".check-btn");
  const signupForm = document.getElementById("signupForm");

  let isIdChecked = false;

  // 가짜 중복 확인 기능 (실제는 서버와 통신 필요)
  checkBtn.addEventListener("click", () => {
    const enteredId = userIdInput.value.trim();
    if (!enteredId) {
      alert("아이디를 입력해주세요.");
      return;
    }

    // 예시: 'testuser'는 이미 존재하는 아이디라고 가정
    if (enteredId.toLowerCase() === "testuser") {
      alert("이미 존재하는 아이디입니다.");
      isIdChecked = false;
    } else {
      alert("사용 가능한 아이디입니다.");
      isIdChecked = true;
    }
  });

  // 회원가입 폼 제출
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!isIdChecked) {
      alert("아이디 중복 확인을 먼저 해주세요.");
      return;
    }

    const password = passwordInput.value;
    const passwordCheck = passwordCheckInput.value;

    if (password.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (password !== passwordCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 성공 메시지 (또는 서버 전송 로직)
    alert("회원가입이 완료되었습니다!");

    // 이후 로그인 페이지로 이동 가능
    window.location.href = "../html/action_main.html";
  });
});
