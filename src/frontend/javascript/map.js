// + 버튼 → 게시글 작성 페이지로 이동
document.getElementById("plusBtn").addEventListener("click", function () {
  window.location.href = "/board.html";
});

// 지도 SVG 삽입
const mapContainer = document.getElementById('mapContainer');

fetch('/api/districts')
  .then(res => res.json())
  .then(data => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");

    svg.setAttribute("viewBox", "0 0 1500 1500");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    data.forEach(item => {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("id", item.id);
      path.setAttribute("d", item.d);
      path.setAttribute("fill", item.color);
      path.setAttribute("stroke", "#333");
      path.setAttribute("stroke-width", "1");
      path.style.cursor = "pointer";

      const title = document.createElementNS(svgNS, "title");
      title.textContent = item.display_name;
      path.appendChild(title);

      path.addEventListener("click", () => {
        fetch(`/api/districts/${item.id}/image`)
          .then(res => {
            if (!res.ok) throw new Error("이미지를 불러올 수 없습니다.");
            return res.json();
          })
          .then(images => {
            const imgUrls = images.map(img => img.img_url);
            updateViewer(item.display_name, imgUrls);
          })
          .catch(err => {
            console.error(err);
            updateViewer(item.display_name, []);
          });
      });

      svg.appendChild(path);
    });

    mapContainer.appendChild(svg);
  })
  .catch(err => {
    console.error(err);
    mapContainer.textContent = "지도를 불러오는 데 실패했습니다.";
  });

// 로그아웃 버튼 처리
document.addEventListener("DOMContentLoaded", () => {
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
});

// 이미지 뷰어 로직
let currentImages = [];
let currentIndex = 0;

function updateViewer(districtName, images) {
  currentImages = images;
  currentIndex = 0;
  document.getElementById('districtName').innerText = districtName;
  updateImage();
}

function updateImage() {
  const imgEl = document.getElementById('viewerImage');
  if (currentImages.length > 0) {
    imgEl.src = currentImages[currentIndex];
    imgEl.alt = '구 이미지';
  } else {
    imgEl.src = '';
    imgEl.alt = '게시글을 작성해 사진을 넣어보세요';
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
