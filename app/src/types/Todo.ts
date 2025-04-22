// src/types/Todo.ts
export interface Todo {
    id: number; // Spring Boot側はLongだが、JS/TSではnumberで扱うのが一般的
    title: string;
    completed: boolean;
  }