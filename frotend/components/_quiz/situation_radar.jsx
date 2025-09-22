import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../static/css/_quiz/situation_radar.css";

const SituationRadar = ({ data }) => {
  const ticks = [0, 20, 40, 60, 80, 100];

  const categories = ["是非題", "選擇題", "閱讀理解", "配合題"];

  const filledData = categories.map(category => {
    const existingData = data.find(item => item.category === category);
    return existingData || { category, score: 0 };
  });

  const renderCustomAngleTick = ({ payload, x, y, cx, cy }) => {
    const radius = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    const angle = Math.atan2(y - cy, x - cx);

    const newRadius = radius + 15;
    const newX = cx + newRadius * Math.cos(angle);
    const newY = cy + newRadius * Math.sin(angle);

    return (
      <text
        x={newX}
        y={newY}
        textAnchor="middle"
        fill="#9B1B30"
        fontSize={13}
      >
        {payload.value}
      </text>
    );
  };

  const renderRadiusTick = ({ x, y, payload }) => (
    <text x={x} y={y + 15} textAnchor="middle" className="radar-axis-tick">
      {payload.value}
    </text>
  );

  return (
    <div className="situation-radar-container">
      <h2 className="situation-radar-title">題型分析</h2>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="90%"
          data={filledData}
          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        >
          <PolarGrid stroke="#f1ced4ff" />
          <PolarAngleAxis dataKey="category" tick={renderCustomAngleTick} />
          <PolarRadiusAxis
            domain={[0, 100]}
            ticks={ticks}
            tick={renderRadiusTick}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff0f3ff",
              borderRadius: 8,
              border: "none",
              boxShadow: "0 2px 8px rgba(107, 76, 59, 0.2)",
              fontSize: 14,
            }}
            labelStyle={{ color: "#cc495fe5", fontWeight: 600 }}
            cursor={{ stroke: "#bb5465ff", strokeWidth: 3 }}
          />
          <Radar
            name="正確率"
            dataKey="score"
            stroke="#b92c44b2"
            fill="#df576ecc"
            fillOpacity={0.4}
            strokeWidth={3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SituationRadar;
