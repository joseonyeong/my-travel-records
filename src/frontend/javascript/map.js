const mapContainer = document.getElementById('mapContainer');

document.getElementById("plusBtn").addEventListener("click", function () {
  window.location.href = "../html/board.html";
});


fetch('/api/districts') // FastAPI에서 CSV를 JSON으로 변환해서 리턴하는 API
  .then(res => res.json())
  .then(data => {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");

    // 실제 서울 지도 SVG 뷰박스 값으로 변경
    svg.setAttribute("viewBox", "0 0 1000 1000");
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

    mapContainer.appendChild(svg);
  })
  .catch(err => {
    console.error(err);
    mapContainer.textContent = "지도를 불러오는 데 실패했습니다.";
  });
