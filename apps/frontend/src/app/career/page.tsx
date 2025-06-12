"use client";

export default function ResumesPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl mb-4">履歴書</h1>

            {/* ここで直接埋め込む */}
            <div className="w-full h-screen p-4">
                <object
                    data="/career/A3career.svg"
                    type="image/svg+xml"
                    className="w-full h-full object-contain"
                >
                    <p className="text-white">ファイルを表示できません。</p>
                </object>
            </div>
        </div>
    );
}
