import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "RecruiTrack",
    description: "転職活動を戦略的に進める自己管理ツール RecruiTrack",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
        <head />
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 text-gray-900`}
        >
        <header className="bg-gray-900 shadow">
            <nav className="container mx-auto flex items-center justify-between p-4">
                <div className="flex space-x-6">
                    <Link
                        href="/"
                        className="font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        ToDo
                    </Link>
                    <Link
                        href="/companies"
                        className="font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        企業リスト
                    </Link>
                    <Link
                        href="/career"
                        className="font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        履歴書
                    </Link>
                    <Link
                        href="/resumes"
                        className="font-medium text-gray-300 hover:text-white transition-colors"
                    >
                        職務経歴書
                    </Link>
                </div>
                <div>
                    <Link
                        href="/companies/new"
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                        新規登録
                    </Link>
                </div>
            </nav>
        </header>
        <main className="container mx-auto p-6">{children}</main>
        </body>
        </html>
    );
}
