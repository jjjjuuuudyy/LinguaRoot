import "../../static/css/_social/post.css"
import { LayoutDashboard, HelpCircle, TableOfContents, NotebookText, Heart, MessageCircle, Share2, Bookmark, Images, Laugh } from "lucide-react";
import { useState } from "react";

const Post = ({ avatarUrl }) => {
    const [socialMenuActive, setSocialMenuActive] = useState("all");
    const socialMenu = [
        { id: 'all', label: '所有', icon: <TableOfContents size={18} /> },
        { id: 'social', label: '動態', icon: <LayoutDashboard size={20} /> },
        // { id: 'QA', label: '問答', icon: <HelpCircle size={20} /> },
        { id: 'note', label: '筆記分享', icon: <NotebookText size={20} /> }
    ];

    const postBtnMenu = [
        { id: 'likes', label: '喜歡', icon: <Heart size={20} /> },
        { id: 'comments', label: '留言', icon: <MessageCircle size={20} /> },
        { id: 'shares', label: '分享', icon: <Share2 size={20} /> },
        { id: 'saves', label: '收藏', icon: <Bookmark size={20} /> }
    ]

    const posts = [
        {
            id: 1,
            user: { name: "Yaya Umin", avatar: "雅", tribe: "123部落" },
            time: "2小時前",
            text: "請問分享分享分享分享呢？分享分享分享分享分享？",
            tayal: "abcde分享",
            actions: { likes: 12, comments: 8, shares: 0, saves: 0 }
        },
        {
            id: 2,
            user: { name: "Batu Nomin", avatar: "明", tribe: "0000部落" },
            time: "4小時前",
            text: "分享分享分享分享分享分享！分享分享分享",
            tayal: `分享分享分享分享分享分享`,
            actions: { likes: 24, comments: 15, shares: 0, saves: 0 }
        },
        {
            id: 3,
            user: {
                name: "Watan Diro",
                avatar: "文",
                tribe: "泰雅部落",
                badge: "部落達人"
            },
            time: "1天前",
            text: "為什麼分享分享分享分享？分享分享分享...",
            tayal: `分享分享分享分享分享分享`,
            actions: { likes: 45, comments: 28, shares: 0, saves: 0 }
        }
    ];

    return (
        <div className="main-content">
            <div className="community-nav">
                {socialMenu.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        className={`nav-btn ${socialMenuActive === id ? "active" : ""}`}
                        onClick={() => setSocialMenuActive(id)}
                    >
                        {icon}
                        <span className="ml-1">{label}</span>
                    </button>
                ))}
            </div>

            <div className="post-composer">
                <div className="composer-header">
                    <img src={avatarUrl} className="user-avatar" alt="頭像" />
                    <textarea className="composer-input" placeholder="史努比，在想些什麼?"></textarea>
                </div>
                <div className="composer-actions">
                    <div className="composer-options">
                        <button className="option-btn"><Images size={24} stroke="green" />圖片 / 影片</button>
                        <button className="option-btn"><Laugh size={24} stroke="orange" />感受</button>
                    </div>
                    <button className="post-btn">發布</button>
                </div>
            </div>

            <div className="posts-feed">
                {posts.map(({ id, user, time, text, tayal, actions }) => (
                    <div key={id} className="post">
                        <div className="post-header">
                            <div className="post-avatar">{user.avatar}</div>
                            <div className="post-user-info">
                                <h4>{user.name}</h4>
                                <div className="post-meta">
                                    <span className="tribe-badge">{user.tribe}</span>
                                    <span>{time}</span>
                                    {user.badge && (
                                        <span
                                            style={{
                                                background: "#00b894",
                                                color: "white",
                                                padding: "2px 6px",
                                                borderRadius: "8px",
                                                fontSize: "0.7rem"
                                            }}
                                        >
                                            {user.badge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="post-content">
                            <div className="post-text">{text}</div>
                            <div className="post-tayal">{tayal}</div>
                        </div>

                        <div className="post-actions">
                            {postBtnMenu.map((btn) => (
                                <button key={btn.id} className="action-btn">
                                    {btn.icon} <span>{actions[btn.id] === 0 ? btn.label : actions[btn.id]}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Post;