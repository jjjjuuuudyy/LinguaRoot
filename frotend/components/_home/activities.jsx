import activity1 from "../../static/assets/_home/activities/activity1.png"
import activity2 from "../../static/assets/_home/activities/activity2.png"
import activity3 from "../../static/assets/_home/activities/activity3.png"
import "../../static/css/_home/activities.css"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react";

const activityImages = [
    activity1,
    activity2,
    activity3
];

const Activities = ({ }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleBtn = (type) => {
        setCurrentIndex((prevIndex) => {
            if (type === "prev") {
                console.log("prevv: ", activityImages.length, prevIndex);
                return prevIndex === 0 ? activityImages.length - 1 : prevIndex - 1;
            } else {
                console.log("nextt: ", activityImages.length, prevIndex);
                return prevIndex === activityImages.length - 1 ? 0 : prevIndex + 1;
            }
        });
    };

    return (
        <div className="events">
            <button className="activities-btn left" onClick={() => handleBtn("prev")}>
                <ChevronLeft size={50} />
            </button>
            <div className="event-card">
                <img src={activityImages[currentIndex]} alt="活動" key={currentIndex} />
            </div>
            <button className="activities-btn right" onClick={() => handleBtn("next")}>
                <ChevronRight size={50} />
            </button>
        </div>
    );
};
export default Activities;