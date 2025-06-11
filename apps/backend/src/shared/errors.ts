/** リソースが見つからないとき */
export class NotFoundError extends Error {
    readonly status = 404;
    constructor(message: string = "Resource not found") {
        super(message);
        this.name = "NotFoundError";
    }
}

/** バリデーションエラー */
export class ValidationError extends Error {
    readonly status = 400;
    constructor(message: string, public details?: unknown) {
        super(message);
        this.name = "ValidationError";
    }
}

/** サーバー内部エラー */
export class InternalServerError extends Error {
    readonly status = 500;
    constructor(message: string = "Internal server error") {
        super(message);
        this.name = "InternalServerError";
    }
}
