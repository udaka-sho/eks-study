# EKS on Fargateでサンプルアプリを建てるまでの手順

## 1.クラスター生成
- `eksctl create cluster --name uda-cluster --region ap-northeast-1 --fargate`

## 2.ALB Ingress Controllerの生成
### IAM OIDC プロバイダーを作成
- `eksctl utils associate-iam-oidc-provider --cluster uda-cluster --approve`
### ALB Ingress Controller ポッド用の IAM ポリシーをダウンロード
- `curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/iam-policy.json`
### ダウンロードしたポリシー <ALBIngressControllerIAMPolicy> を使用して、IAM ポリシーを作成
- `aws iam create-policy --policy-name ALBIngressControllerIAMPolicy --policy-document file://iam-policy.json`
### alb-ingress-controller という名前の Kubernetes サービスアカウントを kube-system 名前空間に作成。さらに、クラスターロールと ALB Ingress Controller で使用するクラスターロールバインディングを作成
- `kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/rbac-role.yaml`
### IAM ALB Ingress Controllerのロールを選択し、前のステップで作成したサービスアカウントにロールをアタッチ
- `eksctl create iamserviceaccount --name alb-ingress-controller --namespace kube-system --cluster uda-cluster --attach-policy-arn arn:aws:iam::946701551755:policy/ALBIngressControllerIAMPolicy --override-existing-serviceaccounts --approve`
### ALB Ingress Controller をデプロイ
- `kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/aws-alb-ingress-controller/v1.1.8/docs/examples/alb-ingress-controller.yaml`
### ALB Ingress Controller のデプロイマニフェストを編集のために開く
- `kubectl edit deployment.apps/alb-ingress-controller -n kube-system`
#### --ingress-class=alb 行の後にクラスター名の行を追加します。Fargate で ALB Ingress Controller を実行している場合は、VPC ID の行と、クラスターの AWS リージョン名も追加する必要があります。適切な行を追加したら、ファイルを保存して閉じます。
```
spec:
      containers:
      - args:
        - --ingress-class=alb
        - --cluster-name=uda-cluster
        - --aws-vpc-id=vpc-07763d50fcd36e596
        - --aws-region=ap-northeast-1
```
### ALB Ingress Controller が実行されていることを確認
- `kubectl get pods -n kube-system`

## 3.サンプルアプリのデプロイ
### イメージはデプロイ対象のアプリケーションとタグを正しく指定すること
`946701551755.dkr.ecr.ap-northeast-1.amazonaws.com/test/docker-test:v1`
### deployment_react.yamlの作成
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react
  namespace: "default"
  labels:
    app: front
    env: dev
spec:
  replicas: 1
  selector:
    matchLabels:
      app: react
  template:
    metadata:
      labels:
        app: react
    spec:
      containers:
      - name: react-container
        imagePullPolicy: Always
        image: 946701551755.dkr.ecr.ap-northeast-1.amazonaws.com/test/docker-test:v1
        ports:
          - containerPort: 3000
```
### サンプルアプリのデプロイ
- `kubectl apply -f deployment_react.yml`
### デプロイの完了を確認
podがRunningになっているかを確認
- `kubectl get pods`
### service.yamlの作成
```
apiVersion: v1
kind: Service
metadata:
  name: web-service
  namespace: "default"
spec:
  type: NodePort
  selector:
    app: react
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
```
### サービスをデプロイ
- `kubectl apply -f service.yaml`
### サービスの確認
作成したサービス名のNodePortが存在するか確認する
- `kubectl get service`
### サンプルアプリケーションのサービスを外部と通信できるようにする（ingress-http.yamlの作成）
```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: "test-app-ingress"
  namespace: "default"
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
  labels:
    app: test-app-ingress
  spec:
    rules:
      - http:
          paths:
            - path: /*
              backend:
                serviceName: "web-service"
                servicePort: 80
```
### ingressを作成
- `kubectl apply -f ingress-http.yaml`
### ALBのURLを確認
- `kubectl get ingress test-app-ingress`

## 動作確認
ALBのURLをブラウザに入力しReactの画面が出ればOK