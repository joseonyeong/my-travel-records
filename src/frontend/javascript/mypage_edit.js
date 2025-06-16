// frontend/javascript/mypage_edit.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login.html';
        return;
    }

    fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) throw new Error('프로필 정보를 불러오는데 실패했습니다.');
        return response.json();
    })
    .then(data => {
        // 프로필 정보 채우기
        document.getElementById('profile-name').textContent = data.id;
        document.getElementById('user-id').value = data.id;
        if (data.profile_img) {
            document.getElementById('profile-img').src = data.profile_img;
        }

        // 날짜 형식 변환 (YYYY-MM-DD)
        const birthDate = data.birth ? new Date(data.birth).toISOString().split('T')[0] : '';
        const registerDate = new Date(data.register_date).toISOString().split('T')[0];

        document.getElementById('birth-date').value = birthDate;
        document.getElementById('register-date').value = registerDate;

        // 통계 정보 채우기
        document.getElementById('post-count').textContent = data.post_count;
        document.getElementById('location-count').textContent = `${data.location_count} / 25`; // 전체 지역 수는 임의로 25로 설정
    })
    .catch(error => {
        console.error(error);
        alert(error.message);
        window.location.href = '/login.html';
    });
});