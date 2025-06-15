document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById('mapContainer');

  document.getElementById("plusBtn").addEventListener("click", function () {
    window.location.href = "../html/board.html";
  });

  fetch('/api/districts')
    .then(res => res.json())
    .then(data => {
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
        path.setAttribute("fill", item.color);
        path.setAttribute("stroke", "#333");
        path.setAttribute("stroke-width", "1");
        path.style.cursor = "pointer";

        const title = document.createElementNS(svgNS, "title");
        title.textContent = item.display_name;
        path.appendChild(title);

        path.addEventListener("click", () => {
          alert(`${item.display_name} 클릭됨! 값: ${item.value}`);
        });

        svg.appendChild(path);
      });

      if (mapContainer) {
        mapContainer.appendChild(svg);
      } else {
        console.error("mapContainer 요소를 찾을 수 없습니다.");
      }
    })
    .catch(err => {
      console.error(err);
      if (mapContainer) {
        mapContainer.textContent = "지도를 불러오는 데 실패했습니다.";
      }
    });

  const logoutBtn = document.querySelector('.nav .nav-btn[href="/logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("access_token");
      localStorage.removeItem("username");
      localStorage.setItem("is_login", "false");
      window.location.href = "/index.html";
    });
  } else {
    console.error("로그아웃 버튼을 찾을 수 없습니다.");
  }
});
