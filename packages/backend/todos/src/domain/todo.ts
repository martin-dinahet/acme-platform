export type Todo = {
  id: string;
  /** Better Auth user ID. Each query is scoped by it. */
  ownerId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTodo = { title: string; completed?: boolean };

export type TodoPatch = { title?: string; completed?: boolean };
