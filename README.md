# 字幕ビューア
英語字幕データを単語検索が行いやすいように表示する

英辞郎などの検索用プラグインを使って素早く検索ができる
https://chrome.google.com/webstore/detail/%E9%80%9F%E8%A8%B3%EF%BC%81%E8%8B%B1%E8%BE%9E%E9%83%8E%C2%AE%E8%8B%B1%E5%92%8C%E8%BE%9E%E6%9B%B8/mkbgdfopfbhcdnoccicgpcpgghhkgocf?hl=ja

いまのところこのへんに対応
- Youtube動画の字幕
- SRT形式の字幕データ

## 実行環境
### Go
http://golang-jp.org/doc/install
1.7系
適当なところをGOPATHとして登録しておく

### ビルド
```bash
cd ${PROJECT_PATH}
make setup build
```

### 起動
```bash
./subtitle
```

## 開発環境
### IntelliJ
https://www.jetbrains.com/idea/
