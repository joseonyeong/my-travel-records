// // + 버튼 → 게시글 작성 페이지로 이동
// document.getElementById("plusBtn").addEventListener("click", function () {
//   window.location.href = "/board.html";
// });

const mapContainer = document.getElementById('mapContainer');

fetch('/api/districts')
  .then(res => {
    if (!res.ok) throw new Error("서버 응답 오류");
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) {
      mapContainer.textContent = "지도 데이터가 없습니다.";
      return;
    }

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");

    svg.setAttribute("viewBox", "0 0 1500 1500");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";

    data.forEach(item => {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("id", item.id);
      path.setAttribute("d", item.d);
      path.setAttribute("fill", item.color || "#ccc");
      path.setAttribute("stroke", "#333");
      path.setAttribute("stroke-width", "1");
      path.style.cursor = "pointer";

      const title = document.createElementNS(svgNS, "title");
      title.textContent = item.display_name;
      path.appendChild(title);

      path.addEventListener("click", () => {
        const token = localStorage.getItem("access_token");

        const allImagesPromise = fetch(`/api/districts/${item.id}/images`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }).then(res => res.ok ? res.json() : []);

        const latestImagePromise = fetch(`/api/districts/${item.id}/image`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }).then(res => res.ok ? res.json() : []);

        Promise.all([allImagesPromise, latestImagePromise])
          .then(([allImages, latestImages]) => {
            const allImgUrls = allImages.map(img => img.img_url);
            const latestImgUrls = latestImages.map(img => img.img_url);

            // 중복 제거 및 최신 이미지 먼저 보여주기
            const combined = [...new Set([...latestImgUrls, ...allImgUrls])];

            updateViewer(item.display_name, combined);
          })
          .catch(err => {
            console.error("이미지 요청 실패:", err);
            updateViewer(item.display_name, []);
          });
      });

      svg.appendChild(path);
    });

    mapContainer.appendChild(svg);
    console.log("지도 삽입 완료");
  })
  .catch(err => {
    console.error("지도 로드 실패:", err);
    mapContainer.textContent = "지도를 불러오는 데 실패했습니다.";
  });

// 이미지 뷰어 로직
let currentImages = []; // 이미지 배열
let currentIndex = 0;

function updateViewer(districtName, images) {
  currentImages = images;
  currentIndex = 0;

  document.getElementById('districtName').innerText = districtName;
  updateImage();
}

function updateImage() {
  const imgEl = document.getElementById('viewerImage');
  const titleEl = document.getElementById('viewerTitle');
  const dateEl = document.getElementById('viewerDate');

  if (currentImages.length > 0) {
    const image = currentImages[currentIndex];
    imgEl.src = image.img_url;
    imgEl.alt = image.title || '게시글 이미지';
    titleEl.innerText = image.title || '제목 없음';
    dateEl.innerText = new Date(image.writer_date).toLocaleString();
  } else {
    imgEl.src = '';
    imgEl.alt = '이미지가 없습니다';
    titleEl.innerText = '';
    dateEl.innerText = '';
  }
}

function prevImage() {
  if (currentImages.length === 0) return;
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  updateImage();
}

function nextImage() {
  if (currentImages.length === 0) return;
  currentIndex = (currentIndex + 1) % currentImages.length;
  updateImage();
}

document.addEventListener("DOMContentLoaded", () => {
  // 로그아웃 버튼
  const logoutBtn = document.querySelector('.nav .nav-btn[href="/logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      localStorage.setItem("is_login", "false");
      window.location.href = "/index.html";
    });
  }

  // 홈버튼 → 글쓰기 페이지 이동
  const homeBtn = document.querySelector('.home-button');
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "/board.html";
    });
  }
});
