# MLG2026 スライド改訂記録

改訂後は本編41枚・補足31枚、計72枚。以下の「旧p」「旧A」は添付PDFの番号、「新p」は改訂版PDFの通し番号を指す。

## 指定箇所の反映

| 箇所 | 反映した内容 |
|---|---|
| 表紙 | 題目は維持。氏名・所属、第61回 MLG数理論理学研究集会、2026/10/25、神戸大学 六甲台第2キャンパスに更新 |
| 旧p20 → 新p20 | 「D1–D3 に対応する様相原理」。Nと必然化規則の対応を式で明記 |
| 旧p21 → 新p21 | 「K と M・C の関係」。M・Cの式、Nの下での同値性、KからMを得る証明を維持 |
| 旧p25・26 → 新p25 | APS誘導の必要十分条件RA1–RA4、代入による証明、縮約を使う十分条件と証明、Ctr_□の場合のA3′、G2・FG2への帰結を1枚に統合 |
| 旧p28 → 新p27 | 「これと二種類の不動点の存在を比較する」を削除 |
| 旧p29 → 新p28 | 「これらの仮定の下では、Gödel文やJeroslow文の存在を、補助元を量化しない不等式で特徴づけられる」に変更。仮定は定理に明記 |
| 旧p36 → 新p35 | 「Gödel 鎖における不動点の値」の崩れた見出しを修正 |
| 旧A9 → 新A7（p48） | 「全体の縮約」を「縮約」に変更。他のページでも同じ表記に統一 |
| 旧A11・12 → 新A9（p50） | 正規性の定義、M・Kとの関係、有限鎖の反例、縮約の下でのN・Kとの同値性を統合 |
| 旧A13・14 → 新A10（p51） | 最大下界の保存からMを得る議論、Boole・Heytingの演算、恒等様相の例、HeytingからAPSへの系と証明を統合 |
| 旧A15・16 → 新A11（p52） | Gödel積とŁukasiewicz積の比較、Gödel例の閉性・各様相原理・不動点・有限閉部分構造の不存在を統合 |
| 旧A26・27 → 新A20（p61） | FLöb_⊥ ⇒ Löb_⊥の証明と、逆を否定するKripke反例を統合 |
| 旧A28–30 → 新A21–23（p62–64） | 強いLöbを混合条件で定式化。強めた定理・証明・反例を掲載 |
| 旧A31–36 → 新A24–29（p65–70） | 反復版をN・Kと混合条件で定式化。元のCtr_□を使う結果も系として保持 |
| 参考文献[1] → 新p40 | arXiv中心の表記から、編集者・叢書・巻・出版社を含む刊行版の表記へ更新 |

本編・補足の番号、主定理から補足への証明参照、PDFのしおりも更新した。

## 抜き差しの判断

**旧A3「APSの公理の読み方」：ページを削除。** 対応する公理の式と算術での意味は本編p12にあり、A4の役割はp16で説明している。定理・証明・反例の削除はない。

**旧A7「積と含意を導入する理由」：ページを削除。** 積と含意の役割は本編p18、否定の定義はp19、Gödel文からSanta Claus文へのパラメータ化は旧p30（新p29）で扱っている。

**旧A19「不動点の存在からG2を導く証明」：独立ページを削除し、証明を旧A18と統合。** 新A13（p54）に、Con=⊤から⊤=□Con≤□⊥≤⊥を導く証明と、⊠⊤の反証不能性との対応を残した。本編の系だけを残して証明を落とす処理はしていない。

**旧A20「□の不動点とSanta Claus文」：維持。** 新A14（p55）。□p=pとp=□p→aは異なる方程式である。単調不動点定理を連想する質問に対して、この区別とGödel鎖の具体例を参照できる。

**旧A37「一般の様相化された方程式」：維持し、問いの仮定を整理。** 新A30（p71）。本編のSCと一般の様相化された項の不動点存在を区別する。主定理と揃うN・K・Mix_□の下での問いに加えて、元の正規性・N・K・4の下でFLöbまたは∀∃SCを仮定する問いも保持した。後者ではFLöbと∀∃SCの同値性を前提にしない。

## 正規性と N・K の照合

以下、$ab:=a\cdot b$。正規性の定義は、指定どおり $\Box\top=\top$ と $\Box(ab)=\Box a\cdot\Box b$ とした。「正規K-bicRAMS」「正規K4-bicRAMS」という名称は用いていない。

**命題。** bicRAMSにおいて、次が成立する。

1. Nの下で $\mathrm K\iff(\mathrm M+\mathrm C)$。
2. 正規性の下で $\mathrm K\iff\mathrm M$。
3. 縮約を仮定すれば、正規性とN・Kは同値。
4. より一般に、Ctr_□の下で $\mathrm N+\mathrm K\iff\text{正規性}+\mathrm M$。

