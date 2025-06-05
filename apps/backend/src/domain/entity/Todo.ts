import { Title } from "../value-object/Title";

export class Todo {
    private _id: string;
    private _title: Title;
    private _completed: boolean;
    private _createdAt: Date;
    private _updatedAt: Date;

    private constructor(
        id: string,
        title: Title,
        completed: boolean,
        createdAt: Date,
        updatedAt: Date
    ) {
        this._id = id;
        this._title = title;
        this._completed = completed;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    public static createNew(id: string, rawTitle: string): Todo {
        const title = Title.create(rawTitle);
        const now = new Date();
        return new Todo(id, title, false, now, now);
    }

    public static reconstruct(params: {
        id: string;
        title: string;
        completed: 0 | 1;
        createdAt: Date;
        updatedAt: Date;
    }): Todo {
        const title = Title.create(params.title);
        return new Todo(
            params.id,
            title,
            params.completed === 1,
            params.createdAt,
            params.updatedAt
        );
    }

    public complete(): void {
        if (this._completed) {
            throw new Error("すでに完了済みのToDoです");
        }
        this._completed = true;
        this._updatedAt = new Date();
    }

    public changeTitle(newRaw: string): void {
        const newTitle = Title.create(newRaw);
        this._title = newTitle;
        this._updatedAt = new Date();
    }

    public get id(): string { return this._id; }
    public get title(): string { return this._title.value; }
    public get completed(): boolean { return this._completed; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }
}
