export interface Todo {
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    reminderAt?: Date;
    dueAt?: Date;
    reminderOffset?: number;
    reminded: boolean;
}
