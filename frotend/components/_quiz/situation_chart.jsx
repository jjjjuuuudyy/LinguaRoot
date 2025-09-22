import { useEffect, useRef, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import "../../static/css/_quiz/situation_chart.css";

const SituationChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const containerRef = useRef(null);
  const [radius, setRadius] = useState(110);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width < 300) setRadius(65);
      else if (width < 400) setRadius(85);
      else setRadius(140);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const labelRadius = outerRadius + 30;
    const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
    const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text x={x} y={y - 6} className="situation-label-title" fill={data[index].color}>
          {name}
        </text>
        <text x={x} y={y + 14} className="situation-label-value" fill={data[index].color}>
          {value} 題
        </text>
      </g>
    );
  };

  return (
    <div ref={containerRef} className="situation-chart-container">
      <h2 className="situation-chart-title">答題結果分佈</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={radius * 0.6}
            outerRadius={radius}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            labelLine={false}
            label={renderCustomizedLabel}
            paddingAngle={3}
            cornerRadius={10}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="situation-chart-total-label"
            style={{ fontSize: radius * 0.18 }}
          >
            總題數
          </text>
          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="situation-chart-total-number"
            style={{ fontSize: radius * 0.25 }}
          >
            {total}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SituationChart;
