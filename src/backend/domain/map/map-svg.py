from bs4 import BeautifulSoup
import csv
import os

# 한글 이름 매핑 사전
district_name_map = {
    'Dobong-gu': '도봉구',
    'Dongdaemun-gu': '동대문구',
    'Dongjak-gu': '동작구',
    'Eunpyeong-gu': '은평구',
    'Gangbuk-gu': '강북구',
    'Gangdong-gu': '강동구',
    'Gangseo-gu': '강서구',
    'Geumcheon-gu': '금천구',
    'Guro-gu': '구로구',
    'Gwanak-gu': '관악구',
    'Gwangjin-gu': '광진구',
    'Gangnam-gu': '강남구',
    'Jongno-gu': '종로구',
    'Jung-gu': '중구',
    'Jungnang-gu': '중랑구',
    'Mapo-gu': '마포구',
    'Nowon-gu': '노원구',
    'Seocho-gu': '서초구',
    'Seodaemun-gu': '서대문구',
    'Seongbuk-gu': '성북구',
    'Seongdong-gu': '성동구',
    'Songpa-gu': '송파구',
    'Yangcheon-gu': '양천구',
    'Yeongdeungpo-gu_1_': '영등포구',
    'Yongsan-gu': '용산구'
}

svg_path = os.path.join(os.path.dirname(__file__), 'Seoul_districts.svg')

with open(svg_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'xml')

paths = soup.find_all('path')
data = []

for path in paths:
    path_id = path.get('id')
    d_attr = path.get('d')

    if not path_id:
        continue

    display_name = district_name_map.get(path_id, 'Unknown')

    if display_name == 'Unknown':
        print(f"경고: 매핑되지 않은 ID - {path_id}")

    color = "#CCCCCC"
    value = 0

    data.append({
        'id': path_id,
        'display_name': display_name,
        'color': color,
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

print(f"{csv_file} 파일 저장 완료 (총 {len(data)}개 항목)")

