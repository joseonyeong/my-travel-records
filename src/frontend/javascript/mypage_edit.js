document.addEventListener('DOMContentLoaded', () => {
    // 요소 가져오기
    const profileName = document.getElementById("profile-name");
    const profileImg = document.getElementById("profile-img");
    const nicknameInput = document.getElementById("nickname");
    const passwordInput = document.getElementById("password");
    const birthDateInput = document.getElementById("birth-date");
    const registerDateInput = document.getElementById("register-date");
    const profileImageUpload = document.getElementById("profile-image-upload"); // 파일 input
    
    const saveBtn = document.querySelector(".edit-btn");
    const cancelBtn = document.querySelector(".cancel-btn");

    let selectedImageFile = null; // 사용자가 새로 선택한 이미지 파일

    // 1. 페이지 로드 시 사용자 정보 불러오기
    async function loadUserData() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        try {
            const response = await fetch('/api/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('프로필 정보 로드 실패');
            
            const data = await response.json();
            
            // 화면에 데이터 채우기
            profileName.textContent = data.nickname || data.id;
            nicknameInput.value = data.nickname || data.id;
            
            // [수정] DB에 저장된 프로필 이미지 경로를 사용
            if (data.profile_img) {
                profileImg.src = data.profile_img;
            }
            
            birthDateInput.value = data.birth ? data.birth.split('T')[0] : '';
            registerDateInput.value = data.register_date ? data.register_date.split('T')[0] : '';
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    // 2. 이미지 선택 시 미리보기 기능
    profileImageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            selectedImageFile = file; // 선택된 파일 저장
            const reader = new FileReader();
            reader.onload = (e) => {
                profileImg.src = e.target.result; // 이미지 미리보기 업데이트
            };
            reader.readAsDataURL(file);
        }
    });

    // 3. 'Save' 버튼 클릭 시 정보 저장
    saveBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("access_token");

        // 3-1. (만약 새 이미지를 선택했다면) 이미지 먼저 업로드
        if (selectedImageFile) {
            const formData = new FormData();
            formData.append("file", selectedImageFile);

            try {
                const imgRes = await fetch("/api/user/upload-profile-image", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData,
                });
                if (imgRes.status !== 204) throw new Error("이미지 업로드에 실패했습니다.");
            } catch (error) {
                alert(error.message);
                return; // 이미지 업로드 실패 시, 나머지 정보 저장을 중단
            }
        }

        // 3-2. 닉네임, 비밀번호 등 텍스트 정보 업데이트
        const passwordValue = (passwordInput.value && passwordInput.value !== '****') ? passwordInput.value : null;
        const updatedData = {
            nickname: nicknameInput.value,
            pw: passwordValue,
            birth: birthDateInput.value || null,
        };

        try {
            const infoRes = await fetch("/api/user/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (infoRes.status === 204) {
                alert("정보가 성공적으로 수정되었습니다.");
                window.location.reload(); // 페이지를 새로고침하여 변경사항 확인
            } else {
                const errorData = await infoRes.json();
                throw new Error(errorData.detail || "정보 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });
    
    // 페이지가 처음 열릴 때 사용자 정보 로드
    loadUserData();
});