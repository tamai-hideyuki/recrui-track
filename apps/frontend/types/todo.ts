export type Todo = {
    id: string
    title: string
    completed: boolean
    createdAt: string  // ISO8601 文字列で受け取る
    updatedAt: string
}
