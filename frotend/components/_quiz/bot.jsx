import "../../static/css/_quiz/bot.css"
import { useState, useRef } from "react";
import { Bot, ChevronLeft } from "lucide-react"
import ChartComponent from "./bot_chart"
import PracticeLinkComponent from "./bot_link"
import { motion } from "framer-motion";

const Advice = ({ onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "lokah su 你好！我是您的泰雅AI助手，有什麼我可以幫您的嗎？", role: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [isType, setIsType] = useState(false);
    const messageEndRef = useRef(null);

    const suggestions = [
        "我想了解我的學習狀況",
        "介紹泰雅族的編織藝術"
    ];

    //todo 練習題型link(待改)
    const practiceLinks = {
        "聽力": { url: "聽力url", color: "#007B8A" },
        "詞彙": { url: "詞彙url", color: "#D35400" }
    };

    //todo 學習進度資料(待改)
    const mockLearningData = {
        "詞彙": 55,
        "文法": 77,
        "聽力": 66,
        "口說": 88
    };

    // 依回應內容決定是否加入圖表
    const analyzeResponse = (responseText) => {
        const elements = [];

        // 檢查是否包含關鍵字
        if (responseText.includes("學習狀況") || responseText.includes("進度") || responseText.includes("表現")) {
            elements.push({
                type: "chart",
                title: "您的學習進度",
                data: mockLearningData
            });
        }

        // 檢查是否有建議link
        Object.keys(practiceLinks).forEach(type => {
            if (responseText.includes(type) && (responseText.includes("練習") || responseText.includes("建議"))) {
                elements.push({
                    type: "link",
                    practiceType: type,
                    ...practiceLinks[type]
                });
            }
        });

        return elements;
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    //傳送訊息
    const handleSend = async () => {
        if (input.trim() === "") return;

        const newUserMessage = { id: messages.length + 1, text: input, role: "user" };
        setMessages([...messages, newUserMessage]);
        setInput("");
        setIsType(true);

        try {
            const response = await fetch(import.meta.env.VITE_API_AI_BOT_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: input })
            });

            const data = await response.json();
            const extraElements = analyzeResponse(data.message);

            const botResponse = {
                id: messages.length + 2,
                text: data.message,
                role: "bot",
                extraElements: extraElements
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            const errorResponse = {
                id: messages.length + 2,
                text: "很抱歉，無法取得回應，請稍後再試。",
                role: "bot"
            };
            setMessages(prev => [...prev, errorResponse]);
            console.error("取得回應失敗:", error);
        } finally {
            setIsType(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setInput(suggestion);
    };

    return (
        <div className="overlay">
            <motion.div
                className="chat-container"
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ duration: 0.35 }}
            >
                <div className="chat-header">
                    <button
                        onClick={onClose}
                        className="chat-return"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div className="avatar">
                        <Bot />
                    </div>
                    <div className="header-info">
                        <h2>泰雅智慧助手</h2>
                        <p className="status online">在線</p>
                    </div>
                </div>

                <div className="messages-container">
                    {messages.map((message) => (
                        <div key={message.id} className={`message ${message.role}`}>
                            {message.role === "bot" && (
                                <div className="avatar-small">
                                    <Bot />
                                </div>
                            )}
                            <div className="message-bubble">
                                <p>{message.text}</p>
                                {message.extraElements && message.extraElements.map((element, index) => (
                                    <div key={index}>
                                        {element.type === "chart" && (
                                            <ChartComponent data={element.data} title={element.title} />
                                        )}
                                        {element.type === "link" && (
                                            <PracticeLinkComponent
                                                practiceType={element.practiceType}
                                                url={element.url}
                                                color={element.color}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {isType && (
                        <div className="message bot">
                            <div className="avatar-small">
                                <Bot />
                            </div>
                            <div className="message-bubble typing">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messageEndRef} />
                </div>

                {messages.length <= 2 && (
                    <div className="suggestions-container">
                        <p className="suggestions-title">您可能想問：</p>
                        <div className="suggestion-pills">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="suggestion-pill"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="輸入您的訊息..."
                        className="message-input"
                    />
                    <button
                        className={`send-button ${input.trim() ? 'active' : ''}`}
                        onClick={handleSend}
                        disabled={input.trim() === ""}
                    >
                        發送
                    </button>
                </div>
            </motion.div>
        </div >
    );
};
export default Advice;