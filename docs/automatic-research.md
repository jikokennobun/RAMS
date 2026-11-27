# 不動点階層の自動研究システム

このシステムは共有チャットS001〜S003の研究案を8課題に分け、有限モデル探索・階層計算と、Codexの発見・反例探索・監査をつなぎます。既存の正式原稿を取得済みとは仮定しません。

## 起動

Node.js 22以上。npmパッケージの追加インストールは不要です。LLMを使う場合のみ、ログイン済みCodex CLIが必要です。

```powershell
npm run verify
npm run research:cycle
npm run research:status
npm run research:plan AUTO-001
node scripts/research-system.mjs run --task AUTO-001 --timeout-seconds 600
```

`cycle` は有限探索・証明書再検証・階層図生成を行い、LLM利用枠を消費しません。`plan` はプロンプト生成だけです。`run` は課題ごとに最大3回、ログイン済みCodexを新しいセッションで呼び出します。各段階600秒、既定は1課題です。

```powershell
node scripts/research-system.mjs run --max-tasks 2 --timeout-seconds 300
```

課題を指定しない場合は、原本要件と依存関係を満たす未実行の課題を優先順に選びます。上限は20課題・各段階3600秒です。以前に失敗・保留になった同じ課題を自動で延々と繰り返しません。再試行は `--task` で指定します。

## 研究段階

1. discovery: 仮定を固定し、証明・一般化を構築。
2. counterexample: 前段階を積極的に反証。有限の証人・無限構造の障害・量化順序を点検。
3. audit: 定義から独立に再構成し、必要な仮定・証明の飛躍・未取得資料を点検。

各段階はread-onlyの別Codexプロセスです。前段階のレポートは証拠として受け渡し、継続会話のモデル状態は使いません。同一モデルの別セッションによる監査であり、外部の独立した数学者や形式証明カーネルによる保証とは区別します。blockedならその場で停止します。

実行記録は `research/runs/automatic/run-.../` に保存します。

- `manifest.json`: 段階・停止状態・文脈/実験のSHA-256。
- `context.json`, `experiments.json`: 実行に渡した入力のスナップショット。
- 各役割の `*-prompt.md`, `.json`, `.md`, `*-events.jsonl`。
- `proposals.json`: 全件pendingの研究候補。
- `summary.md`: 実行概要と残課題。

`research/generated/inbox.json` は全実行の候補を集約し、`status.md` は進捗を表示します。これらは自動生成・ローカル保存です。台帳の `proved` や階層の `audited` には自動昇格しません。候補の採用時は、証明・監査の本文と原本定義を確認して `data/claims.json` / `data/hierarchy.json` に反映します。

## 中断・再開

```powershell
node scripts/research-system.mjs run --resume run-XXXXXXXX --timeout-seconds 600
```

実際のrun IDを使ってください。失敗・timeoutの実行は完了済み段階を再利用し、次の段階から再開します。入力文脈・実験結果・保存済み段階のハッシュが変化していたら停止します。完了済み・blockedの実行には上書きしません。各プロセスのログ量にも上限があります。

同時実行は `.research.lock` で防ぎます。OS強制終了でlockが残った場合は、manifestとlock内のPIDを確認し、実行が終了したことを確認してそのlockファイルだけを削除してください。自動で生存中の実行を奪いません。

## 階層の計算

```powershell
node scripts/hierarchy.mjs --seed=gFPP,gU --assume=N,K,4
```

`data/hierarchy.json` は原理・前提・追加仮定・証明状態を別フィールドで保存します。閉包計算には `definition` と `audited` だけを使います。現在受理されているのは存在・一意性・一意存在の定義上の関係3件です。S001〜S003の数学的提案はpending/openです。

`research/generated/hierarchy.mmd` は受理済みの関係、`research-leads.mmd` は破線で候補も含む図です。複数前提をANDノードで表示し、`gFPP` 単独から `gUFPP` が従うような誤った図を作りません。追加仮定は同じ閉包内で導出されたものも使えます。全ての導出に使った規則IDを記録します。

`contradictions.json` は、独立検査済みの有限モデルと受理済み規則の衝突を報告します。受理済み規則に反例があれば `cycle` は失敗します。未対応の原理は未判定に残し、反例がないことを証明とは扱いません。

## 有限モデルと独立した証明書検査

```powershell
npm run experiments
npm run certificate -- research/generated/experiments/certificates/mv-2-box-11.json
```

既定探索は2・3元MV/Gödel鎖に全様相表を載せた62候補です。全有限代数の列挙ではありません。NK4を満たす候補だけで全元パラメータ付きの一変数ガード項関数を飽和させます。関数数・時間上限で打ち切ったものはincompleteとして記録します。

探索器と別の評価器が、順序の推移性・上下限の普遍性・剰余の最大解・単調性・モノイド則を検査します。項DAGから値とガード状態を再計算し、全二項演算・boxへの閉性を確認してから、存在・一意性を認証します。証明書の不正・閉包の欠落・改ざんはエラーです。

研究段階へ過去の実験結果を渡す際にも証明書を再検査し、保存されたサマリーとの一致を確認します。単なる古いJSONの値を無条件で利用しません。

SC、FLob、Lob、IA_boxは `hierarchy.json` の作業用定式化でのみ計算します。gTFPP、gUTFPP、距離の存在、Mix、sLobは未対応であり、falseと取り違えません。無限有理構造の完備性や新規性を有限検査から結論しません。

## 未取得原本に依存する課題

AUTO-001〜006は仮定を本文に明示する独立した数学的課題です。元のRAMSへの適用は別途照合します。AUTO-007（gTFPP⇒gU）と008（Mix崩壊）は `needs_originals` により実行対象から除外しています。正式定義の証拠と監査を揃えて課題レコードをレビュー改訂してから実行してください。原本ディレクトリに何か置くだけでは解除しません。

## 運用

定期スケジュール・自動pushは設定していません。GitHub CIは決定的なテストのみです。日次実行を必要とする場合は、この単発runコマンドを実行する頻度・課題数・時間上限を設定します。利用枠を消費する処理を無期限のループにはしません。
