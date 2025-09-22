import React, { useState } from "react";
import { Volume2 } from "lucide-react";

export default function WordMatching({ question, onConfirm }) {
  const [matches, setMatches] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wrongPair, setWrongPair] = useState(null); // 記錄錯的那一組

  const handleSelect = (word, isCn) => {
    if (isFinished) return;

    if (!selectedWord) {
      setSelectedWord({ word, isCn });
    } else {
      // 防止同側配對
      if (selectedWord.isCn === isCn) {
        setSelectedWord({ word, isCn });
        return;
      }

      // 建立配對 (cn -> tayal)
      const cn = isCn ? word : selectedWord.word;
      const tayal = isCn ? selectedWord.word : word;

      const pair = question.pairs.find((p) => p.cn === cn);

      if (pair.tayal.word === tayal) {
        // ✅ 正確
        const newMatches = { ...matches, [cn]: tayal };
        setMatches(newMatches);
        setSelectedWord(null);

        // 檢查是否全對
        if (Object.keys(newMatches).length === question.pairs.length) {
          setIsFinished(true);
          onConfirm &&
            onConfirm({
              result: "all-correct",
              correctPairs: question.pairs,
            });
        }
      } else {
        // ❌ 錯誤 -> 結束
        setWrongPair({ cn, chosen: tayal, correct: pair.tayal.word });
        setIsFinished(true);
        onConfirm &&
          onConfirm({
            result: "wrong",
            wrongPair: { cn, chosen: tayal, correct: pair.tayal.word },
            correctPairs: question.pairs,
          });
      }
    }
  };

  const getButtonClass = (word, isCn) => {
    // 已結束情況處理
    if (isFinished) {
      if (wrongPair) {
        // 錯一組情況
        if (isCn) {
          if (word === wrongPair.cn && matches[wrongPair.cn] !== wrongPair.correct) {
            return "custom-btn wrong"; // 玩家選的中文
          }
          if (word === wrongPair.cn) {
            return "custom-btn wrong";
          }
        } else {
          if (word === wrongPair.chosen) {
            return "custom-btn wrong"; // 玩家選的錯的泰雅語
          }
          if (word === wrongPair.correct) {
            return "custom-btn correct"; // 該組正解
          }
        }
        // 之前正確的保持 #9B1B30
        if (isCn && matches[word]) return "custom-btn selected";
        if (!isCn && Object.values(matches).includes(word)) return "custom-btn selected";
      } else {
        // 全對情況 -> 全部變綠
        return "custom-btn correct";
      }
    } else {
      // 作答中
      if (isCn && selectedWord?.word === word && selectedWord.isCn) return "custom-btn selected";
      if (!isCn && selectedWord?.word === word && !selectedWord.isCn) return "custom-btn selected";
      if (isCn && matches[word]) return "custom-btn selected";
      if (!isCn && Object.values(matches).includes(word)) return "custom-btn selected";
    }
    return "custom-btn";
  };

  return (
    <div className="text-center" style={{ minHeight: "400px" }}>
      <h5 className="fw-bolder mb-4">配對題</h5>

      <div className="flex justify-center gap-4 mb=4">
        {/* 中文 */}
        <div>
          {question.pairs.map((p) => (
            <button
              key={p.cn}
              className={getButtonClass(p.cn, true)}
              onClick={() => handleSelect(p.cn, true)}
              disabled={isFinished}
            >
              {p.cn}
            </button>
          ))}
        </div>

        {/* 泰雅語 */}
        <div>
          {question.pairs.map((p) => (
            <button
              key={p.tayal.word}
              className={getButtonClass(p.tayal.word, false)}
              onClick={() => handleSelect(p.tayal.word, false)}
              disabled={isFinished}
            >
              {p.tayal.word}{" "}
              <Volume2
                size={15}
                onClick={(e) => {
                  e.stopPropagation();
                  new Audio(p.tayal.audio).play();
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {isFinished && (
        <div className="mt-4 font-bold">
          {wrongPair ? (
            <>
              <p className="text-red-600">答錯 ❌</p>
              <p>
                {wrongPair.cn} → 正解是 <span className="text-green-600">{wrongPair.correct}</span>
              </p>
            </>
          ) : (
            <p className="text-green-600">全部配對正確 ✅</p>
          )}
          <h6 className="mt-3">全部正解：</h6>
          {question.pairs.map((p) => (
            <p key={p.cn}>
              {p.cn} → {p.tayal.word}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
