import { BadgeInfo } from "lucide-react";
import "../../static/css/_home/introduction.css"

const SysIntroduction = ({ }) => {
    return (
        <>
            <div className="home-title-container">
                <BadgeInfo size={30} style={{ color: "#8B0000", marginRight: "5px" }} />
                <h2 className="home-title">源·語</h2>
            </div>
            <div className="home-content-container">
                <p>《源·語》是一套為想學習泰雅族語的AI互動學習平台，
                    涵蓋影像辨識、詞彙遊戲及測驗學習等功能，
                    是教師尋找教學資源、學生自主學習的選擇之一！
                </p>
                <div className="home-source-container">
                    <p>感謝
                        <a href="https://www.ilrdf.org.tw/" target="_blank" rel="noopener noreferrer">
                            財團法人原住民族語言研究發展基金會
                        </a>
                        ，本平台部分詞彙參考
                        <a href="https://e-dictionary.ilrdf.org.tw/sitemap.htm" target="_blank" rel="noopener noreferrer">
                            族語線上辭典
                        </a>
                        ，並依據創用CC 姓名標示-非商業性-相同方式分享 4.0 國際授權條款釋出。
                    </p>
                </div>
            </div>
        </>
    );
};
export default SysIntroduction;