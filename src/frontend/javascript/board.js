// static/javascript/board.js

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. 제어할 요소들을 모두 가져옵니다 ---
    const boardForm = document.getElementById('board-form');
    const imageUploadWrapper = document.querySelector('.image-upload-wrapper');
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const deleteImageButton = document.getElementById('deleteImage');
    const defaultIconPath = '/images/CAMERAICON.png';

    
    // --- 2. 이미지 미리보기 관련 기능 ---

    // 미리보기 영역을 클릭하면 숨겨진 파일 입력창을 엽니다.
    imageUploadWrapper.addEventListener('click', function(event) {
        // 단, 삭제 버튼을 누른 경우는 제외합니다.
        if (event.target !== deleteImageButton) {
            imageInput.click();
        }
    });

    // 사용자가 이미지 파일을 선택했을 때의 동작입니다.
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                deleteImageButton.style.display = 'block';
                // [추가] 미리보기 영역의 크기를 키우기 위해 'uploaded' 클래스를 추가합니다.
                imageUploadWrapper.classList.add('uploaded');
            }
            reader.readAsDataURL(file);
        }
    });

    // 삭제 버튼(X)을 클릭했을 때의 동작입니다.
    deleteImageButton.addEventListener('click', function(event) {
        event.stopPropagation(); // 클릭 이벤트가 뒤의 미리보기 영역으로 전파되는 것을 막습니다.
        previewImage.src = defaultIconPath;
        imageInput.value = ''; // 파일 선택을 초기화합니다.
        deleteImageButton.style.display = 'none';
        // [추가] 미리보기 영역의 크기를 다시 줄이기 위해 'uploaded' 클래스를 제거합니다.
        imageUploadWrapper.classList.remove('uploaded');
    });


    // --- 3. 폼 제출 관련 기능 ---

    // 'Post In' 버튼을 눌러 폼이 제출될 때의 동작입니다.
    boardForm.addEventListener('submit', function(event) {
        // 기본 폼 제출(새로고침) 동작을 막습니다.
        event.preventDefault();

        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        // 폼 데이터를 FormData 객체로 만듭니다. (파일 포함)
        const formData = new FormData(boardForm);

        // fetch API를 사용해 서버에 데이터를 비동기적으로 전송합니다.
        fetch('/api/board/create', {
            method: 'POST',
            headers: {
                // 헤더에 인증 토큰을 담아 보냅니다.
                'Authorization': `Bearer ${token}`
                // 'Content-Type'은 FormData 사용 시 브라우저가 자동으로 설정하므로 생략합니다.
            },
            body: formData // 폼 데이터를 body에 담습니다.
        })
        .then(response => {
            // 서버 응답이 리다이렉션일 경우, 해당 주소로 페이지를 이동시킵니다.
            if (response.redirected) {
                window.location.href = response.url;
            } else if (!response.ok) {
                // 리다이렉션이 아니고, 응답이 실패(2xx 상태코드가 아님)했을 경우
                // JSON 형태의 에러 메시지를 파싱해서 사용자에게 보여줍니다.
                return response.json().then(data => {
                    alert(data.detail || '게시글 작성에 실패했습니다.');
                });
            }
        })
        .catch(error => {
            console.error('게시글 작성 중 오류 발생:', error);
            alert('게시글 작성 중 네트워크 오류가 발생했습니다.');
        });
    });
});