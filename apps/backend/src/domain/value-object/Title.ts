export class Title {
    private readonly _value: string;
    private constructor(value: string) { this._value = value; }
    public static create(raw: string): Title {
        const trimmed = raw.trim();
        if (trimmed.length === 0) throw new Error("タイトルは空文字にできません");
        if (trimmed.length > 100) throw new Error("タイトルは100文字以内で入力してください");
        return new Title(trimmed);
    }
    public get value(): string {
        return this._value;
    }
}
