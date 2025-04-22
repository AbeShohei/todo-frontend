// src/components/TodoList.tsx
import React from "react";
import { Todo } from "../types/Todo";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  editingTodoId: number | null;
  onToggleComplete: (id: number, currentCompleted: boolean) => void;
  onDelete: (id: number) => void;
  onEditStart: (id: number) => void;
  onEditCancel: () => void;
  onEditSave: (id: number, newTitle: string) => void;
}

// --- ↓↓↓ Propsを受け取るように変更 ↓↓↓ ---
const TodoList: React.FC<TodoListProps> = ({
  todos,
  editingTodoId,
  onToggleComplete,
  onDelete,
  onEditStart,
  onEditCancel,
  onEditSave,
}) => {
  return (
    <ul className="list-none p-0 m-0 bg-white shadow-md rounded-lg overflow-hidden">
      {todos.length > 0 ? (
        todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isEditing={editingTodoId === todo.id} // このアイテムが編集中かどうかのフラグ
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEditStart={onEditStart}
            onEditCancel={onEditCancel}
            onEditSave={onEditSave}
          />
        ))
      ) : (
        <li className="p-4 text-center text-gray-500">ToDoはありません。</li>
      )}
    </ul>
  );
};

export default TodoList;
