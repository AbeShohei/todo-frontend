// src/App.tsx
import React, { useState, useEffect } from "react";
import axios from "axios"; // axiosをインポート
import { Todo } from "./types/Todo"; // 型定義をインポート
import TodoList from "./components/TodoList"; // 拡張子を省略してインポート
import TodoForm from "./components/TodoForm";

// Spring Boot APIのエンドポイントURL (環境変数にするのが望ましいが、まずは直接記述)
// Docker Composeを使う場合は 'http://localhost:8080/api/todos' で良いことが多い
// 環境変数からAPIのベースURLを取得 (末尾にスラッシュや /api は付けない)
// ローカル開発時のデフォルト値も同様
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ToDo APIの完全なエンドポイントURL
const API_URL = `${API_BASE_URL}/api/todos`; // ここで /api/todos を結合する

function App() {
  // ToDoリストの状態を管理するためのstate (初期値は空の配列)
  const [todos, setTodos] = useState<Todo[]>([]);
  // エラーメッセージを管理するためのstate (オプション)
  const [error, setError] = useState<string | null>(null);
  // ローディング状態を管理するためのstate (オプション)
  const [loading, setLoading] = useState<boolean>(true);
  // --- ↓↓↓ 編集中のToDo IDを管理するstateを追加 ↓↓↓ ---
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null); // number: 編集中のID, null: 編集モードでない
  // --- ↑↑↑ 編集中のToDo IDを管理するstateを追加 ↑↑↑ ---

  // コンポーネントが最初にマウントされた時（初回表示時）にToDoリストを取得する
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true); // ローディング開始
      setError(null); // エラーをリセット
      try {
        // axiosを使ってGETリクエストを送信
        const response = await axios.get<Todo[]>(API_URL);
        // 取得したデータをstateにセット
        setTodos(response.data);
      } catch (err) {
        // エラーハンドリング
        console.error("Error fetching todos:", err);
        setError("ToDoリストの読み込みに失敗しました。");
      } finally {
        setLoading(false); // ローディング終了
      }
    };

    fetchTodos(); // 関数を実行
  }, []); // 第2引数の配列が空なので、このeffectは初回マウント時にのみ実行される

  const handleAddTodo = async (title: string) => {
    setError(null); // エラーをリセット
    try {
      // 送信するデータ (completedはデフォルトfalseなので不要)
      const newTodoData = { title: title };
      // axiosを使ってPOSTリクエストを送信
      const response = await axios.post<Todo>(API_URL, newTodoData);
      // 成功したら、返ってきた新しいToDoデータを既存のリストの末尾に追加
      setTodos((prevTodos) => [...prevTodos, response.data]);
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("ToDoの追加に失敗しました。");
    }
  };

  // --- ↓↓↓ ToDoの完了/未完了を切り替える関数 ↓↓↓ ---
  const handleToggleComplete = async (
    id: number,
    currentCompleted: boolean
  ) => {
    setError(null);
    const originalTodos = [...todos]; // エラー時のロールバック用に元のリストを保持

    // optimistic update: 先にUIを更新してしまう
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !currentCompleted } : todo
      )
    );

    try {
      // 更新後の完了状態
      const updatedCompleted = !currentCompleted;
      // 送信するデータ (タイトルは不要なので送らない、もしくは既存のものを送る)
      // バックエンドAPIの実装によっては、更新したいフィールドだけ送れば良い場合もある
      // 今回のAPI (PUT /api/todos/{id}) は title と completed を受け取る想定なので、
      // 既存のタイトルも一緒に送るか、API側を修正する必要がある。
      // ここでは、更新したいTodoの全情報を送ることにする。
      const todoToUpdate = originalTodos.find((todo) => todo.id === id);
      if (!todoToUpdate) throw new Error("Todo not found for update"); //念のため

      const updatedTodoData = { ...todoToUpdate, completed: updatedCompleted };

      // axiosを使ってPUTリクエストを送信
      await axios.put(`${API_URL}/${id}`, updatedTodoData);
      // 成功時はUIは既に更新されているので何もしない
    } catch (err) {
      console.error("Error updating todo:", err);
      setError("ToDoの更新に失敗しました。");
      // エラーが発生したらUIを元の状態に戻す (ロールバック)
      setTodos(originalTodos);
    }
  };
  // --- ↑↑↑ ToDoの完了/未完了を切り替える関数 ↑↑↑ ---

  // --- ↓↓↓ ToDoを削除する関数 ↓↓↓ ---
  const handleDeleteTodo = async (id: number) => {
    setError(null);
    const originalTodos = [...todos]; // エラー時のロールバック用

    // optimistic update: 先にUIから削除
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));

    try {
      // axiosを使ってDELETEリクエストを送信
      await axios.delete(`${API_URL}/${id}`);
      // 成功時はUIは既に更新されているので何もしない
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("ToDoの削除に失敗しました。");
      // エラーが発生したらUIを元の状態に戻す (ロールバック)
      setTodos(originalTodos);
    }
  };
  // --- ↑↑↑ ToDoを削除する関数 ↑↑↑ ---

  // --- ↓↓↓ 編集モードを開始する関数 ↓↓↓ ---
  const handleEditStart = (id: number) => {
    setEditingTodoId(id);
  };
  // --- ↑↑↑ 編集モードを開始する関数 ↑↑↑ ---

  // --- ↓↓↓ 編集をキャンセルする関数 ↓↓↓ ---
  const handleEditCancel = () => {
    setEditingTodoId(null);
  };
  // --- ↑↑↑ 編集をキャンセルする関数 ↑↑↑ ---

  // --- ↓↓↓ 編集内容を保存する関数 ↓↓↓ ---
  const handleEditSave = async (id: number, newTitle: string) => {
    setError(null);
    const originalTodos = [...todos];
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      setError("タイトルは空にできません。");
      return; // 何もせず終了
    }

    // Optimistic Update
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, title: trimmedTitle } : todo
      )
    );
    setEditingTodoId(null); // 編集モード終了

    try {
      const todoToUpdate = originalTodos.find((todo) => todo.id === id);
      if (!todoToUpdate) throw new Error("Todo not found for update");

      // タイトルだけ更新する場合 (completedはそのまま)
      const updatedTodoData = { ...todoToUpdate, title: trimmedTitle };

      await axios.put(`${API_URL}/${id}`, updatedTodoData);
      // 成功時はUIは既に更新されている
    } catch (err) {
      console.error("Error updating todo title:", err);
      setError("ToDoタイトルの更新に失敗しました。");
      setTodos(originalTodos); // ロールバック
      // エラーが起きても編集モードは一旦終了させる（必要なら再度編集ボタンを押す）
    }
  };
  // --- ↑↑↑ 編集内容を保存する関数 ↑↑↑ ---

  // JSXでの表示部分
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6">
        ToDoリスト (React + Spring Boot)
      </h1>

      {/* --- ↓↓↓ TodoFormコンポーネントを追加 ↓↓↓ --- */}
      <TodoForm onAddTodo={handleAddTodo} />
      {/* --- ↑↑↑ TodoFormコンポーネントを追加 ↑↑↑ --- */}

      {loading && <p className="text-center text-gray-500">読み込み中...</p>}
      {error && (
        <p className="text-center text-red-500 bg-red-100 p-3 rounded">
          {error}
        </p>
      )}

      {!loading && !error && (
        <TodoList
          todos={todos}
          editingTodoId={editingTodoId} // 編集中のIDを渡す
          // --- ↓↓↓ 作成した関数をTodoListに渡す ↓↓↓ ---
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
          // --- ↑↑↑ 作成した関数をTodoListに渡す ↑↑↑ ---

          // --- ↓↓↓ 編集関連の関数を渡す ↓↓↓ ---
          onEditStart={handleEditStart}
          onEditCancel={handleEditCancel}
          onEditSave={handleEditSave}
          // --- ↑↑↑ 編集関連の関数を渡す ↑↑↑ ---
        />
      )}
    </div>
  );
}
export default App;