**証明。** (1)は元の補足A10の証明による。(2)では正規性からN・Cが成立するので(1)を使う。(3)では積が最大下界となる。正規性からMが従い、逆にN・KからM・Cを得て、$\Box(ab)\le\Box a\wedge\Box b=\Box a\cdot\Box b$ とCを合わせる。(4)ではN・KからM・Cを得る。Ctr_□を$ab$に適用し、$ab\le a,b$の単調像を使うと $\Box(ab)\le\Box(ab)^2\le\Box a\cdot\Box b$。Cが逆向きを与える。逆含意は(2)による。□

正規性だけからMが従わない四点鎖の反例も、新A9に保持した。Boole・Heyting代数における通常の正規性と、一般の剰余モノイド上で積を保存する条件との違いが残るためである。

## 強い Löb の定理を強めた箇所

混合条件を、$r,s\ge0$と$\Box^0:=\mathrm{id}$に対して
$\mathrm{Mix}^{(r,s)}_\Box:\ \forall a\,(\Box^ra\le\Box^ra\cdot\Box^sa)$
と書く。通常のMix_□は$(r,s)=(1,2)$、Ctr_□は$(1,1)$に当たる。

強いLöbに使うのは $\mathrm{Mix}^{(0,1)}_\Box:\ a\le a\cdot\Box a$ である。この条件は、CPと縮約から従う。

**定理。** Mを満たすbicRAMSでは
$\mathrm{sLöb}\iff(\mathrm{Mix}^{(0,1)}_\Box+\mathrm{FLöb})\iff(\mathrm{Mix}^{(0,1)}_\Box+\forall\exists\mathrm{SC})$。
特にN・K・$\mathrm{Mix}^{(0,1)}_\Box$の下では、sLöb・FLöb・∀∃SC・Löbの四条件は同値であり、各パラメータ$a$の解は$p=a$である。

**証明。** 整性から$a\le\Box a\to a$なので、sLöbは$a=\Box a\to a$と同値。MとsLöbを仮定し$q:=a\Box a$と置く。$q\le a$より$\Box q\le\Box a$であり、$a\Box q\le q$。剰余律とsLöbから $a\le\Box q\to q\le q=a\Box a$ を得る。従って混合条件が成立する。また$a=\Box a\to a$の両辺に□を適用するとFLöbが従い、$p=a$はSCの解になる。

逆に混合条件と$p=\Box p\to a$を仮定すると、$p\le p\Box p\le a\le p$。従って$p=a$であり、sLöbを得る。FLöbからSCへの向きはMと整性だけでよい。実際$p:=\Box a\to a$に対して$a\le p$なので$\Box a\le\Box p$、FLöbから$\Box p\le\Box a$となり、$p=\Box p\to a$。

さらに混合条件から$a\le a\Box a\le\Box a$、すなわちCPが従う。$a=\top$を代入すればN、$a=\Box b$を代入すればMix_□を得る。従ってN・Kを仮定する場合は本編の主定理を適用してLöbとも同値になる。最後にCPと縮約から$a\le a^2\le a\Box a$。元の定理も系として回収できる。□

この書き直しでは、基礎的な三条件の同値性に必要な仮定をMまで下げ、全体に課していた縮約を混合条件へ置き換えた。N・Kを使う四条件の定理も併記した。既存文献に対する新規性を、この改訂で確定したとは扱っていない。

## 反復版の定理を強めた箇所

$n\ge1$を固定する。記号は元のスライドに合わせる：$\mathrm D1_{n+1}:\ \Box a\le\Box^{n+1}a$、$\mathrm{wFLöb}_n:\ \Box(\Box^na\to a)\le\Box a$、$\mathrm{Löb}_n:\ \Box^na\le a\Rightarrow a=\top$、$\forall\exists\mathrm{SC}_n:\ \forall a\exists p\,(p=\Box^np\to a)$。

**定理。** N・K・$\mathrm{Mix}^{(1,n+1)}_\Box$を満たすbicRAMSでは、$\mathrm{wFLöb}_n\iff\mathrm{Löb}_n\iff\forall\exists\mathrm{SC}_n$。解は存在すれば一意で、$p=\Box^na\to a$。

**証明。** まずN・KからM・Cが従う。帰納的に$\Box^r$もM・Cを満たし、従ってKを満たす。

wFLöb$_n$からD1$_{n+1}$とLöb$_n$を導く向きには混合条件は不要である。$x:=a\Box^na$と置くと$x\le a$なので、Mより$a\Box^nx\le a\Box^na=x$。従って$a\le\Box^nx\to x$であり、$\Box a\le\Box(\Box^nx\to x)\le\Box x\le\Box^{n+1}a$。また$\Box^na\le a$なら、NとwFLöb$_n$より$\Box a=\top$。Nを反復して$\Box^na=\top$、従って$a=\top$。

