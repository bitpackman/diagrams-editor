export interface DiagramTemplate {
  key: string;
  name: string;
  description: string;
  mermaid: string;
}

export const TEMPLATES: DiagramTemplate[] = [
  {
    key: 'onboarding',
    name: 'オンボーディングフロー',
    description: 'ユーザー登録からメール認証・アカウント作成までの流れ',
    mermaid: `flowchart LR
  start([開始<br/>トリガー]) --> signup[ユーザー登録<br/>アカウントを作成する]
  signup --> verify[メール認証<br/>認証リンクをクリック]
  verify --> check{メール<br/>認証OK?}
  check -->|はい| account[アカウント作成<br/>システムに登録される]
  check -->|いいえ| resend[メール再送信<br/>認証メールを再送する]
  resend -.-> verify
  account --> crm[(CRM同期<br/>データを同期する)]
  crm --> welcome[ウェルカムメール<br/>案内メールを送信]
  welcome ==> done([完了<br/>オンボーディング終了])`,
  },
  {
    key: 'approval',
    name: '承認フロー',
    description: '申請から承認・差し戻しまでの社内フロー',
    mermaid: `flowchart TD
  apply[申請<br/>申請書を提出] --> review[上長レビュー<br/>内容を確認する]
  review --> ok{承認する?}
  ok -->|承認| exec[処理実行<br/>申請内容を実行]
  ok -->|差し戻し| fix[修正対応<br/>指摘事項を修正]
  fix -.-> apply
  exec --> record[(記録保存)]
  record --> done([完了])`,
  },
  {
    key: 'simple',
    name: 'シンプルフロー',
    description: '開始→処理→終了の最小構成',
    mermaid: `flowchart TD
  a([開始]) --> b[処理]
  b --> c([終了])`,
  },
];
