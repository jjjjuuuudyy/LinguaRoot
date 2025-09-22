import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../../static/css/_quiz/situation_0judy_2.css";

const SituationLine = ({ data }) => {
  data = [
    { date: "2025-01", 正確率: 80, 同期平均: 75, 使用者平均: 78 },
    { date: "", 正確率: null, 同期平均: 78, 使用者平均: 0 },
    { date: "2025-03", 正確率: 90, 同期平均: 82, 使用者平均: 85 },
    { date: "2025-04", 正確率: 75, 同期平均: 78, 使用者平均: 76 },
    { date: "2025-05", 正確率: 85, 同期平均: 80, 使用者平均: 82 },
    { date: "2025-06", 正確率: 60, 同期平均: 68, 使用者平均: 64 },
    { date: "2025-07", 正確率: 70, 同期平均: 73, 使用者平均: 71 },
    { date: "2025-08", 正確率: 95, 同期平均: 88, 使用者平均: 90 },
    // { date: "2025-09", 正確率: 82, 同期平均: 79, 使用者平均: 80 },
    // { date: "2025-10", 正確率: 77, 同期平均: 75, 使用者平均: 76 },
  ];

  // 計算使用者總平均
  const userAvg =
    data.reduce((sum, item) => sum + (item.正確率 || 0), 0) / data.length;

  const pieData = [
    { name: "平均分數", value: userAvg },
    { name: "剩餘", value: 100 - userAvg },
  ];
  const COLORS = ["#F4C7C3", "#E0E0E0"];

  return (
    <div className="judy-situation-line-container">
      <h2 className="situation-header" style={{ fontWeight: "500" }}>歷史表現</h2>
      <div
        className="judy-situation-line-chart-wrapper"
        style={{ display: "flex", gap: "20px" }}
      >
        {/* 左邊 - 組合圖 */}
        <div style={{ flex: 2, height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 20, right: 20, bottom: 10, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#00000033"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#374151" }}
                axisLine={{ stroke: "#374151" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#374151" }}
                axisLine={{ stroke: "#374151" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  fontSize: 13,
                }}
                labelStyle={{ color: "#1f2937", fontWeight: 600 }}
                cursor={{ stroke: "#4b5563", strokeWidth: 2 }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 13, paddingTop: 10 }}
              />

              {/* 區域圖 - 同期平均 */}
              <Area
                type="monotone"
                dataKey="同期平均"
                fill="rgba(151, 151, 151, 0.5)"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth={2}
                strokeDasharray="5 5"
              />

              {/* 直條圖 - 正確率 */}
              <Bar
                dataKey="正確率"
                barSize={30}
                fill="#9B1B30"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 右邊 - 使用者平均分數 */}
        <div
          style={{
            flex: 1,
            height: 400,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, color: "#1f2937" }}>
            平均分數
          </div>
          <ResponsiveContainer width="70%" height="60%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={70}
                outerRadius={100}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: "30px", fontWeight: "bold", fill: "#9B1B30" }}
              >
                {userAvg.toFixed(1)}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SituationLine;
