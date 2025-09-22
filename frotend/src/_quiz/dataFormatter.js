const colors = {
  正確: "#28A745",
  錯誤: "#DC3545",
  未作答: "#6C757D",
};

//圓餅圖資料
export const getPieData = (rawData) => {
  let correct = 0, incorrect = 0, none = 0;
  rawData?.forEach(s => {
    correct += s.results?.正確 || 0;
    incorrect += s.results?.錯誤 || 0;
    none += s.results?.未作答 || 0;
  });
  return [
    { name: "正確", value: correct, color: colors["正確"] },
    { name: "錯誤", value: incorrect, color: colors["錯誤"] },
    { name: "未作答", value: none, color: colors["未作答"] },
  ];
};

//雷達圖資料
export const getRadarData = (rawData) => {
  const map = {};
  rawData?.forEach(s => {
    const type = s.questionType;
    if (!map[type]) map[type] = { total: 0, correct: 0 };
    const r = s.results || {};
    const total = (r.正確 || 0) + (r.錯誤 || 0) + (r.未作答 || 0);
    map[type].total += total;
    map[type].correct += r.正確 || 0;
  });
  return Object.keys(map).map(type => ({
    category: type,
    score: Math.round((map[type].correct / map[type].total) * 100)
  }));
};

//折線圖資料
export const getLineData = (rawData) => {
  const map = {};
  rawData?.forEach(s => {
    if (!map[s.date]) map[s.date] = { date: s.date, 正確: 0, 錯誤: 0, 未作答: 0 };
    map[s.date].正確 += s.results?.正確 || 0;
    map[s.date].錯誤 += s.results?.錯誤 || 0;
    map[s.date].未作答 += s.results?.未作答 || 0;
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
};
