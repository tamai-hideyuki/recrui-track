export type TodoResponseDto = {
    id: string;
    title: string;
    completed: 0 | 1;
    createdAt: string;
    updatedAt: string;
    reminderAt: string | null;
    dueAt: string | null;
    reminderOffset: number | null;
    reminded: 0 | 1;
};
