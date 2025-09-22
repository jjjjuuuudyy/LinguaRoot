import React, { useState, useRef } from "react";
import { ArrowDownUp, Volume2, Check } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// 單個可排序單詞元件
function SortableWord({ id, word, audio, onClickWord, onLongPress, isMoving }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging
      ? "transform 0.2s ease"
      : isMoving
      ? "all 0.4s ease"
      : transition || "transform 0.2s ease",
    zIndex: isDragging ? 999 : "auto",
    opacity: isDragging ? 0.8 : 1,
  };

  const timerRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    startPos.current = { x: e.clientX, y: e.clientY };
    timerRef.current = setTimeout(() => {
      onLongPress(id); // 長按播放音檔
    }, 500);
  };

  const handleMouseUp = (e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      const dx = Math.abs(e.clientX - startPos.current.x);
      const dy = Math.abs(e.clientY - startPos.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 5) {
        // 移動距離很小才算短按移動
        onClickWord(id);
      }
    }
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={(e) => handleMouseDown(e.touches[0])}
      onTouchEnd={(e) => handleMouseUp(e.changedTouches[0])}
      className="custom-btn mx-2 cursor-pointer active:scale-105 flex items-center gap-2 transition-transform"
    >
      {word}
      <span className="cursor-pointer text-sm">
        &nbsp;<Volume2 size={15} />
      </span>
    </button>
  );
}

// 可放置區域元件
function DroppableArea({ id, children, label }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] border-2 rounded-lg p-4 mb-6 flex flex-wrap justify-center items-center gap-2 transition ${
        isOver ? "border-[#9B1B30] bg-pink-50 scale-105" : "border-gray-400 border-dashed"
      }`}
    >
      {children && children.length > 0 ? children : <p className="text-gray-400">{label}</p>}
    </div>
  );
}

// 主元件
export default function SentenceOrdering({ question, onConfirm }) {
  const [bank, setBank] = useState(question.words.map((w) => w.word));
  const [zone, setZone] = useState([]);
  const [checked, setChecked] = useState(false);
  const [movingWordId, setMovingWordId] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor));

  // 拖曳結束
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (zone.includes(active.id) && zone.includes(over.id)) {
      setZone((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    } else if (bank.includes(active.id) && over.id === "drop-zone") {
      setBank(bank.filter((w) => w !== active.id));
      setZone([...zone, active.id]);
    } else if (zone.includes(active.id) && over.id === "bank-zone") {
      setZone(zone.filter((w) => w !== active.id));
      setBank([...bank, active.id]);
    }
  };

  // 短按移動
  const handleClickWord = (id) => {
    setMovingWordId(id); // 標記動畫
    setTimeout(() => setMovingWordId(null), 400); // 動畫結束清除

    if (bank.includes(id)) {
      setBank(bank.filter((w) => w !== id));
      setZone([...zone, id]);
    } else if (zone.includes(id)) {
      setZone(zone.filter((w) => w !== id));
      setBank([...bank, id]);
    }
  };

  // 長按播放音檔
  const handleLongPress = (id) => {
    const w = question.words.find((word) => word.word === id);
    if (w?.audio) {
      new Audio(w.audio).play();
    }
  };

  return (
    <div className="text-center min-h-[400px] flex flex-col items-center justify-center">
      <h5 className="fw-bolder mb-4">
        <ArrowDownUp />&nbsp;例句排列
      </h5>
      <h2 className="fw-bolder mb-4">{question.sentenceCn}</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* 拖放區 */}
        <SortableContext items={zone} strategy={horizontalListSortingStrategy}>
          <DroppableArea id="drop-zone" label="拖曳單詞到這裡">
            {zone.map((id) => {
              const w = question.words.find((word) => word.word === id);
              return (
                <SortableWord
                  key={id}
                  id={id}
                  word={w.word}
                  audio={w.audio}
                  onClickWord={handleClickWord}
                  onLongPress={handleLongPress}
                  isMoving={movingWordId === id}
                />
              );
            })}
          </DroppableArea>
        </SortableContext>

        <h5 className="fw-bolder mb-4"><ArrowDownUp /></h5>

        {/* 單詞庫 */}
        <SortableContext items={bank} strategy={horizontalListSortingStrategy}>
          <DroppableArea id="bank-zone" label="單詞庫">
            {bank.map((id) => {
              const w = question.words.find((word) => word.word === id);
              return (
                <SortableWord
                  key={id}
                  id={id}
                  word={w.word}
                  audio={w.audio}
                  onClickWord={handleClickWord}
                  onLongPress={handleLongPress}
                  isMoving={movingWordId === id}
                />
              );
            })}
          </DroppableArea>
        </SortableContext>
      </DndContext>

      {/* 確認按鈕 & 結果 */}
      {!checked ? (
        <button
          onClick={() => {
            setChecked(true);
            onConfirm && onConfirm();
          }}
          disabled={zone.length === 0}
          className="confirm-btn"
        >
          <Check />&nbsp;確認
        </button>
      ) : (
        <>
          <p className="mt-3 font-bold">
            {JSON.stringify(zone) === JSON.stringify(question.answer) ? "✅ 正確" : "❌ 錯誤"}
          </p>
          <p className="mt-1 text-blue-600 font-bold">
            正確答案：{question.answer.join(" ")}
          </p>
        </>
      )}
    </div>
  );
}
