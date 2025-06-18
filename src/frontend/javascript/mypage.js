document.addEventListener('DOMContentLoaded', () => {
    // 1. 페이지가 시작되면 바로 토큰을 확인합니다.
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login.html';
        return;
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // --- 사용자 프로필 정보와 게시물/장소 통계 가져오기 ---
    // [수정] API 경로를 새로운 /api/mypage/profile 로 변경했습니다.
    fetch('/api/mypage/profile', { headers })
        .then(response => {
            if (!response.ok) {
                // 실패 시, 서버가 보내주는 에러 메시지를 보여줍니다.
                return response.json().then(err => { throw new Error(err.detail || '사용자 정보를 불러오는데 실패했습니다.') });
            }
            return response.json();
        })
        .then(user => {
            // 화면에 닉네임, 프로필 이미지, 게시물 수를 채워넣습니다.
            document.getElementById('user-nickname').textContent = user.nickname || user.id;
            document.getElementById('post-count').textContent = user.post_count;
            
            const avatar = document.getElementById('user-avatar');
            if (user.profile_img) {
                avatar.src = user.profile_img;
            } else {
                // 기본 이미지가 없을 경우를 대비한 경로
                avatar.src = '/static/images/profile_ex.jpg'; 
            }
        })
        .catch(error => {
            console.error('내 정보 로딩 실패:', error);
            alert(error.message);
            // 에러 발생 시 안전하게 로그인 페이지로 보냅니다.
            window.location.href = '/login.html';
        });

    // --- 내가 작성한 게시물 목록(사진) 가져오기 ---
    fetch('/api/board/me', { headers })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || '게시물 목록을 불러오는데 실패했습니다.') });
            }
            return response.json();
        })
        .then(boards => {
            const gallery = document.getElementById('photo-gallery');
            gallery.innerHTML = ''; // 기존 내용을 비웁니다.

            boards.forEach(board => {
                // 각 게시물의 첫 번째 이미지를 대표 이미지로 사용합니다.
                const imageUrl = (board.images && board.images.length > 0) 
                    ? board.images[0].img_url 
                    : '/static/images/default_image.png'; // 게시물에 이미지가 없을 경우

                const photoItemHTML = `
                    <div class="photo-item" data-post-id="${board.board_id}">
                        <img src="${imageUrl}" alt="${board.title}">
                        <div class="photo-info">
                           <p class="photo-title">${board.title}</p>
                        </div>
                        <button class="delete-photo-btn" title="삭제">×</button>
                    </div>
                `;
                gallery.insertAdjacentHTML('beforeend', photoItemHTML);
            });
        })
        .catch(error => console.error('게시물 목록 로딩 실패:', error));

    // --- 게시물 삭제 버튼 이벤트 처리 ---
    const photoGallery = document.getElementById('photo-gallery');
    photoGallery.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-photo-btn')) {
            const isConfirmed = confirm("정말로 이 게시물을 삭제하시겠습니까?");
            if (isConfirmed) {
                const photoItem = event.target.closest('.photo-item');
                const postId = photoItem.dataset.postId;
                deletePost(postId, photoItem);
            }
        }
    });
});

async function deletePost(postId, elementToRemove) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('삭제 권한이 없습니다.');
        return;
    }

    try {
        const response = await fetch(`/api/board/delete/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('게시물이 성공적으로 삭제되었습니다.');
            elementToRemove.remove();
            
            // 게시물 숫자 실시간으로 1 감소
            const postCountEl = document.getElementById('post-count');
            let currentCount = parseInt(postCountEl.textContent);
            if (!isNaN(currentCount)) {
                postCountEl.textContent = currentCount - 1;
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(errorData.detail || '삭제 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('삭제 요청 중 에러 발생:', error);
        alert('삭제 요청 중 네트워크 오류가 발생했습니다.');
    }
}
