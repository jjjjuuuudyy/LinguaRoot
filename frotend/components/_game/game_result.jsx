import React, { useState } from 'react';
import "../../static/css/_game/game_result.css";

const GameResultCard = ({ word, isCorrect }) => 
{
    return (
        <div className="game-result-card-container">
            
            <div className={`game-result-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                <div className='game-result-card-front'>
                    <div>                        
                        <h5>{word.clue}</h5>
                    </div>
                    <div>
                        <p className="user-answer">你的答案: {word.user_word || '無答案'}</p>
                        <p className="correct-answer">正確答案: {word.correct_word}</p>
                        <div className='result-likebtn'>
                            <LikeButton/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LikeButton = () => {
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    return (
        <button
            onClick={handleLike}
            className='result-likebtn'
        >
            {isLiked ? '❤️' : '♡'}
        </button>
    );
};



/**
 * 顯示填字遊戲的結果
 * @param {object} props 
 * @param {object} props.results 
 */
const Game_result = ({ results }) => 
{
    if (!results) 
    {
        return null;
    }

    const { total_words, correct_words_count, word_details } = results;

    // 將單字分類為正確和錯誤兩組
    const correctWords = word_details.filter(word => word.is_correct);
    const incorrectWords = word_details.filter(word => !word.is_correct);

    return (
        <div className='result-background'>
            <h2 className='result-title'>
                遊戲結果
            </h2>
            <div className='stats-container'>
                <div className='result-total'>
                    <p>總單字數</p>
                    <p>{total_words}</p>
                </div>
                <div className='result-correct'>
                    <p>正確單字數</p>
                    <p>{correct_words_count}</p>
                </div>
                <div className='result-incorrect'>
                    <p>錯誤單字數</p>
                    <p>{incorrectWords.length}</p>
                </div>
            </div>

            {/* 正確的單字列表 */}
            <div>
                <h3 className='result-correctword'>✅ 正確的單字 ({correctWords.length})</h3>
                
                <div>
                    {correctWords.length > 0 ? (
                        correctWords.map((word, index) => (
                            <GameResultCard key={index} word={word} isCorrect={true} />
                        ))
                    ) : (
                        <p>沒有正確的單字。</p>
                    )}
                </div>
            </div>

            {/* 錯誤的單字列表 */}
            <div>
                <h3 className='result-incorrectword'>❌ 錯誤的單字 ({incorrectWords.length})</h3>
                <div>
                    {incorrectWords.length > 0 ? (
                        incorrectWords.map((word, index) => (
                            <GameResultCard key={index} word={word} isCorrect={false} />
                        ))
                    ) : (
                        <p>沒有錯誤的單字。</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Game_result;