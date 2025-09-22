import React, { useState } from "react";
import { RectangleEllipsis, Volume2, Check } from "lucide-react";
export default function SentenceFillBlank({ question, selected, checked, onSelect, onConfirm }) {
  const handlePlay = (src) => new Audio(src).play();

  const handleSelect = (word) => {
    const newSelection = selected === word ? null : word;
    onSelect(newSelection);
  };

  const getOptionClass = (word) => {
    if (!checked) return selected === word ? "selected" : "";
    if (word === question.answer) return "correct";       // 正確答案綠色
    if (selected === word && word !== question.answer) return "wrong"; // 選錯紅色
    return "";
  };

  return (
    <div className="text-center" style={{ height: "400px" }}>
      <h5 className="fw-bolder mb-4">句子填空</h5>
      <h2 className="fw-bolder mb-4">{question.sentence}</h2>

      <div className="options-list">
        {question.options.map((opt) => (
          <button
            key={opt.word}
            onClick={() => !checked && handleSelect(opt.word)}
            className={`custom-btn ${getOptionClass(opt.word)}`}
          >
            {opt.word}
            <span
              onClick={(e) => {
                e.stopPropagation();
                handlePlay(opt.audio);
              }}
              className="ml-2 cursor-pointer text-sm"
            >
              &nbsp;<Volume2 size={15} />
            </span>
          </button>
        ))}
      </div>

      {!checked ? (
        <button
          onClick={() => onConfirm()}
          className="confirm-btn"
          disabled={!selected}
        >
          確認
        </button>
      ) : (
        <>
          <p className="mt-3 font-bold">
            {selected === question.answer ? "✅ 正確" : "❌ 錯誤"}
          </p>
          <p className="mt-1 text-blue-600 font-bold">
            正確答案：{question.answer}
          </p>
        </>
      )}
    </div>
  );
}
