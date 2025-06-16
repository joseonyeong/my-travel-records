// src/frontend/javascript/board.js

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 이미지 미리보기 로직 (기존과 동일) ---
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const deleteImageButton = document.getElementById('deleteImage');
    const imageUploadWrapper = document.querySelector('.image-upload-wrapper');
    const defaultIconPath = '/images/CAMERAICON.png';

    imageUploadWrapper.addEventListener('click', function(event) {
        if (event.target !== deleteImageButton) {
            imageInput.click();
        }
    });

    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                deleteImageButton.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });

    deleteImageButton.addEventListener('click', function() {
        previewImage.src = defaultIconPath;
        imageInput.value = ''; 
        deleteImageButton.style.display = 'none';
    });

    // --- (가장 중요) 폼 제출 처리 로직 추가 ---
    const boardForm = document.getElementById('board-form');

    boardForm.addEventListener('submit', function(event) {
        // 1. 폼의 기본 제출 동작(페이지 새로고침)을 막습니다.
        event.preventDefault();

        // 2. localStorage에서 토큰을 가져옵니다.
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        // 3. 폼 데이터를 FormData 객체로 만듭니다.
        const formData = new FormData(boardForm);

        // 4. fetch를 사용해 서버에 데이터를 전송합니다.
        fetch('/api/board/create', {
            method: 'POST',
            headers: {
                // 5. Authorization 헤더에 토큰을 담아 보냅니다.
                'Authorization': `Bearer ${token}`
            },
            body: formData // 폼 데이터를 body에 담습니다.
        })
        .then(response => {
            // 서버의 응답이 리다이렉트(페이지 이동) 응답이면
            if (response.redirected) {
                // 해당 URL로 페이지를 이동시킵니다.
                window.location.href = response.url;
            } else {
                // 다른 응답이 오면 JSON으로 파싱합니다.
                return response.json();
            }
        })
        .then(data => {
            if (data) {
                // 만약 에러 메시지가 있다면 표시합니다.
                alert(data.detail || '알 수 없는 오류가 발생했습니다.');
            }
        })
        .catch(error => {
            console.error('게시글 작성 중 오류 발생:', error);
            alert('게시글 작성에 실패했습니다.');
        });
    });
});