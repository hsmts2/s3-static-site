# S3 + CloudFront 静的ウェブサイト（CloudFormation）

非公開のAmazon S3バケットをオリジンにし、Amazon CloudFrontからHTTPSで静的ファイルを配信する構成例です。CloudFormationで基盤を作成し、HTML・CSSは別手順で配置します。

![非公開S3とCloudFront OACの構成図](docs/architecture.png)

編集可能な構成図：[PowerPoint](docs/architecture.pptx)／[SVG](docs/architecture.svg)

## 構成と公開範囲

閲覧者からCloudFrontへはHTTPSで接続します。CloudFrontはOrigin Access Control（OAC）で署名したリクエストをS3へ送り、バケットポリシーはこのDistributionからの読み取りだけを許可します。S3の4種類のBlock Public Accessはすべて有効です。

この構成では、**S3の静的ウェブサイトエンドポイントや`WebsiteConfiguration`は使用しません**。OACは通常のS3バケットオリジンで使用する機能です。また、OACはS3への直接アクセスを防ぎますが、CloudFrontのURLを知る閲覧者を認証する機能ではありません。サンプルサイトは一般公開を前提とし、秘密情報を配置しないでください。

CloudFrontの標準ドメイン（`*.cloudfront.net`）を使用し、独自ドメイン・Route 53・ACM証明書・閲覧者認証は初版の対象外です。

## 作成するリソース

| リソース | 主な設定 |
| --- | --- |
| S3バケット | 自動生成名、非公開、Block Public Accessをすべて有効、ACL無効、SSE-S3、削除時は保持 |
| CloudFront OAC | S3オリジン向け、SigV4で常に署名 |
| CloudFront Distribution | HTTPSへリダイレクト、`index.html`を既定ルート、GET/HEADのみ、`error.html`を404に使用 |
| S3バケットポリシー | 対象Distributionの`AWS:SourceArn`を条件に`GetObject`だけ許可、非TLS通信を拒否 |
| CloudFront Cache Policy | Cookie・クエリ文字列・任意ヘッダーをキャッシュキーへ含めない、短めのTTL |

## 前提条件

- AWS CLI v2を使用でき、対象アカウント／リージョンを確認できること
- CloudFormation、S3、CloudFrontリソースを作成できるIAM権限があること
- 配置する`site/`に個人情報、認証情報、顧客情報を含めないこと
- S3、CloudFront、データ転送などの料金が発生し得ることを理解していること

## デプロイ

PowerShellの例です。`<REGION>`にはCloudFormationとS3バケットを作成するリージョンを指定します。CloudFront自体はグローバルなサービスです。

```powershell
aws sts get-caller-identity
aws cloudformation validate-template --template-body file://templates/secure-site.yaml --region <REGION>
aws cloudformation deploy --template-file templates/secure-site.yaml --stack-name s3-static-site-lab --parameter-overrides ProjectName=s3-static-site-lab --region <REGION>
```

スタックが`CREATE_COMPLETE`となったら、Outputsから`BucketName`、`DistributionId`、`SiteUrl`を取得します。`BucketName`を実際の出力値へ置き換えて、公開専用のファイルだけをアップロードします。初回は`--delete`を付けません。

```powershell
aws s3 sync site/ s3://<BUCKET_NAME>/ --region <REGION>
```

CloudFrontの反映後に`SiteUrl`へアクセスします。`index.html`が表示され、存在しないパスでは`error.html`とHTTP 404が返ることを確認します。更新直後に旧内容が残る場合は、キャッシュのTTL経過を待つか、対象DistributionでInvalidationを実行します。

## セキュリティ確認

1. S3バケットのBlock Public Accessが4項目とも有効であることを確認する。
2. バケットポリシーの読み取り許可がCloudFrontサービスプリンシパルと対象Distributionに限定されていることを確認する。
3. S3オブジェクトのURLへ匿名で直接アクセスしても取得できないことを確認する。
4. CloudFrontのHTTP URLがHTTPSへリダイレクトされることを確認する。

## 後片付け

S3バケットには`DeletionPolicy: Retain`を設定しています。スタック削除後もバケットとアップロードしたファイルは残るため、対象バケット名・中身・料金を確認してください。削除する場合は、**このスタックが作成したバケットであることを再確認**してから、ファイルを空にし、残ったバケットを削除します。別用途のバケットを対象にしないでください。

## 公式資料

- [AWSアーキテクチャアイコン](https://aws.amazon.com/jp/architecture/icons/)：構成図のAWS Cloud、CloudFormation、CloudFront、S3アイコンに、ユーザー提供の`AWS-Architecture-Icons-Deck_For-Light-BG_01302026.pptx`を使用
- [CloudFrontからS3へのアクセスをOACで制限する](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [CloudFormationのS3バケット](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-s3-bucket.html)
