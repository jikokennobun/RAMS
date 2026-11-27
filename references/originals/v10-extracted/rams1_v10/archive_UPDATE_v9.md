# RAMS-1 v9.0 差分・証明ノート

改訂日：2026-10-29。基準：v8.0 Master（2026-10-29）。

**証明状態**：`E9-1–E9-4` はこの資料に自足的な論証を付けたが、査読や文献新規性調査済みを意味しない。元の227原理・435関係等は資料上の登録数であり証明済み数ではない。

## 変更概要

1. `gTFPP(A) ⇔ ∀B∈SP(A): gFPP(B) ⇔ ∀B∈HSP(A):gFPP(B)` を直接証明。SPgFPP の定義を修正。
2. `AMC + □1=1 ⇒ ⋁_n□^n0=1` を完全・順序完備性なしに強化。
3. `OrbCl_ω+Löb` から ω消尽、complete Heyting frame では uAMC を導く。
4. 有限系での cycle-guarded を、重み付き有向閉路の積 <1 に一般化。
5. `gTFPP⇒gU`／`AMC⇒uAMC` 等を未解決として保持。
6. v8 の旧版資料とCSVを全てZIPへ保存。

## 定理全文と証明

T-II.5、T-III.4a、T-III.4b、T-V.3a の詳細は [MASTER_v9.md](MASTER_v9.md) の対応節を参照。ここでは矢印の位置づけを記載する。

### 新しく認めてよい関係

- gTFPP ≡ Var_gFPP ≡ SPgFPP：追加仮定不要、証明は恒等式保存と相対自由代数。階層図では**一つの同値ノード**。
- AMC ⇒ ωExh：有界束と非拡大 ∧、N のみで成立（距離の完備性さえ不要）。
- N+M+Löb+OrbCl_ω ⇒ ωExh。
- `complete Heyting frame+NK+Löb+OrbCl_ω ⇒ uAMC`。
- max-Lipschitz の有限依存グラフが全閉路収縮 ⇒ 有限連立方程式唯一解。

### 追加しない関係

- gTFPP ⇒ gU / gUFPP（結論できないし、反例も未確認）。
- AMC ⇒ uAMC（bicRAMS 一般）。
- ωExh ⇒ AMC（非冪等 bicRAMS 一般）。
- 任意濃度の**cycle-guarded** 連立系唯一解（有限グラフの重み付けをそのまま拡張できない）。

### 文献照合

- Bessaga の逆縮小定理には全基本演算の非拡大性はない。
- Milius–Litak (2017) の guarded recursion に関する既知の Conway/Bekič 理論と、新たな有限系の重み付き縮小補題の新規性を比較する。
- Kumasaka–Kurahashi (2026) は APS 固有の次数指標。RAMS の F_{k,h} と単純同一視しない。