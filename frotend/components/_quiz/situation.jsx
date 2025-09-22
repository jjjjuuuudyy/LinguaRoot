import { useEffect, useState } from "react";
import fakeData from "../../static/assets/_quiz/fakeData.json";
import { getPieData, getRadarData, getLineData } from "../../src/_quiz/dataFormatter.js";
import Chart from "./situation_chart"; //圓餅圖
import SituationLine from "./situation_line"; //折線圖
import SituationJudy1 from "./situation_0judy_1.jsx";
import SituationJudy2 from "./situation_0judy_2.jsx";
import SituationJudy3 from "./situation_0judy_3.jsx";
import Filter from "./situation_filter"; //篩選
import SituationRadar from "./situation_radar"; //雷達圖
import "../../static/css/_quiz/situation.css";

const Situation = () => {
  const [userSituation, setUserSituation] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState("所有");
  const [selectedDate, setSelectedDate] = useState({
    start: "",
    end: ""
  });

  useEffect(() => {
    setUserSituation(fakeData);
  }, []);

  useEffect(() => {
    const filtered = userSituation.filter(item => {
      const typeMatch = selectedTypes === "所有" || item.questionType === selectedTypes;
      let dateMatch = true;
      if (selectedDate.start && selectedDate.end) {
        dateMatch =
          new Date(item.date).toDateString() ===
          new Date(selectedDate.start).toDateString();
      }

      return typeMatch && dateMatch;
    });
    setFilteredData(filtered);
  }, [selectedTypes, selectedDate, userSituation]);

  return (
    <div className="situation-container">
      <h2 className="situation-header">答題情形</h2>

      <div className="situation-filter-wrapper">
        <Filter
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          selectedDate
          setSelectedDate
        />
      </div>

      {filteredData.length > 0 ? (
        <>
          {/* <div className="situation-chart-radar-wrapper">
            <Chart data={getPieData(filteredData)} />
            <SituationRadar data={getRadarData(filteredData)} />
          </div> */}
          <div className="situation-line-wrapper">
            <SituationJudy1
              summary={{
                level: "中級",
                difficulty: "中等",
                speed: "偏快",
                advice: "你已展現出穩定的作答基礎，建議持續累積練習以維持良好表現。同時可適度挑戰較高難度題目，培養解題的靈活度與深度。在答題過程中，請特別注意細節，避免因粗心而失分。針對標記為不確定或常錯的題型，進行有系統的複習，能幫助鞏固弱點並提升信心，逐步增進速度與準確度。",
              }}
              radarData={[
                { category: "綜合", score: 78 },
                { category: "正確度", score: 85 },
                { category: "難度", score: 40 },
                { category: "時間", score: 80 },
                { category: "信心度", score: 68 },
              ]}
            />
            <SituationJudy2 data={getLineData(filteredData)} />
            <SituationJudy3 />
          </div>
        </>
      ) : (
        <div className="no-data-box">無符合條件的資料</div>
      )}
    </div>
  );
};

export default Situation;
