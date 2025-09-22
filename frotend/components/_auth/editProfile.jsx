import "../../static/css/_auth/editProfile.css"
import { Edit2, User, Mail, Shield, Save, Calendar, Lock } from "lucide-react";
import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import AvatarImg from "../../static/assets/_auth/avatar.webp"
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../../src/userServives/userServive"
import { useAuth } from "../../src/userServives/authContext"

const Edit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state;
    const [formData, setFormData] = useState({
        name: userData.firestoreData.name,
        email: userData.firestoreData.email,
        identity: userData.firestoreData.identity,
        joinDate: userData.firestoreData.joinDate,
        password: "********", //firebase auth不提供直接取得密碼，所以暫時這樣寫
        avatarUrl: userData.firestoreData.avatarUrl ? userData.firestoreData.avatarUrl : AvatarImg
    });

    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(formData.avatarUrl);
    const [isUploading, setIsUploading] = useState(false);

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        setIsUploading(true);

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: data
            });
            const result = await res.json();
            setFormData(prev => ({ ...prev, avatarUrl: result.secure_url }));
        } catch (err) {
            console.error("圖片上傳失敗", err);
            alert("圖片上傳失敗，請稍後再試。");
        } finally {
            setIsUploading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const { updateUserData } = useAuth();
    const handleSave = async () => {
        try {
            const result = await updateProfile(userData.uid, formData);

            if (result.success) {
                updateUserData(result);
                navigate("/");
            } else {
                alert("⚠️ " + result.message);
            }
        } catch (err) {
            alert("🔥 更新失敗，請稍後再試");
        }
    };

    return (
        <div className="edit-container">
            <h2 className="edit-title">編輯個人資料</h2>

            <div className="avatar-uploader" onClick={handleImageClick}>
                <img src={previewUrl} alt="頭像" className="avatar-image" />
                <div className="edit-overlay">
                    <Edit2 size={18} />
                    <span>{isUploading ? "上傳中..." : "變更圖片"}</span>
                </div>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleChange}
                    style={{ display: "none" }}
                />
            </div>

            <div className="edit-form">
                <div className="form-group">
                    <label><User size={16} /> 姓名</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={e => handleInputChange("name", e.target.value)}
                        placeholder="請輸入您的姓名"
                    />
                </div>

                <div className="form-group">
                    <label><Shield size={16} /> 身分</label>
                    <select
                        value={formData.identity}
                        onChange={e => handleInputChange("identity", e.target.value)}
                    >
                        <option>學生</option>
                        <option>教師</option>
                        <option>其他</option>
                    </select>
                </div>

                <div className="form-group">
                    <label><Calendar size={16} /> 加入日期</label>
                    <input
                        type="text"
                        value={new Date(formData.joinDate).toLocaleDateString("zh-TW")}
                        disabled
                        style={{ backgroundColor: "#f5f5f5", color: "#888" }}
                    />
                </div>

                <div className="form-group">
                    <label><Mail size={16} /> 信箱</label>
                    <input
                        type="email"
                        value={formData.email}
                        disabled
                        style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                    />
                </div>

                <div className="form-group">
                    <label><Lock size={16} /> 密碼</label>
                    <input
                        type="password"
                        value={formData.password}
                        disabled
                        style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                    />
                    <a className="forgot-pass" onClick={() => { navigate("/reset"); }}>變更密碼</a>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "24px" }}>
                    <button className="cancel-btn" type="button" onClick={() => window.history.back()}>
                        取消
                    </button>

                    <button className="save-btn" onClick={handleSave}>
                        <Save size={16} /> 儲存變更
                    </button>
                </div>
            </div>
        </div>
    );
};
export default Edit;