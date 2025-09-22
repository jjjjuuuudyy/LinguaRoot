import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc, getDocs, getDoc, updateDoc, collection,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { useAuth } from "../../src/userServives/authContext";
import "../../static/css/_note/./notesharestyle.css";
import { Heart } from "lucide-react"

function timeAgo(ts) {
  if (!ts) return "";
  const ms = (ts.seconds ? ts.seconds * 1000 : ts) - 0;
  const diff = Date.now() - ms;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (sec < 60) return "剛剛";
  if (min < 60) return `${min} 分鐘前`;
  if (hr < 24) return `${hr} 小時前`;
  if (day === 1) return "昨天";
  return `${day} 天前`;
}

export default function NoteShare() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [allNotes, setAllNotes] = useState([]);
  const [filter, setFilter] = useState("latest"); // latest | hot | my
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalNote, setModalNote] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // toast
  const [toast, setToast] = useState({ show: false, text: "" });
  const toastTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);

  const notesPerPage = 8;
  const myUid = userData?.uid || null;
  const isMyTab = filter === "my";

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "sharedNotes"));
        const rows = [];
        snap.forEach((d) => {
          const data = d.data();
          if (!data.deleted) rows.push({ id: d.id, ...data });
        });
        setAllNotes(rows);
        setCurrentPage(1);
      } catch (e) {
        console.error("Fetch sharedNotes error:", e);
      }
    })();
  }, [refreshTick]);

  const filteredSorted = useMemo(() => {
    let list = [...allNotes];
    if (filter === "my") {
      list = myUid ? list.filter((n) => n.uid === myUid) : [];
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    } else if (filter === "hot") {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else {
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }

    const kw = keyword.trim().toLowerCase();
    if (kw) {
      list = list.filter((n) => {
        const title = (n.title || "").toLowerCase();
        const user = (n.username || "").toLowerCase();
        const preview = (n.preview || "").replace(/<[^>]+>/g, " ").toLowerCase();
        return title.includes(kw) || user.includes(kw) || preview.includes(kw);
      });
    }
    return list;
  }, [allNotes, filter, keyword, myUid]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / notesPerPage));
  const paginatedNotes = useMemo(
    () => filteredSorted.slice((currentPage - 1) * notesPerPage, currentPage * notesPerPage),
    [filteredSorted, currentPage]
  );

  const openModal = async (note) => {
    try {
      const full = await getDoc(doc(db, "sharedNotes", note.id));
      if (full.exists()) {
        setModalNote({ id: full.id, ...full.data() });
        setShowModal(true);
      }
    } catch (e) {
      console.error("Open modal error:", e);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalNote(null);
  };

  const isMine = (note) => userData && note.uid === userData.uid;
  const likedByMe = (note) =>
    userData ? (note.likedBy || []).includes(userData.uid) : false;

  // 顯示 toast（會自動隱藏）
  const showToast = (text, duration = 2500) => {
    setToast({ show: true, text });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast({ show: false, text: "" }), duration);
  };

  // 可切換的按讚（含未登入導向）
  const toggleLike = async (e, note, source = "card") => {
    e.stopPropagation();

    if (!userData) {
      showToast("請先登入後再按讚");
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => navigate("/login"), 1000);
      return;
    }
    if (isMine(note)) return;

    const already = likedByMe(note);
    const noteRef = doc(db, "sharedNotes", note.id);
    const newLikedBy = already
      ? (note.likedBy || []).filter((uid) => uid !== userData.uid)
      : [...(note.likedBy || []), userData.uid];
    const newLikes = Math.max(0, (note.likes || 0) + (already ? -1 : 1));

    // 樂觀更新：列表
    setAllNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, likes: newLikes, likedBy: newLikedBy } : n))
    );
    // 樂觀更新：Modal
    setModalNote((prev) =>
      prev && prev.id === note.id ? { ...prev, likes: newLikes, likedBy: newLikedBy } : prev
    );

    try {
      await updateDoc(noteRef, { likes: newLikes, likedBy: newLikedBy });
    } catch (e) {
      console.error("toggleLike error:", e);
      // 回滾
      setAllNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
      setModalNote((prev) => (prev && prev.id === note.id ? { ...note } : prev));
      showToast("操作失敗，請稍後再試");
    }
  };

  const handleModalDelete = async () => {
    if (!modalNote || !isMyTab || myUid !== modalNote.uid) return;
    if (!window.confirm("確定要刪除這則筆記？")) return;
    try {
      await updateDoc(doc(db, "sharedNotes", modalNote.id), { deleted: true });
      setAllNotes((prev) => prev.filter((n) => n.id !== modalNote.id));
      closeModal();
    } catch (e) {
      console.error("Delete error:", e);
      showToast("刪除失敗，請稍後再試");
    }
  };

  useEffect(() => {
    if (!id) return;
    const hit = allNotes.find((n) => n.id === id);
    if (hit) openModal(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, allNotes.length]);

  // 清理計時器
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  return (
    <div className="ns-wrap">
      {/* Toolbar */}
      <div className="ns-toolbar">
        <div className="ns-search">
          <span className="ns-search-icon">🔎</span>
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="搜尋..."
            className="ns-search-input"
          />
        </div>

        <div className="ns-tabs">
          {[
            { key: "my", label: "我的" },
            { key: "latest", label: "最新" },
            { key: "hot", label: "熱門" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setFilter(t.key);
                setCurrentPage(1);
              }}
              className={`ns-tab ${filter === t.key ? "active" : ""}`}
            >
              {t.label}
            </button>
          ))}

          <button
            className="ns-refresh"
            title="重新整理"
            onClick={() => setRefreshTick((x) => x + 1)}
          >
            ⟳
          </button>
        </div>
      </div>

      {/* 空狀態 */}
      {isMyTab && !myUid && <div className="ns-empty">請先登入以查看你曾發布的筆記。</div>}
      {filteredSorted.length === 0 && <div className="ns-empty">目前沒有可顯示的分享筆記。</div>}

      {/* 卡片 */}
      <div className="ns-grid">
        {paginatedNotes.map((note) => {
          const canInteract = userData && !isMine(note);
          const iLike = likedByMe(note);

          return (
            <div key={note.id} className="ns-card" onClick={() => openModal(note)}>
              <div className="ns-card-head">
                {note.avatarUrl ? (
                  <img src={note.avatarUrl} alt="avatar" className="ns-avatar" />
                ) : (
                  <div className="ns-avatar ns-avatar-fallback">👤</div>
                )}

                <div className="ns-meta">
                  <div className="ns-username">{note.username || "使用者名稱"}</div>
                  <div className="ns-time">{timeAgo(note.createdAt)}</div>
                </div>

                {isMyTab && myUid === note.uid && <span className="ns-edit">編輯</span>}
              </div>

              <div className="ns-card-body">
                <div className="ns-title">
                  {note.pages && note.pages.length > 0
                    ? note.pages[0].title || "標題"
                    : "標題"}
                </div>
                <div
                  className="ns-preview"
                  dangerouslySetInnerHTML={{
                    __html: note.preview || "<p>內容</p>",
                  }}
                />
                <div className="ns-like-row">
                  <button
                    className={`ns-like-btn ${iLike ? "is-liked" : ""}`}
                    onClick={(e) => toggleLike(e, note, "card")}
                  >
                    <Heart size={20} fill={iLike ? "red" : "none"} /><span>{note.likes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 分頁 */}
      {filteredSorted.length > 0 && (
        <div className="ns-pager">
          <div className="ns-pager-btns">
            <button
              className="ns-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              上一頁
            </button>
            <button
              className="ns-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              下一頁
            </button>
          </div>
          <div className="ns-page-info">
            第 <strong className="ns-page-num">{currentPage}</strong> / {totalPages} 頁
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && modalNote && (
        <div className="ns-modal-mask" onClick={closeModal}>
          <div className="ns-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="ns-modal-title">{modalNote.pages[0].title || "筆記內容"}</h2>
            <p className="ns-modal-sub">
              分享者：{modalNote.username || "匿名者"}　❤️ {modalNote.likes || 0}
            </p>

            {userData && !isMine(modalNote) && (
              <div style={{ marginBottom: "0.75rem" }}>
                <button
                  className={`ns-like-btn ${likedByMe(modalNote) ? "is-liked" : ""}`}
                  onClick={(e) => toggleLike(e, modalNote, "modal")}
                >
                  {likedByMe(modalNote) ? "收回讚" : "按讚"}
                </button>
              </div>
            )}

            {(modalNote.pages || []).map((pg, i) => (
              <div key={i} className="ns-modal-page">
                <div className="ns-page-label">第 {i + 1} 頁</div>
                <div
                  className="ns-modal-content"
                  dangerouslySetInnerHTML={{ __html: pg.content }}
                />
              </div>
            ))}

            <div className="ns-modal-actions">
              {isMyTab && myUid && modalNote.uid === myUid && (
                <button className="ns-btn danger" onClick={handleModalDelete}>
                  刪除筆記
                </button>
              )}
              <button className="ns-btn" onClick={closeModal}>
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="ns-toast">
          {toast.text}
        </div>
      )}
    </div>
  );
}
