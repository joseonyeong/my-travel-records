// src/frontend/javascript/post.js

// 웹 페이지의 모든 HTML 요소가 로드된 후에 이 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', function() {
    
    // HTML에서 필요한 요소들을 가져옵니다.
    const imageInput = document.getElementById('imageInput');        // <input type="file">
    const previewImage = document.getElementById('previewImage');      // <img> 미리보기 태그
    const deleteImageButton = document.getElementById('deleteImage'); // 삭제 버튼
    const imageUploadWrapper = document.querySelector('.image-upload-wrapper'); // 이미지 업로드 영역

    // 기본 카메라 아이콘 이미지의 경로를 저장해 둡니다.
    const defaultIconPath = '/html/CAMERAICON.png';

    // 이미지 업로드 영역을 클릭하면 숨겨진 input[type=file]이 클릭되도록 합니다.
    imageUploadWrapper.addEventListener('click', function(event) {
        // 만약 삭제 버튼을 누른 거라면 파일 선택창이 열리지 않도록 합니다.
        if (event.target !== deleteImageButton) {
            imageInput.click();
        }
    });

    // 사용자가 이미지 파일을 선택했을 때 실행될 함수입니다.
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0]; // 선택된 파일 가져오기

        if (file) {
            // FileReader 객체를 사용해 선택된 파일을 읽습니다.
            const reader = new FileReader();
            
            // 파일 읽기가 완료되면 실행될 콜백 함수입니다.
            reader.onload = function(e) {
                // 읽은 파일 데이터를 이미지 미리보기 태그의 src로 설정합니다.
                previewImage.src = e.target.result;
                // 삭제 버튼을 보여줍니다.
                deleteImageButton.style.display = 'block';
            }
            
            // 파일을 데이터 URL 형식으로 읽어들입니다.
            reader.readAsDataURL(file);
        }
    });

    // 삭제 버튼을 클릭했을 때 실행될 함수입니다.
    deleteImageButton.addEventListener('click', function() {
        // 이미지 미리보기를 기본 카메라 아이콘으로 되돌립니다.
        previewImage.src = defaultIconPath;
        // 파일 선택 input의 값을 비워서, 폼 제출 시 파일이 전송되지 않도록 합니다.
        imageInput.value = ''; 
        // 삭제 버튼을 다시 숨깁니다.
        deleteImageButton.style.display = 'none';
    });
});