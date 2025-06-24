document.addEventListener('DOMContentLoaded', () => {
    // HTML 요소 가져오기
    const profileNameElement = document.getElementById("profile-name");
    const profileImgElement = document.getElementById("profile-img");
    const nicknameInputElement = document.getElementById("nickname");
    const passwordInputElement = document.getElementById("password");
    const birthDateInputElement = document.getElementById("birth-date");
    const registerDateInputElement = document.getElementById("register-date");
    const profileImageUploadElement = document.getElementById("profile-image-upload");
    const postCountElement = document.getElementById('post-count');
    const locationCountElement = document.getElementById('location-count'); // ✨ HTML과 일치하도록 ID 수정
    const saveBtn = document.querySelector(".edit-btn");
    const cancelBtn = document.querySelector(".cancel-btn");

    let selectedImageFile = null; // 사용자가 새로 선택한 이미지 파일을 저장할 변수

    // 1. 페이지 로드 시 사용자 프로필 정보(통계 포함) 모두 불러오기
    async function loadProfileData() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        try {
            // ✨ API 호출을 '/api/mypage/profile' 하나로 통합
            const response = await fetch('/api/mypage/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('프로필 정보 로드에 실패했습니다.');
            }

            const data = await response.json();

            // --- 화면에 데이터 채우기 ---
            profileNameElement.textContent = data.nickname || data.id;
            nicknameInputElement.value = data.nickname || data.id;

            profileImgElement.src = data.profile_img || '/public/images/profile_ex.png';

            // 날짜 형식을 'YYYY-MM-DD'로 변환하여 input에 설정
            if (data.birth) {
                birthDateInputElement.value = new Date(data.birth).toISOString().split('T')[0];
            }
            if (data.register_date) { // ✨ DB 모델에 맞게 register_date로 수정
                registerDateInputElement.value = new Date(data.register_date).toLocaleDateString('ko-KR');
            }

            // 통계 데이터 업데이트
            postCountElement.textContent = data.post_count;
            locationCountElement.textContent = `${data.location_count} / 25`;

        } catch (error) {
            console.error('프로필 정보 로드 에러:', error);
            alert(error.message);
        }
    }

    // 2. 이미지 선택 시 미리보기 기능
    profileImageUploadElement.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            selectedImageFile = file; // 선택된 파일 전역 변수에 저장
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImgElement.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // 3. 'Save' 버튼 클릭 시 정보 저장
    saveBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }

        // 3-1. 새 이미지를 선택했다면, 이미지 먼저 업로드
        if (selectedImageFile) {
            const formData = new FormData();
            formData.append("file", selectedImageFile);

            try {
                const imgRes = await fetch("/api/mypage/profile/image", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData,
                });

                if (imgRes.status !== 204) { // 204 No Content가 아니면 에러로 간주
                    const errorBody = await imgRes.json().catch(() => ({}));
                    throw new Error(errorBody.detail || "이미지 업로드에 실패했습니다.");
                }
                selectedImageFile = null; // 업로드 성공 후 선택된 파일 초기화
            } catch (error) {
                console.error('이미지 업로드 에러:', error);
                alert(error.message);
                return; // 이미지 업로드 실패 시 중단
            }
        }

        // 3-2. 텍스트 정보(닉네임, 생일 등) 업데이트
        const updatedData = {
            nickname: nicknameInputElement.value,
            // 비밀번호는 값이 있고, 기본값 '****'가 아닐 때만 전송
            pw: (passwordInputElement.value && passwordInputElement.value !== '****') ? passwordInputElement.value : null,
            birth: birthDateInputElement.value || null
        };
        
        // 값이 null인 필드는 전송하지 않도록 정리
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === null) {
                delete updatedData[key];
            }
        });

        try {
            const infoRes = await fetch("/api/mypage/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (infoRes.status === 204) {
                alert("정보가 성공적으로 수정되었습니다.");
                window.location.href = "/mypage.html";
            } else {
                const errorData = await infoRes.json().catch(() => ({}));
                throw new Error(errorData.detail || "정보 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error('정보 수정 에러:', error);
            alert(error.message);
        }
    });

    // --- 페이지가 처음 열릴 때 프로필 정보 로드 함수 실행 ---
    loadProfileData();
});
const logoutBtn = document.getElementById("logout-btn"); 
// 또는 querySelector('.nav .nav-btn[href="/logout"]') 사용 가능

if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    // a 태그의 기본 동작(페이지 이동)을 막음
    e.preventDefault();

    // 로컬 스토리지에서 인증 정보 삭제
    localStorage.removeItem("access_token");
    localStorage.removeItem("username"); // username도 저장했다면 함께 삭제
    localStorage.setItem("is_login", "false"); // 로그인 상태를 false로 설정 (선택 사항)

    // 로그아웃 후 메인 페이지(index.html)로 이동
    alert("로그아웃 되었습니다.");
    window.location.href = "/index.html";
  });
}