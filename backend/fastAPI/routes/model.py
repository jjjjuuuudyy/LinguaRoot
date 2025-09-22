from sqlalchemy import Column, Integer, String, Text
from fastAPI.routes.connect import Base

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    word_tayal = Column(String, index=True)
    word_audio = Column(String)
    word_fre = Column(String)
    word_str = Column(String)
    defins = Column(Text)  # 存的是 JSON 字串
    word_img = Column(Text)