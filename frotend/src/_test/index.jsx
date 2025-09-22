import React, { useState } from "react";
import SentenceFillBlank from "../../components/_test/sentenceFill";
import SentenceOrdering from "../../components/_test/sentenceOrder";
import WordMatching from "../../components/_test/wordMatch";
import WordTranslation from "../../components/_test/wordTranslation";
import "../../static/css/_test/index.css";

function QuestionRenderer({ question, selected, checked, onSelect, onConfirm }) {
  switch (question.type) {
    case "sentence-fill":
      return (
        <SentenceFillBlank
          question={question}
          selected={selected}
          checked={checked}
          onSelect={onSelect}
          onConfirm={onConfirm}
        />
      );
    case "sentence-order":
      return (
        <SentenceOrdering
          question={question}
          selected={selected}
          checked={checked}
          onSelect={onSelect}
          onConfirm={onConfirm}
        />
      );
    case "word-match":
      return (
        <WordMatching
          question={question}
          selected={selected}
          checked={checked}
          onSelect={onSelect}
          onConfirm={onConfirm}
        />
      );
    case "word-translate":
      return (
        <WordTranslation
          question={question}
          selected={selected}
          checked={checked}
          onSelect={onSelect}
          onConfirm={onConfirm}
        />
      );
    default:
      return <p>未知題型</p>;
  }
}

export default function QuizPage() {
  const questionList = [
    {
      id: 1,
      type: "sentence-fill",
      sentence: "Musa ___ quri.",
      options: [
        { word: "naga", audio: "/audio/naga.mp3" },
        { word: "nga", audio: "/audio/nga.mp3" },
        { word: "nagaq", audio: "/audio/nagaq.mp3" },
      ],
      answer: "nga",
    },
    {
      id: 2,
      type: "sentence-order",
      sentenceCn: "我去學校",
      words: [
        { word: "nga", audio: "/audio/nga.mp3" },
        { word: "musa", audio: "/audio/musa.mp3" },
        { word: "quri", audio: "/audio/quri.mp3" },
      ],
      answer: ["musa", "nga", "quri"],
    },
    {
      id: 3,
      type: "word-match",
      pairs: [
        { cn: "太陽", tayal: { word: "sunqi", audio: "/audio/sunqi.mp3" } },
        { cn: "月亮", tayal: { word: "bulan", audio: "/audio/bulan.mp3" } },
      ],
    },
    {
      id: 4,
      type: "word-translate",
      tayal: { word: "sunqi", audio: "/audio/sunqi.mp3" },
      options: ["太陽", "月亮", "火", "水"],
      answer: "太陽",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [checked, setChecked] = useState(false); // 確認按鈕控制
  const [selected, setSelected] = useState(null); // 選項回傳

  const progress = ((current + 1) / questionList.length) * 100;

  const handleNext = () => {
    if (current + 1 < questionList.length) {
      setCurrent(current + 1);
      setChecked(false);
      setSelected(null);
    } else {
      alert("測驗結束");
    }
  };

  return (
    <div
      className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8 flex flex-col items-center"
      style={{ height: "600px" }}
    >
      {/* 進度條 */}
      <div className="w-full max-w-2xl bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="bg-green-500 h-3 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 題號 */}
      <h6 className="text-sm text-gray-600 mb-4 text-center">
        第 {current + 1} / {questionList.length} 題
      </h6>

      {/* 題目區 */}
      <div className="flex flex-col items-center justify-center w-full overflow-auto">
        <QuestionRenderer
          question={questionList[current]}
          selected={selected}
          checked={checked}
          onSelect={(val) => setSelected(val)}
          onConfirm={() => setChecked(true)}
        />
      </div>
      {/* 下一題按鈕 */}
      {current < questionList.length && (
        <div className="w-full flex justify-center mt-6">
        <button
          onClick={handleNext}
          className={`custom-btn mt-3 ${
            !checked 
              ? "opacity-50 cursor-not-allowed" 
              : current === questionList.length - 1 
                ? "correct" 
                : ""
          }`}
          disabled={!checked}
          style={{ cursor: !checked ? "not-allowed" : "pointer" }}
        >
          {current === questionList.length - 1
            ? "結束測驗"
            : "下一題"}
        </button>
        </div>
      )}

    </div>
  );
}
