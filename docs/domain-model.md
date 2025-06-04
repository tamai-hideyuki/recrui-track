#### ドメインモデル（エンティティ、値オブジェクト、関係性）

# 📘 Domain Model Definition – recrui-track

## 🧠 ドメインの定義
- recrui-track が扱うドメインは 「転職活動の自己管理と進捗可視化」 です。
- 転職という長期プロセスの中で、行動（応募・面談準備・書類作成など）を一元化し、可視化・振り返りを通じて意思決定を支援することが目的です。

## 🧱 エンティティ一覧

- 👤 User（ユーザー）

<table>
<tr>
<th>属性名</th><th>型</th><th>説明</th>
</tr>
<tr>
<th>id</th><th>UUID</th><th>識別子</th>
</tr>
<tr>
<th>name</th><th>string</th><th>表示名</th>
</tr>
<tr>
<th>email</th><th>EmailAddress (VO)</th><th>ログインID</th>
</tr>
<tr>
<th>createdAt</th><th>DateTime</th><th>登録日時</th>
</tr>
<tr>
<th>updatedAt</th><th>DateTime</th><th>更新日時</th>
</tr>
</table>

>複数アカウント運用（SaaS化）を視野に最上位エンティティとする。
---
- 🏢 Company（企業）
<table>
<tr>
<th>属性名</th><th>型</th><th>説明</th>
</tr>
<tr>
<th>id</th><th>UUID</th><th>識別子</th>
</tr>
<tr>
<th>userId</th><th>UUID</th><th>所有ユーザー</th>
</tr>
<tr>
<th>name</th><th>string?</th><th>企業名</th>
</tr>
<tr>
<th>industry</th><th>string?</th><th>業種</th>
</tr>
<tr>
<th>url</th><th>string?</th><th>企業/募集ページ URL</th>
</tr>
<tr>
<th>contactPerson</th><th>string?</th><th>担当者名・連絡先</th>
</tr>
<tr>
<th>notes</th><th>string?</th><th>補足メモ</th>
</tr>
<tr>
<th>createdAt</th><th>DateTime</th><th>登録日時</th>
</tr>
<tr>
<th>updatedAt</th><th>DateTime</th><th>更新日時</th>
</tr>
</table>

---

- Application（応募）  

**1社に複数職種応募や複数選考トラックを許容する場合に導入するので今回は形だけ** 

<table>
<tr>
<th>属性名</th><th>型</th><th>説明</th>
</tr>
<tr>
<th>id</th><th>UUID</th><th>識別子</th>
</tr>
<tr>
<th>companyId</th><th>UUID</th><th>紐づく企業</th>
</tr>
<tr>
<th>userId</th><th>UUID</th><th>所有ユーザー</th>
</tr>
<tr>
<th>jobTitle</th><th>string</th><th>応募職種</th>
</tr>
<tr>
<th>appliedAt</th><th>Date?</th><th>応募日 (未応募なら null)</th>
</tr>
<tr>
<th>status</th><th>enum</th><th>選考ステータス<br>（UNAPPLIED / APPLIED / DOCUMENT / FIRST_INTERVIEW / SECOND_INTERVIEW / FINAL / OFFER / REJECTED / DECLINED）</th>
</tr>
<tr>
<th>notes</th><th>string?</th><th>補足メモ</th>
</tr>
<tr>
<th>createdAt</th><th>DateTime</th><th>登録日時</th>
</tr>
<tr>
<th>updatedAt</th><th>DateTime</th><th>更新日時</th>
</tr>
</table>

---

- 📆 Interview（面談 / 面接）

<table>
<tr>
<th>属性名</th><th>型</th><th>説明</th>
</tr>
<tr>
<th>id</th><th>UUID</th><th>識別子</th>
</tr>
<tr>
<th>companyId</th><th>UUID</th><th>企業ID</th>
</tr>
<tr>
<th>applicationId</th><th>UUID?</th><th>応募ID（Application導入時）</th>
</tr>
<tr>
<th>userId</th><th>UUID</th><th>所有ユーザー</th>
</tr>
<tr>
<th>date</th><th>DateTime</th><th>実施日時</th>
</tr>
<tr>
<th>method</th><th>enum</th><th>形式<br> (ONLINE / ONSITE / PHONE)</th>
</tr>
<tr>
<th>interviewer</th><th>string?</th><th>面談相手の氏名</th>
</tr>
<tr>
<th>interviewerTitle</th><th>string?</th><th>相手の役職</th>
</tr>
<tr>
<th>result</th><th>enum</th><th>結果<br> (PASS / FAIL / PENDING / UNDECIDED)</th>
</tr>
<tr>
<th>feedback</th><th>string</th><th>自己評価・反省点</th>
</tr>
<tr>
<th>questionsAsked</th><th>string?</th><th>質問リスト</th>
</tr>
<tr>
<th>questionsAnswered</th><th>string?</th><th>回答メモ</th>
</tr>
<tr>
<th>createdAt</th><th>DateTime</th><th>登録日時</th>
</tr>
<tr>
<th>updatedAt</th><th>DateTime</th><th>更新日時</th>
</tr>
</table>

