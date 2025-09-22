import React, { useState } from "react";
import { Languages, Volume2, Check } from "lucide-react";

export default function WordTranslation({ question, selected, checked, onSelect, onConfirm }) {
  

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
    <div className="text-center" style={{ height: "550px" }}>
      <h5 className="fw-bolder mb-4">
        <Languages />&nbsp;單詞翻譯
      </h5>
      <button
        onClick={() => handlePlay(question.tayal.audio)}
        className="custom0-btn mb-4"
      >
        <h2 className="fw-bolder mb-4">
          {question.tayal.word}&nbsp;<Volume2 size={20} />
        </h2>
      </button>

      <div className="options-list">
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => !checked && handleSelect(opt)}
            className={`custom-btn ${getOptionClass(opt)}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {!checked ? (
        <button
          onClick={() => onConfirm && onConfirm()}
          className="confirm-btn"
          disabled={!selected}
        >
          <Check />&nbsp;確認
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
