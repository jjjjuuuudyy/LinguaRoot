import json
from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Tuple, Optional
from pydantic import BaseModel
import re
import logging

from fastAPI.routes.connect import get_db 
from fastAPI.routes.model import Word

router = APIRouter()

logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger(__name__)


class Example(BaseModel):
    ex_tay: str
    ex_ch: str
    ex_tay_audio: str | None

class Defin(BaseModel):
    word_ch: str
    word_cate: str
    examples: List[Example]

class WordResult(BaseModel):
    word_tayal: str
    word_audio: str
    word_fre: str
    word_str: str
    defins: List[Defin]
    word_img: Optional[str] = None

class KeywordRequest(BaseModel):
    keyword: str

def simplify_tayal(word: str) -> str:
    return re.sub(r'\d+$', '', word)


def parse_defins(defins_json: str) -> List[Defin]:
    try:
        defin_data = json.loads(defins_json)
    except Exception:
        return []

    definitions = []
    for defin in defin_data:
        examples = [
            Example(
                ex_tay=example.get('ex_tay'),
                ex_ch=example.get('ex_ch'),
                ex_tay_audio=example.get('ex_tay_audio')
            )
            for example in defin.get('examples', [])
        ]
        definitions.append(
            Defin(
                word_ch=defin.get('word_ch'),
                word_cate=defin.get('word_cate'),
                examples=examples
            )
        )
    return definitions


def search_by_chinese(db: Session, keyword: str) -> Tuple[List[WordResult], List[str]]:
    words = db.query(Word).filter(Word.defins.like(f"%{keyword}%")).all()

    content = []
    matched_ch_list = []

    for word in words:
        definitions = parse_defins(word.defins)

        match = any(defin.word_ch == keyword for defin in definitions)
        if match:
            matched_ch_list.append(simplify_tayal(word.word_tayal))
            content.append(
                WordResult(
                    word_tayal=simplify_tayal(word.word_tayal),
                    word_audio=word.word_audio,
                    word_fre=word.word_fre,
                    word_str=simplify_tayal(word.word_str),
                    defins=definitions,
                    word_img=word.word_img or ""
                )
            )

    return content, matched_ch_list


def fuzzy_search_by_chinese(db: Session, keyword: str, exclude_word_tayals: List[str]) -> Dict[str, List[WordResult]]:
    words = db.query(Word).filter(Word.defins.like(f"%{keyword}%")).all()
    fuzzy_content = {}

    for word in words:
        simplified = simplify_tayal(word.word_tayal)
        if simplified in exclude_word_tayals:
            continue

        definitions = parse_defins(word.defins)

        for defin in definitions:
            if keyword in defin.word_ch:
                if defin.word_ch not in fuzzy_content:
                    fuzzy_content[defin.word_ch] = []

                fuzzy_content[defin.word_ch].append(
                    WordResult(
                        word_tayal=simplified,
                        word_audio=word.word_audio,
                        word_fre=word.word_fre,
                        word_str=simplify_tayal(word.word_str),
                        defins=definitions,
                        word_img=word.word_img or ""
                    )
                )

    return fuzzy_content

def search_all(db: Session) -> Dict[str, List[WordResult]]:
    words = db.query(Word).all()

    content = {}
    
    

    for word in words:
        definitions = parse_defins(word.defins)

        try:
            if definitions:
                content[definitions[0].word_ch]=[]
                content[definitions[0].word_ch].append(
                    WordResult(
                        word_tayal=simplify_tayal(word.word_tayal),
                        word_audio=word.word_audio,
                        word_fre=word.word_fre,
                        word_str=word.word_str,
                        defins=definitions,
                        word_img=word.word_img or ""
                    )
                )
        except Exception as e:
            logger = logging.getLogger("uvicorn.error")
            logger.exception(f"處理單字時發生錯誤: {word.word_tayal}，錯誤內容：{e}")
            continue  
                

    return content



@router.post("/search/")
async def search_tayal_dictionary(request: Request, db: Session = Depends(get_db)):
    """ 查詢 Tayal 字典 API """
    try:
        data = await request.json()
        words = data.get("words", [])

        if not words:
            return JSONResponse({"error": "查詢字詞不可為空"}, status_code=400)

        exact_match_results = {}
        fuzzy_match_results = {}

        for word in words:
            results, matched_ch_list = search_by_chinese(db,word)
            exact_match_results[word] = [r.dict() for r in results]

            fuzzy = fuzzy_search_by_chinese(db,word, exclude_word_tayals=matched_ch_list)
            fuzzy_match_results[word] = {
                key: [r.dict() for r in val] for key, val in fuzzy.items()
            }

        return JSONResponse(
            {
                "exact_match_results": exact_match_results,
                "fuzzy_match_results": fuzzy_match_results
            },
            status_code=200
        )

    except json.JSONDecodeError:
        return JSONResponse({"error": "無效的 JSON 格式"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@router.post("/all/")
async def all_tayal_dictionary(request: Request, db: Session = Depends(get_db)):
    try:
        
        all_results = {}       
        results= search_all(db)
        all_results = {key: [r.dict() for r in val] for key, val in results.items()}     

        return JSONResponse(
            {
                "all_results": all_results
            },
            status_code=200
        )
    except json.JSONDecodeError:
        return JSONResponse({"error": "無效的 JSON 格式"}, status_code=400)
    except Exception as e:
        logger.error(f"發生錯誤: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)
    


    
@router.post("/allsearch/")
async def allsearch_tayal_dictionary(request: KeywordRequest, db: Session = Depends(get_db)):
    """ 全字庫模糊搜尋 Tayal 字典（單一中文字關鍵詞） """
    try:
        keyword = request.keyword.strip().replace("　", "").lower()
        if not keyword:
            return JSONResponse({"error": "查詢字詞不可為空"}, status_code=400)

        exact_match_results, matched_ch_list = search_by_chinese(db, keyword)
        fuzzy_match_results = fuzzy_search_by_chinese(db, keyword, exclude_word_tayals=matched_ch_list)

        return JSONResponse(
            {
                "exact_match_results": {keyword: [r.dict() for r in exact_match_results]},
                "fuzzy_match_results": {
                    keyword: {k: [r.dict() for r in v] for k, v in fuzzy_match_results.items()}
                }
            },
            status_code=200
        )

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


from sqlalchemy import text
from .connect import engine

@router.get("/test-db/")
def test_db(db: Session = Depends(get_db)):
    db_path = str(engine.url)

    # 先看資料庫裡有哪些表
    tables = db.execute(text("SELECT name FROM sqlite_master WHERE type='table';")).fetchall()
    tables = [t[0] for t in tables]

    # 嘗試撈 words_img 表
    sample_row = None
    if "words_img" in tables:
        result = db.execute(text("SELECT * FROM words_img LIMIT 1")).fetchone()
        if result:
            sample_row = dict(result._mapping)

    return {
        "database_url": db_path,
        "tables": tables,
        "sample_row": sample_row
    }