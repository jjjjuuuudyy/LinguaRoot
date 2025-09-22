import "../../static/css/_social/index.css"
import Friends from "../../componments/_social/friends"
import Post from "../../componments/_social/post"
import Challenge from "../../componments/_social/challenge"
import { useLocation } from "react-router-dom";
import AvatarImg from "../../static/assets/_auth/avatar.webp"

const Index = ({ }) => {
    const location = useLocation();
    const userData = location.state;

    return (
        <>
            <p className="social-title">首頁 ＞ 社群</p>
            <div className="social-container">
                <Friends />
                <Post avatarUrl={userData.firestoreData.avatarUrl ? userData.firestoreData.avatarUrl : AvatarImg} />
                <Challenge />
            </div>
        </>
    );
};
export default Index;