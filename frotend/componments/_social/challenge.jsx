import "../../static/css/_social/challenge.css"
import { Trophy, ChartColumn, Star } from "lucide-react";
import { useState } from "react";

const Challenge = ({ }) => {
    const socialActivity = [
        { title: "活動活動活動", date: "週三 整天", participants: "已有 123 人報名" },
        { title: "活動活動活動", date: "週六 晚上 8:00", participants: "已有 123 人報名" },
        { title: "活動活動活動", date: "進行中...", participants: "已有 123 人報名" },
    ]

    return (
        <div className="social-sidebar">
            <div className="">
                <h3 className="section-title">
                    <span className="icon"><Trophy /></span>
                    社群活動
                </h3>

                {socialActivity.map((s, idx) => (
                    <div key={idx} className="activity-card">
                        <div className="activity-title">{s.title}</div>
                        <div className="activity-date">{s.date}</div>
                        <div className="activity-participants">{s.participants}</div>
                    </div>
                ))}
            </div>

            <div className="stats-section">
                <h3 className="section-title">
                    <span className="icon"><ChartColumn /></span>
                    學習統計
                </h3>

                <div className="stats-card">
                    <div className="stat-item">
                        <div className="stat-label">本週活躍學習者</div>
                        <div className="stat-value active">321人</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">新學單詞</div>
                        <div className="stat-value words">1,234個</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">互助問答</div>
                        <div className="stat-value qa">99則</div>
                    </div>
                </div>
            </div>

            <div className="recommend-section">
                <h3 className="section-title">
                    <span className="icon"><Star /></span>
                    推薦學習
                </h3>

                <div className="recommend-card">
                    <div className="recommend-title">今日推薦</div>
                    <div className="recommend-content">學習「天氣」相關詞彙</div>
                    <button className="recommend-btn">開始學習</button>
                </div>
            </div>
        </div>
    );
};
export default Challenge;