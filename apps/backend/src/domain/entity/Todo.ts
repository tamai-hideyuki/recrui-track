import { Title } from "../value-object/Title";

export class Todo {
    private _id: string;
    private _title: Title;
    private _completed: boolean;
    private _createdAt: Date;
    private _updatedAt: Date;
    private _reminderAt: Date | null;
    private _dueAt: Date | null;
    private _reminderOffset: number | null;
    private _reminded: boolean;

    private constructor(
        id: string,
        title: Title,
        completed: boolean,
        createdAt: Date,
        updatedAt: Date,
        reminderAt: Date | null,
        dueAt: Date | null,
        reminderOffset: number | null,
        reminded: boolean
    ) {
        this._id = id;
        this._title = title;
        this._completed = completed;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
        this._reminderAt = reminderAt;
        this._dueAt = dueAt;
        this._reminderOffset = reminderOffset;
        this._reminded = reminded;
    }

    public static createNew(id: string, rawTitle: string): Todo {
        const title = Title.create(rawTitle);
        const now = new Date();
        return new Todo(
            id,
            title,
            false,
            now,
            now,
            null,  // reminderAt
            null,  // dueAt
            null,  // reminderOffset
            false  // reminded
        );
    }

    public static reconstruct(params: {
        id: string;
        title: string;
        completed: boolean;
        createdAt: Date;
        updatedAt: Date;
        reminderAt: Date | null;
        dueAt: Date | null;
        reminderOffset: number | null;
        reminded: boolean;
    }): Todo {
        const title = Title.create(params.title);
        return new Todo(
            params.id,
            title,
            params.completed,
            params.createdAt,
            params.updatedAt,
            params.reminderAt,
            params.dueAt,
            params.reminderOffset,
            params.reminded
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

    public changeReminder(reminder: Date | null): void {
        this._reminderAt = reminder;
        this._updatedAt = new Date();
    }

    public changeDue(due: Date | null): void {
        this._dueAt = due;
        this._updatedAt = new Date();
    }

    public changeReminderOffset(offset: number | null): void {
        this._reminderOffset = offset;
        this._updatedAt = new Date();
    }

    public markReminded(): void {
        this._reminded = true;
        this._updatedAt = new Date();
    }

    public unmarkReminded(): void {
        this._reminded = false;
        this._updatedAt = new Date();
    }
    /**
     * 〆切日時が設定されており、現在時刻を過ぎていたら true を返す
     */
    public isOverdue(): boolean {
        return this._dueAt !== null && this._dueAt.getTime() < Date.now();
    }

    /**
     * 期限超過かつ未通知であれば通知済みフラグを立て、updatedAt を更新する
     */
    public markRemindedIfOverdue(): void {
        if (this.isOverdue() && !this._reminded) {
            this._reminded = true;
            this._updatedAt = new Date();
        }
    }

    // ———— getters ————
    public get id(): string {
        return this._id;
    }
    public get title(): string {
        return this._title.value;
    }
    public get completed(): boolean {
        return this._completed;
    }
    public get createdAt(): Date {
        return this._createdAt;
    }
    public get updatedAt(): Date {
        return this._updatedAt;
    }
    public get reminderAt(): Date | null {
        return this._reminderAt;
    }
    public get dueAt(): Date | null {
        return this._dueAt;
    }
    public get reminderOffset(): number | null {
        return this._reminderOffset;
    }
    public get reminded(): boolean {
        return this._reminded;
    }
}
