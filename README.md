# ISMS / ISO27001 LP

ISMS（ISO27001）取得支援LPです。

## PHP Contact Form

このLPのお問い合わせ送信は PHP で運用します。フォーム送信先は `contact.php` で、管理者通知メールと入力者向け自動返信メールを送信します。

公開ディレクトリに配置する主なファイル:

```text
index.html
contact.php
styles.css
script.js
img/
config/
  mail.php
```

### 設定手順

1. `config/mail.php` をベース設定として確認します。
2. 本番の実値は `config/mail.local.php` として配置します。
3. 設定ファイルを公開環境へ置く場合は、必要に応じて `config/.htaccess` などで直接アクセスを拒否します。
4. `index.html` と `contact.php` を同じ公開ディレクトリにアップロードします。

`config/mail.local.php` の例:

```php
<?php

return [
    'transport' => 'mail',
    'from_email' => 'no-reply@awai-consulting.co.jp',
    'to_email' => 'contact@awai-consulting.co.jp',
    'auto_reply_subject' => '【株式会社あわいコンサルティング】お問い合わせを受け付けました',
    'return_path' => 'no-reply@awai-consulting.co.jp',
];
```

Xserver の標準的な構成では、まず `mb_send_mail` を使うこの設定で動作確認してください。現状の実装は `mail` transport を前提にしています。

### 動作仕様

- 送信先は `contact.php`
- 管理者通知: `contact@awai-consulting.co.jp`
- 送信元: `no-reply@awai-consulting.co.jp`
- Reply-To: 入力者メールアドレス
- 自動返信件名: `【株式会社あわいコンサルティング】お問い合わせを受け付けました`
- POST 以外は拒否
- 必須チェック、メール形式チェック、ヘッダーインジェクション対策あり
- `Accept: application/json` の場合は JSON を返却
- 通常フォーム送信時は元ページへリダイレクトしてメッセージを表示
- ハニーポット `website` 項目で簡易スパム対策を実施

### Git 管理しないファイル

- `config/mail.local.php`

本番の認証情報や送信先を分ける場合は `config/mail.local.php` を使い、実際の認証情報は Git に含めないでください。

# デプロイ手順（Xserver / isms）

## 前提

- サーバー: Xserver
- 接続方法: SSH + scp
- 公開ディレクトリ:

```text
/home/utas/awai-consulting.co.jp/public_html/isms/
```

## 1. ローカルで作業ディレクトリへ移動

```powershell
cd C:\Users\wasab\Desktop\Project\awai\isms
```

## 2. デプロイ（ファイルアップロード）

```powershell
scp -P 10022 -r .\index.html .\contact.php .\styles.css .\script.js .\img .\config utas@sv8069.xserver.jp:/home/utas/awai-consulting.co.jp/public_html/isms/
```

## 3. サーバーにSSH接続

```powershell
ssh -p 10022 utas@sv8069.xserver.jp
```

## 4. ディレクトリへ移動

```bash
cd /home/utas/awai-consulting.co.jp/public_html/isms
```

## 5. パーミッション設定（必須）

```bash
chmod 755 img config
find img config -type f -exec chmod 644 {} \;
find . -maxdepth 1 -type f -exec chmod 644 {} \;
```

## 6. ブラウザ確認

```text
https://awai-consulting.co.jp/isms/
```

## 7. キャッシュクリア

- Windows: `Ctrl + F5`
- またはシークレットウィンドウ

## よくあるエラーと対処

### CSS / 画像が反映されない

パーミッション不足の可能性があります。

```bash
chmod 755 ディレクトリ
chmod 644 ファイル
```

### スタイルが古い

ブラウザキャッシュをクリアしてください。

```text
Ctrl + F5
```

### スタイル崩れ（サブディレクトリ）

パスを確認してください。

```html
<!-- NG -->
/styles.css

<!-- OK -->
./styles.css
styles.css
```

### 404エラー

`index.html` が公開ディレクトリに配置されているか確認してください。

## 注意事項

- `public_html` 直下は触らない（既存サイト破壊防止）
- 必要なファイルのみアップする
- `.env` や `.git` はアップしない
- `config/mail.local.php` を使う場合は本番環境だけに配置する

## ディレクトリ構成

```text
public_html/
└── isms/
    ├── index.html
    ├── contact.php
    ├── styles.css
    ├── script.js
    ├── img/
    └── config/
```

## 補足

- scpは「差分」ではなく「上書き」
- 毎回必要なファイルは再アップすること

## 結論

- デプロイ = scp + 権限設定
- 問題の8割は「パーミッション or キャッシュ」
- サブディレクトリではパスに注意