逆にLöb$_n$を仮定する。$p:=\Box^na\to a$、$q:=\Box p\to\Box a$と置く。Kと反復Kより、$\Box p\cdot\Box^{n+1}a\le\Box a$および$\Box^nq\cdot\Box^{n+1}p\le\Box^{n+1}a$。混合条件から $\Box^nq\cdot\Box p\le\Box^nq\cdot\Box p\cdot\Box^{n+1}p\le\Box p\cdot\Box^{n+1}a\le\Box a$。従って$\Box^nq\le q$となり、Löb$_n$より$q=\top$。これがwFLöb$_n$を与える。

最後に$F:=\Box^n$と置く。$F$はN・Kを満たし、混合条件に$\Box^{n-1}a$を代入して$Fa\le Fa\cdot FFa$を得る。本編の主定理を$F$へ適用してLöb$_n$と∀∃SC$_n$の同値性、および解の表示と一意性を得る。□

**系。** N・K・Ctr_□の下では、元の結論 $\mathrm{wFLöb}_n\iff(\mathrm D1_{n+1}+\mathrm{Löb}_n)\iff(\mathrm D1_{n+1}+\forall\exists\mathrm{SC}_n)$ が成立する。

**証明。** 順方向は証明の第一段階による。逆方向では、Ctr_□とD1$_{n+1}$から$\Box a\le(\Box a)^2\le\Box a\cdot\Box^{n+1}a$を得て定理を適用する。□

反例のŁukasiewicz代数も残し、混合条件が$a=1/2$で失敗する計算を追加した。

## 追加で見つかった言い回し・流れの問題

| 箇所 | 判断・対応 |
|---|---|
| 旧p3「本講演のお品書き」 | 「本講演の構成」に変更。本文の語調に揃えた |
| 旧p29の「いい振る舞いをするRAMS」 | スライドではN・K・Mix_□を明記。「補助元を量化しない」として、存在文を不等式に置き換える意味を限定した |
| 正規性とN・K | 一般のbicRAMS上で同値と読める省略を避け、縮約下の同値性と、Ctr_□下のより一般的な対応を分けた |
| 旧A20の「反単調性だけから…」 | 「Tarskiの不動点定理を、そのまま適用できない」に修正。対象となる写像の違いを明示した |
| 旧A32と旧A34の順方向の証明 | 完全な重複を避け、順方向は補題に集約。逆方向のページでは反復Kの帰納的導出を追加した |
| 旧A35「Fも正規」 | 証明が使うのはFのN・K・Mix_Fであることなので、それらを直接導く形に変更 |
| 旧A37「FLöbまたは∀∃SC」 | 元の仮定の下では両者の同値性が保証されていない。二つの問いを保持しつつ、本編の仮定を使う問いとは区別した |

次の二点は、意味が変わり得るので本文には一律に反映していない。

- **旧p2「講演者は…RAMSを導入し…」**：先行研究との比較を重視するなら「本講演では、剰余律を満たす積と含意を備えたRAMSを考え…」の方が、枠組みの新規性について過剰な含みを持たない。これは文体だけでなく、研究上の位置づけの選択でもある。
- **D1$_{n+1}$という記号**：第1節の導出可能性条件D1と混同され得る。「反復条件D1$_{n+1}$」と呼び分けるか、後の版で$4_n$などへの改称を検討できる。今回は元の記号を維持した。

## 参考文献

[1] L. Beklemishev and D. Shamkanov (2016), “Some abstract versions of Gödel’s second incompleteness theorem based on non-classical logics.” In J. van Eijck, R. Iemhoff and J. J. Joosten (eds.), *Liber Amicorum Alberti: A Tribute to Albert Visser*, Tributes 30, College Publications, London, pp. 15–29.

刊行情報の確認先：[HSEの刊行記録](https://publications.hse.ru/en/chapters/185490010)、[Steklov Mathematical Instituteの著者業績一覧](https://www.mi-ras.ru/index.php?c=pubs&id=71410&l=1)。刊行版のPDF本文とarXiv版の異同を確認した、という意味ではない。

[3] T. Litak (2014), “Constructive modalities with provability smack.” In *Leo Esakia on Duality in Modal and Intuitionistic Logics*, pp. 179–208.

[4] A. Visser and T. Litak (2024), *Lewis and Brouwer meet Strong Löb*, arXiv:2404.11969.

[5] T. Kurahashi and Y. Okawa (2022), “Effectively constructible fixed points in Sacchetti’s modal logics of provability.” *Notre Dame Journal of Formal Logic* 63, pp. 35–49.

[10] L. Sacchetti (2001), “The fixed point property in modal logic.” *Notre Dame Journal of Formal Logic* 42, pp. 65–86.
