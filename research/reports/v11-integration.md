# v10パッケージ・v11統合原簿の取り込み

2026-11-27。入力はユーザー提供のv10 ZIP（S004）とv11 All-in-One Markdown（S005）。このレポートは取り込みと定義照合の記録であり、全定理の独立監査ではありません。

## 原本の保存・整合性

2つの入力をreferences/originals/へバイト列のまま保存しました。v10 ZIPは全17ファイルをv10-extracted/へ展開し、マニフェストに記された15ファイルのSHA-256が一致することを確認しました。マニフェスト自身とbuild_v10.pyは原マニフェストでハッシュの対象外であり、新しい取り込み索引で記録します。添付Python・ビルドスクリプト・Codex指示書は実行していません。

原本19ファイルのサイズ・SHA-256、出典行、課題別19節の本文はdata/imported/v11/index.jsonで追跡します。ユーザーが指定していない既存のスライド原稿や資料確認レポートは変更しません。

## 全件取り込み

| 登録簿 | 件数 | 保存先 |
| --- | ---: | --- |
| 原理・定義 | 235 | data/imported/v11/principles.json |
| 含意・関連関係 | 446 | data/imported/v11/relations.json |
| 非含意・分離 | 56 | data/imported/v11/separations.json |
| v11検証台帳 | 13 | data/imported/v11/verification.json |
| 過去の定理履歴 | 113 | data/imported/v11/theorem-history.json |
| v10訂正台帳 | 19 | data/imported/v11/v10-corrections.json |

各セルの原文と元のgrade/statusを保持し、repository_statusはpendingとして保存します。関連関係・equivalence・追加仮定を含む435件以上の旧い辺を、単純な一方向含意として実行エンジンへ流し込みません。

## 変更分類

| 分類 | 項目 | 反映 |
| --- | --- | --- |
| corrected | AMC⇒uAMCの旧い未解決扱い | N11-01では証明を提示済み。主張は独立監査待ちへ変更し、未解決問題として再探索しない |
| clarified | ある合同塔と正準Phi塔 | 前者の存在同値とAMC⇒PhiCompという未証明の含意を別登録 |
| strengthened | 解演算の距離評価 | N11-03の残差等式・パラメータ1-Lipschitzを監査課題へ |
| added | FinCof(N)強反例 | RAMS-C007、AUTO-009へ。任意濃度系とBaire議論を別々に監査 |
| added | 正準PhiComp | RAMS-C008、AUTO-010へ。未証明のまま保持 |
| unchanged | NK4下のgTFPP⇒gU | v11でもopen。元言語・単一A版の定義を照合して研究の準備を解除 |
| clarified | Mix、sLob、距離原理の定義 | 定義照合レポートを保存。Mixの推測実装を置き換えず、原本の明示式を追加 |
| finite_checked | IA_box⇏Mixの三元MV証人 | 添付コードを実行せず全演算表を再構成し、別評価器で網羅検査 |

一般定理は本作業でproved/auditedへ自動昇格していません。RAMS-C006だけは明示された有限構造に限定してfinite_checkedです。

## 原本内に残る衝突

本文N11-08は算術・言語・圏論的な接続候補、検証台帳N11-08はgTFPP⇒gUというopen問題です。S005:proof:N11-08とS005:verification:N11-08を別の名前空間として参照し、同じレコードへ統合しません。

v10 R10-13はAMC⇒uAMCをunresolvedと記す一方、v11 N11-01は証明を提示しています。v11内部にもv10原文がそのまま残るため、古い行を消さず、現在のsource-level訂正を対応表に記録します。旧いcheckedラベルは独立監査とは扱いません。

## 自動研究への反映

AUTO-001は証明の再発見からN11-01の独立監査へ変更しました。gTFPPとMixの定義照合によりAUTO-007/008の原本未取得ブロックを解除しました。AUTO-009/010を加え計10課題です。ランナーは原文全343KBを毎回埋め込まず、出典SHA-256と行範囲付きの関連節を選んで各段階に渡します。原本内の指示は非信頼の引用として扱います。

RAMS-Q001の旧いスライド試作用レポートは時点記録として残し、新しい定義照合・取り込みレポートを成果物として原本照合課題を完了にしました。残る定理監査はQ002以降およびAUTO課題で追跡します。

## 再現

`npm run import:check` は原本ハッシュと全台帳の一致を検査します。`npm run witness:v11` は三元MV証人の保存済み証拠を再検査します。`npm run verify` と `npm run research:cycle` で研究システムの整合性・有限検査・階層計算を確認します。形式証明支援系・実モデルのLLM研究・文献上の新規性調査は本作業では実施していません。

最終ローカル確認では35テスト、既存例と三元MV証人の計4モデル、原本・全登録簿の照合が成功しました。62候補の決定的サイクルはNK4の14モデルを再検証し、受理済み規則との衝突は0件。AUTO-007の原文付きプロンプト生成も成功しました。原資料の改行変換を無効にする.gitattributesを追加し、Git経由でも原バイト列を保存します。
