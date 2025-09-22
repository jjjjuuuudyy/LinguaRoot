import "../../static/css/_quiz/bot_chart.css"
import { BarChart3 } from "lucide-react"

const ChartComp = ({ data, title }) => {
    return (
        <div className="chart-container">
            <div className="chart-header">
                <BarChart3 size={18} className="chart-icon" />
                <h4 className="chart-title">{title}</h4>
            </div>
            <div className="chart-bars">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="chart-bar-row">
                        <span className="chart-label">{key}</span>
                        <div className="chart-bar-background">
                            <div
                                className="chart-bar-fill"
                                style={{ width: `${value}%` }}
                            />
                        </div>
                        <span className="chart-percent">{value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ChartComp;