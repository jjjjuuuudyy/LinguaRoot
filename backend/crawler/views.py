import requests
from django.http import JsonResponse
from bs4 import BeautifulSoup

#爬取線上測驗題目(初級)
def get_quiz_data(request):
    #取得等級，預設1
    level = request.GET.get("level","1")
    url = "https://api.lokahsu.org.tw/api/front_end/start_exam?dialect_id=6&level=1"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }

    response = requests.get(url,headers=headers)

    if response.status_code == 200:
        data = response.json()

        if level == "1":
            format_data = format_quiz_data_1(data)
        elif level == "2":
            format_data = format_quiz_data_2(data)
        return JsonResponse(format_data, safe=False)
    else:
        return JsonResponse({"🔥 Error: ": "讀取資料失敗"}, status=500)

#把爬的資料用成我要的格式(第一部分)
def format_quiz_data_1(data):
    format_data = {
        "chapter_name":data["data"]["display_dialect_name"],
        "parts":[]
    }
    part1 = data["data"]["part1"]
    format_part1 = {
        "type": "true_false",
        "title": part1["title"],
        "intro": part1["intro"],
        "questions":[
            {
                "question_ab" : question["question_ab"],
                "question_ch": question["question_ch"],
                "audio" : question["audio"],
                "image": question["image"],
                "answer": part1["answers"][index]
            }
            for index, question in enumerate(part1["questions"])
        ]
    }
    format_data["parts"].append(format_part1)
    return format_data

def format_quiz_data_2(data):
    format_data = {
        "chapter_name":data["data"]["display_dialect_name"],
        "parts":[]
    }
    format_part2 = {
        "type": "choice",
        "title": "第二部分：選擇題",
        "intro": "試卷上每題有三個圖片，根據題目選一個與所聽到語意最相符的圖片",
        "questions":[
            {
                "question_ab": "cyux inu' kkyalan / renwa' nha'?",
                "question_ch": "他們的電話在哪裡？",
                "audio": "https://api.lokahsu.org.tw/public/junior/sound/6/4choiceOne/2_2_C.mp3",
                "imageA": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/2_2A.png",
                "imageB": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/2_2B.png",
                "imageC": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/2_2C.png",
                "answer": "3"
            },{
                "question_ab": "cyux matas biru' qu 'laqi' mlikuy qasa.",
                "question_ch": "那個男孩子正在畫圖。",
                "audio": "https://api.lokahsu.org.tw/public/junior/sound/6/4choiceOne/3_5_A.mp3",
                "imageA": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/3_5A.png",
                "imageB": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/3_5B.png",
                "imageC": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/3_5C.png",
                "answer": "1"
            },{
                "question_ab": "smoya' mita' teribiy qu kkneril qasa.",
                "question_ch": "那些女孩子喜歡看電視。",
                "audio": "https://api.lokahsu.org.tw/public/junior/sound/6/4choiceOne/4_2_A.mp3",
                "imageA": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_2A.png",
                "imageB": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_2B.png",
                "imageC": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_2C.png",
                "answer": "1"
            },
            {
                "question_ab": "baq su' matas biru'?",
                "question_ch": "你會畫圖嗎？",
                "audio": "https://api.lokahsu.org.tw/public/junior/sound/6/4choiceOne/4_3_A.mp3",
                "imageA": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_3A.png",
                "imageB": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_3B.png",
                "imageC": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_3C.png",
                "answer": "1"
            },
            {
                "question_ab": "smoya' mqwas qu lelaqi' qasa.",
                "question_ch": "那些孩子喜歡唱歌。",
                "audio": "https://api.lokahsu.org.tw/public/junior/sound/6/4choiceOne/4_4_A.mp3",
                "imageA": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_4A.png",
                "imageB": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_4B.png",
                "imageC": "https://api.lokahsu.org.tw/public/junior/graphics/choiceOne/4_4C.png",
                "answer": "1"
            }
        ]
    }
    format_data["parts"].append(format_part2)
    return format_data

# 爬取活動及族語認證資料
def get_tayal_imformation(request):
    # 活動的(有圖片)
    url = "https://www.tacp.gov.tw/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0"
    }

    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")

    data = []

    slides = soup.select(".secWrap .swiper-slide")
    for slide in slides:
        # 活動細節url
        a_tag = slide.select_one("a")
        a_url = "https://www.tacp.gov.tw/"+a_tag["href"] if a_tag else None

        # 活動圖片url
        img_tag = slide.select_one("img")
        img_url = "https://www.tacp.gov.tw"+img_tag["src"] if img_tag else None

        # 活動主題
        title_tag = slide.select_one("h4.news__index__item__title")
        title = title_tag.get_text(strip=True) if title_tag else None

        # 活動日期
        date_parts = slide.select("li._date, li._year")
        dates = [d.get_text(strip=True) for d in date_parts]

        # dates會取得類似['07/05', '2025', '10/12', '2025']的資料
        # 用len避免空值出現錯誤
        start_date = f"{dates[1]}-{dates[0]}" if len(dates) >= 2 else None
        end_date = f"{dates[3]}-{dates[2]}" if len(dates) >= 4 else None

        data.append({
            "title": title,
            "detail": a_url,
            "image": img_url,
            "start_date": start_date,
            "end_date": end_date,
            "tag": None,
            "isExam": "F"
        })
    
    # 活動的(無圖片)
    news = soup.select(".secWrap .mainNewsBox li")
    count = 0
    for new in news:
        if count >= 5: # 只爬最新的五筆
            break
        # 活動細節url
        a_tag = new.select_one("a")
        a_url = "https://www.tacp.gov.tw"+a_tag["href"] if a_tag else None

        # 活動時間
        time_tag = new.select_one("time")
        time = time_tag.getText(strip=True) if time_tag else None

        # 活動標籤
        tag_tag = new.select_one(".modTag")
        tag = tag_tag.getText(strip=True) if tag_tag else None

        # 活動主題
        title_tag = new.select_one("span")
        title = title_tag.get_text(strip=True) if title_tag else None

        data.append({
            "title": title,
            "detail": a_url,
            "image": None,
            "start_date": time,
            "end_date": None,
            "tag": tag,
            "isExam": "F"
        })
        count = count + 1
    
    # 族語認證的
    url_exam = "https://exam.sce.ntnu.edu.tw/abst/"
    
    res_exam = requests.get(url_exam, headers=headers)
    soup_exam = BeautifulSoup(res_exam.text, "html.parser")

    count = 0
    infos = soup_exam.select(".pnlArticles li")
    for info in infos:
        if count >= 5: # 只爬最新的5筆
            break
        date_tag = info.select_one("small")
        date = date_tag.get_text(strip=True) if date_tag else None

        detail_tag = info.select_one("a")
        title = detail_tag.get_text(strip=True) if detail_tag else None
        detail = url_exam+detail_tag["href"] if detail_tag else None

        data.append({
            "title": title,
            "detail": detail,
            "image": None,
            "start_date": date,
            "end_date": None,
            "tag": None,
            "isExam": "T"
        })
        count = count + 1
        
    return JsonResponse(data, safe=False, json_dumps_params={'ensure_ascii': False, 'indent': 2})
