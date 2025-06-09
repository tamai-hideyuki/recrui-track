export type UpdateTodoInput = {
    id: string;
    title: string;
    completed: boolean;
    reminderAt?: string | null;    // ISO8601
    dueAt?: string | null;         // ISO8601
    reminderOffset?: number | null;// 秒数
};
