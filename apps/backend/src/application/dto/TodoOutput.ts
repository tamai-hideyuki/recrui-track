export type TodoOutput = {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string; // ISO8601
    updatedAt: string; // ISO8601
    reminderAt: string | null;     // ISO8601
    dueAt: string | null;          // ISO8601
    reminderOffset: number | null; // 秒数
    reminded: boolean;             // 通知済みフラグ
};
