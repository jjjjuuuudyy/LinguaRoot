import "../../static/css/_calendar/calendar_date.css"
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Trash2 } from "lucide-react";

const userCalendar = ({ }) => {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState({});
    const [newEvent, setNewEvent] = useState("");

    const formattedDate = date.toISOString().split("T")[0];
    const [selectedDateKey, setSelectedDateKey] = useState(
        new Date().toISOString().split("T")[0]
    );

    const handleDateChange = (selectedDate) => {
        setDate(selectedDate);
        setSelectedDateKey(selectedDate.toISOString().split("T")[0]);
    };

    const handleAddEvent = () => {
        if (!newEvent.trim()) return;
        setEvents((prev) => ({
            ...prev,
            [formattedDate]: [...(prev[formattedDate] || []), newEvent],
        }));
        setNewEvent("");
    };

    const handleDelete = (index) => {
        setEvents((prev) => {
            const updated = [...(prev[formattedDate] || [])];
            updated.splice(index, 1);
            return {
                ...prev,
                [formattedDate]: updated,
            };
        });
    };

    return (
        <div className="calendar-wrapper">
            <div className="calendar-left">
                <Calendar
                    onChange={handleDateChange}
                    value={date}
                    locale="zh-TW"
                    calendarType="gregory"
                    formatDay={(locale, date) => date.getDate().toString()}
                    tileClassName={({ date, view }) =>
                        view === "month" && date.toDateString() === new Date().toDateString()
                            ? "today"
                            : null
                    }
                    tileContent={({ date, view }) => {
                        const dateKey = date.toISOString().split("T")[0];
                        const isSelected = dateKey === selectedDateKey;
                        if (view === "month" && events[dateKey]?.length > 0) {
                            return (
                                <div
                                    className="dot-indicator"
                                    style={{ backgroundColor: isSelected ? "white" : "#9b1b30" }}
                                />);
                        }
                        return null;
                    }}
                />
            </div>
            <div className="calendar-right">
                <h2>{formattedDate} 的行程</h2>
                <div className="event-list-scroll">
                    {(events[formattedDate] || []).map((event, index) => (
                        <div className="event-card" key={index}>
                            <span>{event}</span>
                            <button onClick={() => handleDelete(index)} title="刪除">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    {(events[formattedDate] || []).length === 0 && (
                        <div className="no-event">尚無紀錄</div>
                    )}
                </div>

                <div className="event-input-bar">
                    <input
                        type="text"
                        placeholder="新增事件..."
                        value={newEvent}
                        onChange={(e) => setNewEvent(e.target.value)}
                    />
                    <button onClick={handleAddEvent}>新增</button>
                </div>
            </div>
        </div>
    );
};
export default userCalendar;