---

- 📑 Resume（書類）

<table>
<tr>
<th>属性名</th><th>型</th><th>説明</th>
</tr>
<tr>
<th>id</th><th>UUID</th><th>識別子</th>
</tr>
<tr>
<th>userId</th><th>UUID</th><th>所有ユーザー</th>
</tr>
<tr>
<th>type</th><th>enum</th><th>RESUME / CV / PORTFOLIO など</th>
</tr>
<tr>
<th>filename</th><th>string</th><th>ファイル名</th>
</tr>
<tr>
<th>version</th><th>string?</th><th>バージョン (v1.0, 企業A提出用 など)</th>
</tr>
<tr>
<th>storageUrl</th><th>string</th><th>保存先 URL</th>
</tr>
<tr>
<th>uploadedAt</th><th>DateTime</th><th>アップロード日時</th>
</tr>
<tr>
<th>notes</th><th>string?</th><th>補足メモ</th>
</tr>
<tr>
<th>createdAt</th><th>DateTime</th><th>登録日時</th>
</tr>
<tr>
<th>updatedAt</th><th>DateTime</th><th>更新日時</th>
</tr>
</table>

---

- ✅ Task（タスク）

<table>
<tr>
<th>属性名</th><th>型</th><th>説明</th>
</tr>
<tr>
<th>id</th><th>UUID</th><th>識別子</th>
</tr>
<tr>
<th>userId</th><th>UUID</th><th>所有ユーザー</th>
</tr>
<tr>
<th>companyId</th><th>UUID?</th><th>関連企業ID</th>
</tr>
<tr>
<th>interviewId</th><th>UUID?</th><th>関連面接ID</th>
</tr>
<tr>
<th>title</th><th>string</th><th>タスク名</th>
</tr>
<tr>
<th>dueDate</th><th>Date?</th><th>期限</th>
</tr>
<tr>
<th>isCompleted</th><th>boolean</th><th>完了フラグ</th>
</tr>
<tr>
<th>notes</th><th>string?</th><th>補足メモ</th>
</tr>
<tr>
<th>createdAt</th><th>DateTime</th><th>登録日時</th>
</tr>
<tr>
<th>updatedAt</th><th>DateTime</th><th>更新日時</th>
</tr>
</table>

---

- 💡 値オブジェクト（Value Objects）

<table>
<tr>
<th>名称</th><th>説明</th>
</tr>
<tr>
<th>EmailAddress</th><th>RFCに準拠したアドレス表現・バリデーション</th>
</tr>
<tr>
<th>DateRange</th><th>開始・終了を持つ期間型（例：オファー受諾期限）</th>
</tr>
<tr>
<th>InterviewResult</th><th>PASS / FAIL / PENDING / UNDECIDED を型安全に扱う Enum</th>
</tr>
</table>

---

- 🔄 エンティティ間の関連（テキスト図）
```
User ────▶ Company (1:N)
User ────▶ Resume  (1:N)
User ────▶ Task    (1:N)

Company ────▶ Application (1:N)  ※Application採用時
Company ────▶ Interview   (1:N)
Company ────▶ Task        (0:N)

Application ────▶ Interview (1:N)
Interview ────▶ Task (0:N)  # 面接準備タスク
```

### 🔜 今後の検討
- イベントログ / アクティビティログ：企業ステータス変更や面接登録などを時系列で記録し、ダッシュボードに反映。
- タグ / ラベル機能：企業やタスクに自由タグを付与し、検索性を向上。
- スキーママイグレーションの自動化：Drizzle ORM の schema で型安全に管理。
- 連携サービス拡張：ATS や求人プラットフォーム API との統合。
