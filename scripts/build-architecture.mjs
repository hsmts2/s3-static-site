import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const icon = async (name) => {
  const bytes = await fs.readFile(path.join(root, 'assets', 'icons', name));
  return `data:image/svg+xml;base64,${bytes.toString('base64')}`;
};

const icons = {
  aws: await icon('aws-cloud.svg'),
  viewer: await icon('viewer.svg'),
  cloudfront: await icon('cloudfront.svg'),
  cloudformation: await icon('cloudformation.svg'),
  s3: await icon('s3-bucket.svg'),
};

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">
  <title id="title">非公開S3とCloudFront OACによる静的ウェブサイト構成</title>
  <desc id="desc">閲覧者はHTTPSでCloudFrontへ接続。CloudFrontはOACで署名して非公開S3の静的ファイルを取得する。CloudFormationは各リソースを作成し、サイトファイルは別途S3へ配置する。</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1L11 6L1 11" fill="none" stroke="#29384d" stroke-width="2"/></marker>
    <marker id="arrow-dashed" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M1 1L11 6L1 11" fill="none" stroke="#75839a" stroke-width="2"/></marker>
    <style>
      text { font-family: Arial, 'Yu Gothic', sans-serif; fill:#1d2734; }
      .title { font-size:35px; font-weight:700; }
      .group { font-size:25px; font-weight:700; }
      .label { font-size:26px; font-weight:700; }
      .detail { font-size:20px; }
      .line-label { font-size:20px; font-weight:700; }
      .note { font-size:18px; fill:#4d5b6e; }
      .flow { fill:none; stroke:#29384d; stroke-width:4; marker-end:url(#arrow); }
      .manage { fill:none; stroke:#75839a; stroke-width:3; stroke-dasharray:11 9; marker-end:url(#arrow-dashed); }
    </style>
  </defs>
  <rect width="1600" height="900" fill="#fff"/>
  <text x="72" y="88" class="title">S3 + CloudFront 静的ウェブサイト</text>
  <text x="72" y="126" class="note">CloudFormationで構築する公開用HTTPSサイト。S3バケットは非公開。</text>

  <rect x="355" y="175" width="1168" height="480" rx="6" fill="#fff" stroke="#475569" stroke-width="3"/>
  <image x="355" y="175" width="75" height="75" href="${icons.aws}" xlink:href="${icons.aws}"/>
  <text x="447" y="224" class="group">AWS Cloud</text>

  <image x="98" y="298" width="76" height="76" href="${icons.viewer}" xlink:href="${icons.viewer}"/>
  <text x="86" y="413" class="label">閲覧者</text>
  <text x="86" y="449" class="detail">ブラウザ</text>

  <image x="569" y="321" width="116" height="116" href="${icons.cloudfront}" xlink:href="${icons.cloudfront}"/>
  <text x="515" y="489" class="label">Amazon CloudFront</text>
  <text x="545" y="523" class="detail">標準ドメインで配信</text>

  <rect x="1085" y="286" width="350" height="284" rx="6" fill="#f6f9f3" stroke="#7aa116" stroke-width="3"/>
  <image x="1217" y="318" width="88" height="88" href="${icons.s3}" xlink:href="${icons.s3}"/>
  <text x="1195" y="452" class="label">Amazon S3</text>
  <text x="1146" y="488" class="detail">非公開バケット</text>
  <text x="1122" y="522" class="detail">Block Public Access: 有効</text>

  <path d="M258 404H538" class="flow"/>
  <text x="342" y="379" class="line-label">HTTPS</text>
  <path d="M740 404H1055" class="flow"/>
  <text x="837" y="362" class="line-label">OACで署名</text>
  <text x="808" y="389" class="detail">S3:GetObjectのみ</text>

  <image x="451" y="688" width="76" height="76" href="${icons.cloudformation}" xlink:href="${icons.cloudformation}"/>
  <text x="547" y="735" class="label">AWS CloudFormation</text>
  <text x="547" y="768" class="detail">バケット・配信・OAC・ポリシーを作成</text>
  <path d="M480 675V567H627V545" class="manage"/>
  <path d="M866 720H1260V595" class="manage"/>

  <text x="1118" y="744" class="detail">site/ のHTML・CSS</text>
  <text x="1118" y="773" class="note">デプロイ後、別手順でアップロード</text>
  <path d="M1295 690V587" class="manage"/>

  <text x="72" y="857" class="note">OACはS3への直接アクセスを制限します。CloudFront URLの閲覧者認証は、この構成に含みません。</text>
</svg>`;

const output = path.join(root, 'docs', 'architecture.svg');
await fs.writeFile(output, svg, 'utf8');
console.log(output);
