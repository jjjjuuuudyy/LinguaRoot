import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../../static/css/_quiz/situation_line.css";

const SituationLine = ({ data }) => {
  const colors = {
    正確: "#66BB6A",
    錯誤: "#EF5350",
    未作答: "#A0A0A0",
  };

  const uniqueNames = [...new Set(data.flatMap(item => Object.keys(item).filter(k => k !== 'date')))];
  
  return (
    <div className="situation-line-container">
      <h2 className="situation-line-title">歷史測驗表現</h2>
      <div className="situation-line-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#9b1b3057" />
            <XAxis
              dataKey="date"
              padding={{ left: 30, right: 30 }}
              tick={{ fontSize: 12, fill: "#9B1B30" }}
              axisLine={{ stroke: "#9B1B30" }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: "#9B1B30" }} axisLine={{ stroke: "#9B1B30" }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff0f3ff",
                borderRadius: 8,
                border: "none",
                boxShadow: "0 2px 8px rgba(107, 76, 59, 0.2)",
                fontSize: 13,
              }}
              labelStyle={{ color: "#cc495fe5", fontWeight: 600 }}
              cursor={{ stroke: "#f0c3caff", strokeWidth: 2 }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 13, paddingTop: 10 }} />
            {uniqueNames.map((name) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={colors[name] || "#8884d8"}
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SituationLine;
