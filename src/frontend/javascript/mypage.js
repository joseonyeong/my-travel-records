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
                // 토큰이 유효하지 않거나 문제가 생기면 에러 처리
                throw new Error('사용자 정보를 불러오는데 실패했습니다.');
            }
            return response.json();
        })
        .then(user => {
            // 성공적으로 사용자 정보를 받으면 HTML 요소를 업데이트합니다.
            document.getElementById('user-nickname').textContent = user.id;
            const avatar = document.getElementById('user-avatar');
            if (user.profile_img) {
                avatar.src = user.profile_img;
            }
        })
        .catch(error => {
            console.error('내 정보 로딩 실패:', error);
            // 문제가 생기면 로그인 페이지로 보낼 수 있습니다.
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
            
            // 게시물 수 업데이트
            postCount.textContent = boards.length;
            // 기존 갤러리 내용 비우기
            gallery.innerHTML = ''; 

            // 각 게시물에 대해 HTML 요소를 동적으로 생성
            boards.forEach(board => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';

                const img = document.createElement('img');
                // 게시물에 이미지가 있으면 첫 번째 이미지를 사용, 없으면 기본 이미지
                img.src = (board.images && board.images.length > 0) ? board.images[0].img_url : '/images/default-image.png';
                img.alt = board.title;

                const p = document.createElement('p');
                p.textContent = board.title;

                photoItem.appendChild(img);
                photoItem.appendChild(p);
                gallery.appendChild(photoItem);
            });
        })
        .catch(error => console.error('게시물 목록 로딩 실패:', error));
});