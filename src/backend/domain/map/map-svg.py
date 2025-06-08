from bs4 import BeautifulSoup
import csv
import os

svg_path = os.path.join(os.path.dirname(__file__), 'Seoul_districts.svg')

with open(svg_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'xml')


paths = soup.find_all('path')
data = []

for path in paths:
    path_id = path.get('id')
    d_attr = path.get('d')

    # id 없는 path
    if not path_id:
        continue

    display_name = path_id.replace('seoul_','').replace('-gu','').replace("_", " ").title()

    color = "#CCCCCC"
    value = 0

    data.append({
        'id': path_id,
        'display_name' : display_name,
        'color' : color,
        'value': value,
        'd': d_attr
    })

output_dir = os.path.dirname(__file__)
os.makedirs(output_dir, exist_ok=True)
csv_file = os.path.join(output_dir, "seoul_districts_mapped.csv")

with open(csv_file, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "display_name", "color", "value", "d"])
    writer.writeheader()
    writer.writerows(data)

print(f"✅ {csv_file} 파일 저장 완료 (총 {len(data)}개 항목)")