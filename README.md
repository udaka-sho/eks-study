# eks-study

## ディレクトリ/ファイル説明

### Expressディレクトリ
- ExpressのサンプルコードとExpressが動くコンテナを建てるDockerfileを格納している
### k8sディレクトリ
- ReactとExpressのサンプルアプリをDockerイメージからKubernetesでクラスターにデプロイするためのマニフェストファイルを格納している
### Reactディレクトリ
- ReactのサンプルコードとReactが動くコンテナを建てるDockerfileを格納している
### docker-compose.ymlファイル
- ReactとExpressのサンプルアプリをdocker-composeコマンドで建てるためのファイル

## 使い方手順

### 1.docker-composeからの動作確認
- `docker-compose build`でdockerfileからイメージを作成する
- `docker-compose up -d`でReactとExpressのコンテナを建てる
- ブラウザに`localhost:3000`でReactの画面が表示されるか確認
- 表示された画面内の`テストAPIはここをクリック`リンクをクリックして、新規タブで`HelloWorld`と画面表示されるか確認（ReactコンテナからExpressコンテナに接続できているかの確認）
- `docker-compose down`で先ほど建てたコンテナをすべて落とす（お片付け）
### 2.kubectlからの動作確認
- `kubectl apply -f k8s`でクラスターへのアプリデプロイを行う
- ブラウザに`localhost`でReactの画面が表示されるか確認
- 表示された画面内の`テストAPIはここをクリック`リンクをクリックして、新規タブで`HelloWorld`と画面表示されるか確認（ReactコンテナからExpressコンテナに接続できているかの確認）**まだできていない**
- `kubectl delete -f k8s`でクラスターからアプリなどを削除する（お片付け）