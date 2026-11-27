# 決定的な実行例

2026-11-27に `npm run research:cycle` で生成した出力です。LLMの研究出力ではありません。

- `finite-search/summary.json`: 2・3元MV/Gödel鎖の全様相表62候補、NK4の14モデルの結果。
- `finite-search/certificates/`: 演算表と全ガード状態付き項関数DAG。
- `hierarchy/hierarchy.mmd`: 受理済みの定義上の関係。
- `hierarchy/research-leads.mmd`: 未監査・未解決の候補も含めた図。
- `hierarchy/contradictions.json`: 有限モデルで判定できた範囲での規則の矛盾検査。

```powershell
node scripts/experiments.mjs verify research/examples/finite-search/certificates/mv-2-box-01.json
```

27件の組み合わせ上の分離が記録されていますが、独立した27件の新定理や新規成果を意味しません。同じ証人による自明な分離も含みます。全有限RAMS、無限構造、gTFPP、距離的原理は判定していません。

再生成したファイルは `research/generated/` に保存されます。ここに置いた例を自動で上書きしません。
