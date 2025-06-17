document.addEventListener('DOMContentLoaded', () => {
    // 1. localStorage에서 JWT 토큰을 가져옵니다.
    const token = localStorage.getItem('access_token');

    // 토큰이 없으면 로그인 페이지로 보냅니다.
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login.html';
        return;
    }

    // API 요청 헤더에 토큰을 포함시킵니다.
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    // --- 사용자 정보 가져오기 ---
    fetch('/api/user/me', { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('사용자 정보를 불러오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(user => {
            document.getElementById('user-nickname').textContent = user.id;
            const avatar = document.getElementById('user-avatar');
            if (user.profile_img) {
                avatar.src = user.profile_img;
            }
        })
        .catch(error => {
            console.error('내 정보 로딩 실패:', error);
            window.location.href = '/login.html';
        });

    // --- 내 게시물 목록 가져오기 ---
    fetch('/api/board/me', { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('게시물 목록을 불러오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(boards => {
            const gallery = document.getElementById('photo-gallery');
            const postCount = document.getElementById('post-count');
            
            postCount.textContent = boards.length;
            gallery.innerHTML = ''; 

            // ★★★ 변경점: board.title을 표시하는 <p> 태그 복구
            boards.forEach(board => {
                const imageUrl = (board.images && board.images.length > 0) ? board.images[0].img_url : '/images/default-image.png';

                // 제목(글귀)이 포함된 HTML 템플릿
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

    const photoGallery = document.getElementById('photo-gallery');
    photoGallery.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-photo-btn')) {
            const isConfirmed = window.confirm("정말로 이 사진을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.");
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
        alert('삭제 권한이 없습니다. 다시 로그인해주세요.');
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`/api/board/delete/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('게시물이 성공적으로 삭제되었습니다.');
            elementToRemove.remove();
            const postCount = document.getElementById('post-count');
            postCount.textContent = parseInt(postCount.textContent) - 1;
        } else {
            const errorData = await response.json().catch(() => ({}));
            alert(errorData.detail || '삭제 중 오류가 발생했습니다.');
        }
    } catch (error) {
        console.error('삭제 요청 중 에러 발생:', error);
        alert('삭제 요청 중 네트워크 오류가 발생했습니다.');
    }
}