import json
from django.template import loader
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from django.http import JsonResponse
import openai
import os
from dotenv import load_dotenv
import sqlite3
import traceback

load_dotenv()
openai.api_key = os.getenv("GITHUB_TOKEN")
openai.api_base = "https://models.github.ai/inference"
# openai.api_key = os.getenv("OPENAI_API_KEY")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "tayal_words.db")

#todo 測試用使用者答題情形資料
userData = {
    "correct": 5,
    "incorrect": 3,
    "unanswered": 2,
    "common_errors": ["聽力", "詞彙"]
}

# tayal_chat視覺化測試
def main(request):
    template = loader.get_template('tayal_chat.html')
    return HttpResponse(template.render())

@csrf_exempt
def tayal_chat(request):
    if request.method == "POST":
        try:
            print("收到POST請求")

            body = json.loads(request.body)
            user_message = body.get("message", "").strip()
            if not user_message:
                return JsonResponse({"error": "取得訊息內容失敗"}, status=400)
                
            prompt = f""" 
                你是一位泰雅語老師，根據使用者的答題情況，用對話方式進行正向引導。
                請鼓勵使用者、分析其錯誤，並提供一個簡單的練習問題幫助提升。
                

                當使用者問類似"想了解學習狀況"時，請根據以下使用者答題情形給予適性的學習建議。
                - 答對題數:{userData['correct']}
                - 答錯題數:{userData['incorrect']}
                - 未作答題數:{userData['unanswered']}
                - 常見錯誤:{userData['common_errors']}

                1. 請優先使用上述詞彙庫中的正確泰雅語詞彙
                2. 根據詞頻和結構資訊給予適當的學習建議

                回應時保持正向語氣，內容請控制在 100 字以內，不使用 Markdown 或換行符號。
            """
            
            response = openai.ChatCompletion.create(
                model="openai/gpt-4o",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            result = response["choices"][0]["message"]["content"]
            return JsonResponse({"message": result})
        
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "只接受 POST 請求"}, status=405)

@csrf_exempt 
def review_tayal_chat(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            user_message = body.get("message", "").strip()
            if not user_message:
                return JsonResponse({"error": "取得訊息內容失敗"}, status=400)

            # 依空格切詞
            words = user_message.split(" ")

            # 查詢每個詞的翻譯（假設 search_tayal_words 回傳格式：[{"word":"cyux","meaning":"正在"}, ...]）
            relevant_words = []
            for w in words:
                result = search_tayal_words(w, limit=1)  # 取一筆最相關的
                if result:
                    relevant_words.append(result[0])
                else:
                    relevant_words.append({"tayal": w,"chinese": "", "audio": ""})

            # 拼成 prompt context
            words_context = "**泰雅語詞彙庫參考資料：**\n"
            for w in relevant_words:
                words_context += f"- {w['tayal']} : {w['chinese']}\n"

            prompt = f"""
                你是一位泰雅語老師，幫助學生理解句子。
                使用者已經有句子的完整中文翻譯，你的任務不是重複翻譯，而是提供額外的補充說明，例如：
                - 詞彙用法
                - 語法結構
                - 文化背景或上下文提示
                - 注意事項或常見錯誤

                詞彙庫：
                {words_context}

                要求：
                1. 產生一句完整的中文翻譯
                2. 保持正向、簡潔的教學語氣
                3. 不要使用 Markdown 標記（例如 **）
                4. 每個詞可以簡單說明用法或文化背景
                5. 字數控制在50字內

            """

            response = openai.ChatCompletion.create(
                model="openai/gpt-4o",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_message}
                ]
            )
            ai_text = response["choices"][0]["message"]["content"]

            return JsonResponse({
                "original": user_message,
                "words": relevant_words,
                "translation": ai_text,
                "image": None  # 之後可以依詞彙加圖
            })

        except Exception as e:
            print(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "只接受 POST 請求"}, status=405)

def search_tayal_words(keyword=None, limit=8):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
    except Exception as e:
        print(f"[DB ERROR] 資料庫連線失敗: {e}")
        return []

    results = []
    try:
        if keyword:
            # 改成完全匹配
            query = """
            SELECT *
            FROM words 
            WHERE word_tayal = ? OR word_fre = ? OR word_str = ? OR defins = ?
            LIMIT ?
            """
            cursor.execute(query, (keyword, keyword, keyword, keyword, limit))
        else:
            query = """
            SELECT *
            FROM words 
            ORDER BY id
            LIMIT ?
            """
            cursor.execute(query, (limit,))
        
        results = cursor.fetchall()
    except Exception as e:
        print(f"[DB ERROR] 查詢失敗: {e}")
    finally:
        conn.close()

    # 沒找到就回傳空陣列
    if not results:
        return []

    words_data = []
    for row in results:
        try:
            definitions = json.loads(row[5]) if row[5] else []
        except (json.JSONDecodeError, TypeError):
            definitions = []

        chinese = ""
        if isinstance(definitions, list) and definitions:
            chinese = definitions[0].get("word_ch", "")

        words_data.append({
            'tayal': row[1],
            'audio': row[2],
            'chinese': chinese
        })
    
    return words_data
