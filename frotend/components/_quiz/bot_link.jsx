import "../../static/css/_quiz/bot_link.css"
import { Play, ExternalLink } from "lucide-react"

const LinkComp = ({ practiceType, url, color }) => {
    return (
        <div className="link-wrapper">
            <button
                className="link-button"
                style={{ backgroundColor: color }}
                onClick={() => alert(url)}
            >
                <Play size={16} />
                開始{practiceType}練習
                <ExternalLink size={14} />
            </button>
        </div>
    );
};
export default LinkComp;