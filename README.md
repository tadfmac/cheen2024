# cheen2024

![ちーん](./www/img/title-icon.png)

10年ぶりの「ちーん」のソースコードです。

## demo

[ちーん2024](https://wtapp.4191333.xyz:4444)

## 起動方法

### 1. SSL証明書の準備

本アプリケーションはHTTP3 WebTransportによる通信を行うため、SSL証明書が必須です。
certbot あるいは mkcert などで証明書を準備してください。

証明書のpathは、`config.mjs` に設定してください。

### 2. `/config.mjs` の作成

`/config-example.mjs` を参考に、デプロイ環境に合わせたファイル作成をお願いします。

### 3. フォントのダウンロードと配置

フォントは2次配布不可のため、下記サイトより入手してご利用ください。
http://hp.vector.co.jp/authors/VA039499/

「ふい字　v2.9」をダウンロード後、圧縮ファイルを解凍の上、`www/HuiFont29/HuiFont29.ttf`に配置してください。

フォントの利用規約を配布元でご確認の上ご利用をお願いします。

### 4. 依存関係のインストール

```
cd cheen-2024
npm i
```

### 5. 起動

```
node ./app.mjs
```

## ライセンス

MIT (フォント以外)

