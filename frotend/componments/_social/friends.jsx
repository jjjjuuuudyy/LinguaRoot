import "../../static/css/_social/friends.css"
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { getAllUsers } from "../../src/userServives/userServive"
import AvatarImg from "../../static/assets/_auth/avatar.webp"
import { getDatabase, ref, onValue } from "firebase/database";

const Friends = ({ }) => {
    const [friends, setFriends] = useState([]);

    //取得所有使用者
    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            // console.log(users);
            setFriends(users);
        };
        fetchUsers();

        //監聽使用者是否在線
        const db = getDatabase();
        const statusRef = ref(db, "/status");

        onValue(statusRef, (snapshot) => {
            const statuses = snapshot.val();
            setFriends((prev) =>
                prev.map((user) => ({
                    ...user,
                    online: statuses?.[user.id]?.state === "online"
                }))
            );
        });
    }, []);

    return (
        <div className="social-sidebar">
            <h3 className="social-section-title">
                <Users size={20} /> 學習夥伴
            </h3>

            <div className="friends-list">
                {friends.map((f, idx) => (
                    <div className="friend-item" key={idx}>
                        <img src={f.avatarUrl ? f.avatarUrl : AvatarImg} className="friend-avatar" />
                        <div className="friend-info">
                            <div className="friend-name">
                                {f.name}
                                {f.online && <span className="online-dot"></span>}
                            </div>
                            <div className="friend-level">{f.identity}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Friends;