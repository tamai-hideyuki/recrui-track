export type CreateTodoInput = {
    title: string;
    reminderAt?: string | null;    // ISO8601 形式
    dueAt?: string | null;         // ISO8601 形式
    reminderOffset?: number | null;// 秒数
};
