# 定義の作業用メモ

状態: S005（v11原文§1.1–1.2、N11-01–06）とS004の著者メモに照合済み。定義の照合であり、各定理の独立監査ではありません。変更点と参照箇所は research/reports/v11-definitions-review.md に記録しました。

プロファイル `working-bicrl-v1` の既存署名・剰余の向き・ガードの意味は一致しているためIDを保持します。以下の定義はこの署名に固定し、弱い言語や非可換構造へ拡張しません。

有限検証器は `(A, meet, join, product, residual, bottom, top, box)` を扱います。
- `a <= b` iff `meet(a,b)=a`。
- `product` は可換結合的で単位元は `top`（整性）。
- `product(a,b) <= c` iff `b <= residual(a,c)`。
- `bottom` と `top` はそれぞれ最小元と最大元。
- N: `box(top)=top`。
- K: `box(a -> b) <= (box(a) -> box(b))`。
- 4: `box(a) <= box(box(a))`。

ガード付きとは、対象変数 `x` の全出現が `box` の内側にあること。`x` が出現しない項も許します。有限検証では各元を定数パラメータとして使用し、非様相の二項演算と `box` で閉包を取ります。

`gFPP` は各ガード付き一変数項に少なくとも1つの解、`gU` は高々1つの解、`gUFPP` はちょうど1つの解として、ここでの有限インスタンスを報告します。全元パラメータを許すこの検査は、パラメータから一様な解項を選ぶ `gTFPP` を判定しません。

## 原本で確認した原理

- M: boxの単調性。C: box(x) product box(y) <= box(x product y)。
- Mix: box(x) <= box(x) product box(box(x))。
- Abs: x <= x product box(x)。CP: x <= box(x)。Ctr: x <= x product x。Ctr_box: box(x) <= box(x) product box(x)。
- SC: forall a exists p: p=(box(p) -> a)。Lob: forall a, box(a)<=a implies a=1。
- FLob: forall a, box(box(a)->a)<=box(a)。sLob: forall a, (box(a)->a)<=a。
- IA_box: forall x, box(x product box(x))=box(x)。

これらの全ての元変数はAの全域を走ります。NK4はN,K,4、GammaはNK4+Lobです。Gamma上の主張をNK4全体へ広げません。

## gTFPPの量化と連立系

単一の代数Aについて、各有限のガード付き構文項 t(p,a_1,...,a_m) に対し、同じ署名 meet,join,product,residual,0,1,box の p-free 項 s_t(a_1,...,a_m) が存在し、全てのパラメータ値について t(s_t(a),a)=s_t(a) が成立することをgTFPPとします。選択項に任意の元を新たな名前付き定数として追加しません。gUTFPP=gTFPP and gUです。

クラスCに対して一つの選択項を全A in Cに共通に要求する強化は、各AについてのgTFPPと量化順序が異なります。本システムは単一代数版を基準とし、クラス一様版を無断で同一視しません。

F^kappa/UF^kappa/TF^kappaは未知変数がkappa個の有限支持連立系で、各方程式右辺は有限項です。出現回数・ガード深度を制限するF_{k,h}とは別の名前空間です。

## 距離・合同塔

MC: A上に完備な分離的距離dと一様係数0<=q<1が存在し、boxがq縮小。uMCは超距離を要求。AMCはさらに全非様相基本演算が積のmax距離について1-Lipschitz。uAMCはその超距離版。bは距離の有界性を加えます。q=0や自明代数も除外しません。

CongruenceTower: A^-上の合同降鎖theta_0=nabla、交わりDelta、boxによる一段深化、標準写像 A -> lim A^-/theta_n の全単射性を満たす「ある塔」が存在すること。正準Phi塔 Phi(theta)=Cg_{A^-}{(box(x),box(y)):(x,y) in theta} の分離PhiSep・逆極限完備PhiCompとは区別します。

v11はAMC/uAMC/bAMC/buAMCの同値をN11-01で証明したと記録しています。本リポジトリではsource_status=proved-in-note、独立監査待ちです。AMC⇒PhiCompはv11でも未証明、gTFPP⇒gUは未解決として保持します。
