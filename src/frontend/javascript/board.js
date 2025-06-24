document.addEventListener('DOMContentLoaded', function() {
    // --- 1. HTML 요소들을 변수에 할당 ---
    const locationSelect = document.getElementById('location');
    const locationStatus = document.getElementById('location-status');
    const dateInput = document.getElementById('date');
    const cancelbtn = document.querySelector('.cancel-btn');
    const boardForm = document.getElementById('board-form');
    const imageUploadWrapper = document.querySelector('.image-upload-wrapper');
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const deleteImageButton = document.getElementById('deleteImage');

    // --- 2. 페이지 로드 시 초기 설정 ---

    // (2-1) 자치구 목록 드롭다운 채우기
    fetch('/api/districts')
        .then(response => {
            if (!response.ok) throw new Error('자치구 목록 로딩 실패');
            return response.json();
        })
        .then(districts => {
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id; // 예: Gangnam-gu
                option.textContent = district.display_name; // 예: 강남구
                locationSelect.appendChild(option);
            });
        })
        .catch(error => console.error('자치구 목록 로딩 오류:', error));

    // (2-2) 날짜 입력 필드 이벤트 설정
    dateInput.addEventListener('click', function() {
        if (this.type === 'text' && !this.value) this.placeholder = 'YYYY-MM-DD';
    });
    dateInput.addEventListener('dblclick', function() {
        this.type = 'date';
        try { this.showPicker(); } catch (e) { console.error("showPicker() is not supported."); }
    });
    dateInput.addEventListener('blur', function() {
        this.type = 'text';
        if (!this.value) this.placeholder = 'Date';
    });

    // --- 3. 이미지 업로드 관련 모든 기능 처리 ---
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        // (3-1) 이미지 미리보기 기능
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.classList.remove('is-hidden');
            deleteImageButton.style.display = 'block';
            imageUploadWrapper.classList.add('uploaded');
        };
        reader.readAsDataURL(file);

        // (3-2) EXIF 데이터에서 위치 정보 추출하여 자동 선택하는 기능
        locationStatus.textContent = '위치 정보 읽는 중...';
        EXIF.getData(file, async function() {
            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef");
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

            if (lat && lon && latRef && lonRef) {
                const latDecimal = convertDMSToDD(lat, latRef);
                const lonDecimal = convertDMSToDD(lon, lonRef);

                try {
                    const address = await getAddressFromCoords(latDecimal, lonDecimal);
                    console.log("API에서 받은 전체 주소 정보:", address);

                    // [수정] 'suburb' 대신 'borough'에서 '구' 이름을 가져옵니다.
                    const districtName = address?.borough;

                    if (districtName) {
                        let found = false;
                        for (let i = 0; i < locationSelect.options.length; i++) {
                            // API에서 받은 '구' 이름과 드롭다운의 텍스트를 비교
                            if (locationSelect.options[i].text === districtName) {
                                locationSelect.selectedIndex = i;
                                locationStatus.textContent = '위치 자동 선택 완료!';
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                             locationStatus.textContent = '서울시 내 위치를 찾지 못했어요.';
                        }
                    } else {
                        locationStatus.textContent = '사진에서 주소 정보를 찾을 수 없어요.';
                    }
                } catch (error) {
                    console.error(error);
                    locationStatus.textContent = '위치 변환 중 오류 발생';
                }
            } else {
                locationStatus.textContent = '사진에 위치 정보가 없어요.';
            }
        });
    });
    
    // (3-3) 업로드된 이미지 삭제 기능
    deleteImageButton.addEventListener('click', function() {
        previewImage.src = '';
        previewImage.classList.add('is-hidden');
        imageInput.value = '';
        deleteImageButton.style.display = 'none';
        imageUploadWrapper.classList.remove('uploaded');
        locationStatus.textContent = '';
        locationSelect.selectedIndex = 0;
    });

    // (3-4) 이미지 업로드 영역 클릭 시 파일 선택창 열기
    imageUploadWrapper.addEventListener('click', function(event) {
        if (event.target !== deleteImageButton) {
            imageInput.click();
        }
    });


    // --- 4. 헬퍼 함수 (좌표 변환, 주소 변환) ---
    function convertDMSToDD(dms, direction) {
        let dd = dms[0] + dms[1] / 60 + dms[2] / 3600;
        if (direction == "S" || direction == "W") {
            dd = dd * -1;
        }
        return dd;
    }

    async function getAddressFromCoords(lat, lon) {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&addressdetails=1`;
        const response = await fetch(url, { headers: { 'Accept-Language': 'ko' } });
        if (!response.ok) throw new Error('Reverse geocoding failed');
        const data = await response.json();
        return data.address || null;
    }

    // --- 5. 폼 제출 및 취소 버튼 기능 ---
    if (cancelbtn) {
        cancelbtn.addEventListener("click", () => window.location.href = "/map.html");
    }

    boardForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            window.location.href = '/login.html';
            return;
        }

        const formData = new FormData(boardForm);
        const submitButton = boardForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Posting...';

        fetch('/api/board/create', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            if (!response.ok) {
                return response.json().then(errorData => Promise.reject(errorData));
            }
            alert('게시글이 성공적으로 작성되었습니다.');
            window.location.href = '/map.html';
        })
        .catch(error => {
            console.error('게시글 작성 중 오류 발생:', error);
            alert(error.detail || '게시글 작성 중 오류가 발생했습니다.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Post';
        });
    });
});
