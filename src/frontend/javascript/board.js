document.addEventListener('DOMContentLoaded', function() {
    const cancelbtn = document.querySelector('.cancel-btn');
    if(cancelbtn){
        cancelbtn.addEventListener("click", () => {
            window.location.href="/map.html";
        })
    }

    
    // --- 1. 제어할 요소들을 모두 가져옵니다 ---
    const boardForm = document.getElementById('board-form');
    const imageUploadWrapper = document.querySelector('.image-upload-wrapper');
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const deleteImageButton = document.getElementById('deleteImage');
    const defaultIconPath = '/static/images/CAMERAICON.png'; 

    
    // --- 2. 이미지 미리보기 관련 기능 ---
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
                imageUploadWrapper.classList.add('uploaded');
            }
            reader.readAsDataURL(file);
        }
    });

    deleteImageButton.addEventListener('click', function() {
        previewImage.src = defaultIconPath;
        imageInput.value = ''; 
        deleteImageButton.style.display = 'none';
        imageUploadWrapper.classList.remove('uploaded');
    });


    // --- 3. 폼 제출 관련 기능 ---
    boardForm.addEventListener('submit', function(event) {
        // 기본 폼 제출(새로고침) 동작을 막습니다.
        event.preventDefault();

        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        const formData = new FormData(boardForm);

        // [개선] 버튼을 비활성화해서 중복 제출을 막습니다.
        const submitButton = boardForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Posting...';

        fetch('/api/board/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })
        .then(response => {
            // 서버 응답이 리다이렉션일 경우, 해당 주소로 페이지를 이동시킵니다.
            if (response.redirected) {
                window.location.href = response.url;
                return; // 리다이렉션 후에는 더 이상 처리하지 않음
            }
            
            // 응답이 실패(2xx 상태코드가 아님)했을 경우
            if (!response.ok) {
                // JSON 형태의 에러 메시지를 파싱해서 Promise.reject로 에러를 넘깁니다.
                return response.json().then(errorData => Promise.reject(errorData));
            }
            
            // 성공적인 응답 처리 (예: 성공 메시지 후 페이지 이동)
            // 성공 후 이동할 페이지가 있다면 여기에 추가
            // window.location.href = '/board/list.html'; 
            return response.json(); // 성공 데이터를 다음 .then()으로 넘길 수 있음
        })
        .catch(error => {
            // Promise.reject로 넘어온 에러 또는 네트워크 에러를 여기서 처리합니다.
            console.error('게시글 작성 중 오류 발생:', error);
            alert(error.detail || '게시글 작성 중 오류가 발생했습니다.');
        })
        .finally(() => {
            // 성공/실패 여부와 관계없이 버튼을 다시 활성화 시킵니다.
            submitButton.disabled = false;
            submitButton.textContent = 'Post';
        }); 
    }); 
}); 