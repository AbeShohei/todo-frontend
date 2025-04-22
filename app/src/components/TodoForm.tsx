// src/components/TodoForm.tsx
import React, { useState } from 'react';

// このコンポーネントが受け取るPropsの型を定義
// onAddTodoは、新しいToDoのタイトルを引数に取り、何も返さない関数
interface TodoFormProps {
  onAddTodo: (title: string) => void;
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  // フォームの入力値を管理するためのstate
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');

  // フォーム送信時の処理
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // フォーム送信によるページリロードを防ぐ
    const trimmedTitle = newTodoTitle.trim(); // 前後の空白を削除
    if (!trimmedTitle) return; // 入力が空なら何もしない

    onAddTodo(trimmedTitle); // 親コンポーネントに新しいToDoのタイトルを渡す
    setNewTodoTitle(''); // 入力欄を空にする
  };

  return (
    <form onSubmit={handleSubmit} className="flex mb-6">
      <input
        type="text"
        value={newTodoTitle}
        onChange={(e) => setNewTodoTitle(e.target.value)} // 入力値が変わるたびにstateを更新
        placeholder="新しいToDoを入力..."
        className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-3 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
        disabled={!newTodoTitle.trim()} // 入力が空のときはボタンを無効化
      >
        追加
      </button>
    </form>
  );
};

export default TodoForm;