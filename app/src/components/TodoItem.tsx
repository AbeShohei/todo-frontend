// src/components/TodoItem.tsx
import React, { useState, useEffect, useRef } from "react";
import { Todo } from "../types/Todo";

interface TodoItemProps {
  todo: Todo;
  isEditing: boolean;
  onToggleComplete: (id: number, currentCompleted: boolean) => void; // IDと現在の完了状態を渡す
  onDelete: (id: number) => void;
  onEditStart: (id: number) => void;
  onEditCancel: () => void;
  onEditSave: (id: number, newTitle: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  isEditing,
  onToggleComplete,
  onDelete,
  onEditStart,
  onEditCancel,
  onEditSave,
}) => {
  // 編集中のタイトルを保持するstate
  const [editTitle, setEditTitle] = useState<string>(todo.title);
  // input要素への参照を作成 (フォーカス制御用)
  const inputRef = useRef<HTMLInputElement>(null);

  // isEditing が true に変わったときに input にフォーカスを当てる
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // テキストを選択状態にする
    }
  }, [isEditing]);

  // 保存ボタンを押したときの処理
  const handleSave = () => {
    onEditSave(todo.id, editTitle);
  };

  // Enterキーで保存、Escapeキーでキャンセル
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      onEditCancel();
      setEditTitle(todo.title); // タイトルを元に戻す
    }
  };

  // 通常表示と編集モード表示の切り替え
  if (isEditing) {
    // --- 編集中 ---
    return (
      <li className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        {" "}
        {/* 背景色を変える */}
        <div className="flex-grow mr-2">
          <input
            ref={inputRef} // input要素への参照を紐付け
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown} // キー入力イベント
            onBlur={handleSave} // フォーカスが外れた時も保存を試みる (キャンセルしたい場合は onEditCancel を呼ぶなど調整)
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          {" "}
          {/* ボタンが縮まないように */}
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            保存
          </button>
          <button
            onClick={() => {
              onEditCancel();
              setEditTitle(todo.title); // タイトルを元に戻す
            }}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            ｷｬﾝｾﾙ
          </button>
        </div>
      </li>
    );
  } else {
    // --- 通常表示 ---
    return (
      <li
        className={`flex items-center justify-between p-4 border-b border-gray-200 ${
          todo.completed ? "bg-gray-100" : ""
        }`}
      >
        <div className="flex items-center flex-grow mr-2 overflow-hidden">
          {" "}
          {/* タイトルが長い場合に省略されるように */}
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggleComplete(todo.id, todo.completed)}
            className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer flex-shrink-0"
          />
          <span
            className={`text-lg truncate ${
              todo.completed ? "line-through text-gray-500" : ""
            }`}
            title={todo.title} // 長い場合にツールチップ表示
            onDoubleClick={() => onEditStart(todo.id)} // ダブルクリックで編集開始 (オプション)
          >
            {todo.title}
          </span>
        </div>
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={() => onEditStart(todo.id)} // 編集ボタンクリックで編集開始
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
            disabled={todo.completed} // 完了済みの場合は編集不可にする (オプション)
          >
            編集
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            削除
          </button>
        </div>
      </li>
    );
  }
};

export default TodoItem;
