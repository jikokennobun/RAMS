# RAMS

RAMS（剰余付き抽象的様相構造）の不動点原理・Löb型原理・距離的原理を研究するための専用リポジトリです。

研究課題 → 証明・反例探索 → 独立した監査 → 台帳更新 → 論文・スライド、という手順を再現可能にします。共有チャット由来の数学的主張は、原稿と証明の確認が済むまで `pending` です。

## 使い始める

Node.js 22以上を使用します。外部npm依存やAPIキーは不要です。

```powershell
npm run verify
npm run research:cycle
npm run research:status
npm run research:plan AUTO-001
```

`cycle` は有限モデル探索・独立した証明書検査・階層図生成を実行します。`plan` は研究プロンプトを生成します。LLMによる研究は、ログイン済みCodex CLIで次を実行します。

```powershell
node scripts/research-system.mjs run --task AUTO-001 --timeout-seconds 600
```

発見→反例探索→監査を新しい3セッションで実行し、候補をpendingの受信台帳に集約します。各段階に時間・出力量の上限があり、中断後はハッシュを確認して再開できます。Codexの利用枠を消費します。定期実行・自動pushは設定していません。

詳細な使い方、8課題の研究プログラム、停止・再開と数学的な限界は [自動研究システムの説明](docs/automatic-research.md) を参照してください。従来の `npm run plan -- RAMS-Q001` と `scripts/run-research.ps1` も利用できます。

## 構成

| 場所 | 内容 |
| --- | --- |
| `AGENTS.md` | AI研究時の恒久的な指示 |
| `research/definitions.md` | 仮の記号規約と原稿で要確認の定義 |
| `data/sources.json` | 出典・取得状況 |
| `data/claims.json` | 仮定・証明状態・証拠を含む主張台帳 |
| `data/tasks.json` | 優先順位と依存関係を持つ研究キュー |
| `data/research-program.json` | 自動研究用の8課題・実行上限 |
| `data/hierarchy.json` | 原理・複数前提の含意・追加仮定・証明状態 |
| `models/` | 全演算表を持つ有限モデル |
| `scripts/finite-model.mjs` | 剰余律・N/K/4・項関数閉包の検証器 |
| `scripts/certificate.mjs` | 別実装による演算表・項DAG・閉包証明書の再検証 |
| `scripts/research-system.mjs` | 課題選択・3段階研究・停止再開・候補台帳 |
| `docs/workflow.md` | 発見から監査・採用までの手順 |
| `references/originals/` | 原稿・過去発表・共有資料の原本 |
| `research/reports/` | 証明・反例・監査レポート |
| `slides/`, `paper/` | 今後の発表・論文の出力先 |

## 現時点でできること

- 出典・課題・主張台帳の参照整合性と状態チェック。
- 演算表で指定された有限の有界整可換剰余束の網羅的検査。
- 全元をパラメータに許した一変数のガード付き項関数の閉包と、存在・一意性の全数検査（指定上限内で閉包が完了した場合）。
- Codex用の課題別プロンプト生成と、1課題ずつのローカル研究実行。
- 複数前提と追加仮定を保つ階層閉包・Mermaid図生成。未監査の矢印は導出から除外。
- 2元・3元MV/Gödel鎖の全様相表62候補を列挙し、NK4の14モデルを独立再検証。
- 発見・反例探索・監査の上限付き実行、プロンプト・入力・段階記録・pending受信台帳。
- push/PR時の決定的なGitHub Actions検査。

`models/` の二元Boolean代数と三元MV鎖は検証器の動作例です。RAMSの新規な分離定理ではありません。gTFPPの一様な項選択、無限代数、文献上の新規性はこの検証器では判定しません。

## 最初の課題

1. 原稿・研究総覧・以前のTeX/PDFを集約し、正確な定義を確定する。
2. AMCから超距離性が従うという主張を、Mal'cev項と必要仮定まで明示して検証する。
3. 合同塔と適合完備超距離の対応を、添字・全射性・様相条件を含めて監査する。
4. Mix/局所吸収やMV反例を精査し、採用可能な成果を選ぶ。

資料の取得範囲は `references/shared-chats.md` に記録しています。添付資料は未取得です。原本の定義に依存するgTFPP⇒gUとMix崩壊は保留し、一般代数・距離論として仮定を明示できる6課題から実行できます。
