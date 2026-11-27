from pathlib import Path
import csv, re, shutil, zipfile, json
ROOT=Path('/mnt/data/rams1_v10'); S=Path('/mnt/data/rams_v10_sources')
old=(S/'MASTER_v9.txt').read_text(encoding='utf-8')
proof=(ROOT/'UPDATE_v10_PROOFS.md').read_text(encoding='utf-8')
old=old.replace('研究成果総覧 v9.0','研究成果総覧 v10.0',1).replace('**改訂基準：2026-10-29（日本時間、22:56 JST までの研究状況）**','**改訂基準：2026-10-31（日本時間、16:40 JST までに確認した研究状況）**',1)
old=old.replace('## 目次', '''> **v10.0 編集原則**: v9 の全登録（原理228件・関係437件）は来歴情報として残し、10月29–31日の追加議論を本編に統合した。追加の証明は `UPDATE_v10_PROOFS.md` に自足的に書いた。旧テキストの `[E]` / `[P]` は検算済みを意味しない。特に `AMC⇒uAMC` と `gTFPP⇒gU` は解決扱いしない。\n\n## v10 の主要変更（結論・証明の位置）\n\n| 系統 | 内容 | 状態・掲載位置 |\n|---|---|---|\n| IA□の局所崩壊 | `M+IA□ ⊨ SC⇔FLöb`。`Mix⇒IA□`、3元MVで逆失敗 | [P10,CM]; §2a |\n| Consistency | `N,K ⊨ Con_S⇔Con_L`。非自明なN+Con_Lで `¬gTFPP∧¬gU` | [P10]; §3a |\n| SC–F₁,₁ | 草稿§5.5の局所化モデルで `SC⇏F₁,₁` | [D27]; §3b |\n| 多様体 | v9の `gTFPP(A)⇔HSP(A)⊨gFPP` を維持 | [E9]; §3 |\n| 連続性 | 全項連続と *未知変数方向の* guarded 項連続を分離 | [P10]; §4a |\n| 訂正 | `Con_S+SC+gTFPP` という過去のMV=idモデル主張を撤回 | [ERR]; §11a |\n\n## 目次''',1)
# update TOC for inserted sections
old=old.replace('3. 強い定理 II：構文的存在階層と一意性階層','3. 強い定理 II：構文的存在階層と一意性階層／Consistency')
# helper insert by header with small reference and formula, while comprehensive proofs live in update
insertions={
'## 3. 強い定理 II：存在と一意性の二軸・厳密性':'''## 2a. Mix の最小化：解上での吸収が十分 [P10,CM]\n\n**局所吸収原理** `IA□: □(x□x)=□x`、さらに SC 解だけに制限した `IA_SC` を使う。\n\n\\[\\boxed{M+IA_\\Box\\models SC\\iff FL\\ddot ob.}\\]\n\n厳密には各パラメータ `a` に対して、`SC(a)` の解 `p` が `□(p□p)=□p` を満たすだけで `FLöb(a)` が得られる。証明は `a≤p`, `p□p≤a` から `□a≤□p=□(p□p)≤□a` と一行で終わる。`N,K` の下で FLöb の既存主定理と結合すると `SC + IA□ ⇒ gUTFPP`。\n\n`Mix□⇒IA□` は N,K から従う `C` と単調性で証明できる。一方 **3元 Łukasiewicz 鎖** `□x=max(1/2,x)` は `N,K,4,IA□,¬Mix□` を満たすので、置換は真に弱い。これは既存の Mix 下の崩壊を、同値原理ではなくその証明機構を抽出して改良した結果。厳密計算は `check_IA_3MV.py`、一般の証明は `UPDATE_v10_PROOFS.md` R10-1,2。\n\n''',
'## 4. 強い定理 III：距離・合同・順序の本質的対応':'''## 3a. Schematic consistency による存在・一意性の障害 [P10]\n\n`¬x=x→0`, `◇x=¬□¬x` とし、`Con_L:□0≤0`, `Con_S:∀x(□x≤◇x)` とする。\n\n\\[\\boxed{N+K\\models Con_S\\iff Con_L,\\qquad N+Con_L+0\\ne1\\models\\neg gTFPP\\land\\neg gU.}\\]\n\n前半は K からの積保存不等式 `□x□¬x≤□(x¬x)≤□0`、後半の `¬gTFPP` は `t(p)=¬□p` の **閉項解がない**ことによる。したがって `Con_S+SC` だけでは `gTFPP` は得られない。標準実数 MV 区間の `□=id` は `N,K,4,CP,Con_S,SC,FPP,¬gU,¬gTFPP` の強い対照例。\n\n**留意**: Consistency の比較は `Con_H`, `Con_IG`, `Con_EG`, `Con_G`, `non-Ros` の定義をそろえて行う。今回の `Con_S` は明示した **外部全称** と菱形に限る。G2 の諸原理を無条件で同値視しない。\n\n## 3b. SC–F₁,₁：草稿の反例を固定 [D27]\n\n`R_−=Q[ε,(1+ε)⁻¹]` の MV 区間、`□x=1−ε+εx` において SC の解は `(a+ε)/(1+ε)` だが `SC⁺: p=a□p` の `a=1/2` に対する唯一解 `(1/2−ε)/(1−ε)` は `R_−` にない。従って一般の `SC⇏F₁,₁` は旧草稿§5.5 に **明示的な証人がある**。直近の対話の「SC⇒F₁,₁ は未解決」という表現は、別の追加公理を指定しない限り誤り。\n\n''',
'## 5. 強い定理 IV：prefix MV 模型の D/H 階層':'''## 4a. 全項連続とガード付き項連続の厳密な区別 [P10]\n\n位相 `τ` を固定する。`TermCont(τ)` は非様相演算・□を含む全基本演算の共同連続性、`GuardCont_p(τ)` はパラメータを固定した **未知変数 p** についての全ガード付き項の連続性を意味する。\n\n\\[TermCont(τ)\\Longrightarrow GuardCont_p(τ),\\quad\\text{逆は不成立。}\\]\n\n実区間 Gödel–Heyting 代数の通常位相で `□x≡1` とすると、全ガード付き項は p に依存せず連続だが、Gödel 残余は `(t,t)` (`0<t<1`) で不連続。この反例はパラメータを含めた**共同連続性**に対する反例ではない。\n\n`MC`, `AMC`, `uAMC`, `GMC`, `GuardCont_p`, `TermCont`, `gFPP`, `gU`, `gTFPP` を曖昧に合成しない。特に `AMC⇒uAMC` は以前に提案された通常距離の超距離化構成が未検算であるため、通常の確定含意図には描かない。\n\n''',
'## 12. 検証・執筆の優先順位と文献':'''## 11a. v10.0 の訂正・撤回と未決着項目\n\n1. **撤回**: `□=id` の MV 代数が `Con_S+SC+gTFPP+¬gU` を満たすという過去の説明は誤り。`□0=0` のため、閉項解の不可能性により `¬gTFPP`。\n2. **訂正**: `SC⇒F₁,₁` を一般的な未解決問題と記した古い議論は、草稿の具体反例と衝突する。`R_−` の演算閉性・極の議論を検算した上で、一般には非含意とする。\n3. **保留**: `AMC⇒uAMC` の以前の「証明済み」報告は v9 の決定（未検証）を優先。\n4. **未解決**: `gTFPP⇒gU` は決着していない。ただし `N+Con_L+0≠1` または `N,K,IA□+SC` のような制約下では反例を探せない。\n5. **検証**: 旧 V22–V25 の可算系の分離、有限停止、正準合同塔の完全性、`D_n/H_n` の一般関係は独立検算優先。\n6. **構造上の注意**: 算術 Lindenbaum 代数で対角化から得る不動点と、`gTFPP` の一様な *同言語のパラメータ項* による構成は同じ概念でない。\n\n''',
}
for mark,seg in insertions.items():
    if mark not in old: raise SystemExit(f'missing {mark}')
    old=old.replace(mark,seg+mark,1)
old += '''\n\n## 22. 2026-10-31 更新の一次証拠・検証文書\n\n- `UPDATE_v10_PROOFS.md`: R10-1〜R10-10。今回の追加結果について **自足的な証明**・3元有限モデル・以前の誤りを記録。\n- `check_IA_3MV.py`: 厳密有理数演算による 3 元 Łukasiewicz MV 鎖の N,K,4,IA,¬Mix,¬SC(1/2) の全元検査。\n- `REGISTER_V10_NEW.csv`: 含意・反例・訂正を *事実／条件付き／未決着* に分けて記録。\n- `CORE_HIERARCHY_v10.svg` / `.png`: 統合のための**抜粋**図。v16 の全227原理・435関係を視覚化したものではない。\n- `archive_MASTER_v9.md`, `archive_UPDATE_v9.md`: v9 の原文アーカイブ。v9の報告とv10の確定内容が矛盾する場合は v10 の訂正を優先する。\n'''
(ROOT/'MASTER_v10.md').write_text(old,encoding='utf-8')
(ROOT/'archive_MASTER_v9.md').write_text((S/'MASTER_v9.txt').read_text(encoding='utf-8'),encoding='utf-8')
(ROOT/'archive_UPDATE_v9.md').write_text((S/'UPDATE_v9.txt').read_text(encoding='utf-8'),encoding='utf-8')
records=[
 ('R10-01','IA□+SC⇒FLöb','M; all SC parameters','proved-in-note','R10-1','SC solution p; □a≤□p=□(p□p)≤□a'),
 ('R10-02','IA_SC(a)+SC(a)⇒FLöb(a)','M; IA on one SC solution','proved-in-note','R10-1','parameter-local formulation'),
 ('R10-03','Mix□⇒IA□','K⇒M+C','proved-in-note','R10-2','monotonicity and C'),
 ('R10-04','IA□⇏Mix□','N,K,4','finite-computation','R10-2','3-element Lukasiewicz threshold box'),
 ('R10-05','Con_S⇔Con_L','N,K; Diamond=¬□¬','proved-in-note','R10-3','K and residuation'),
 ('R10-06','Con_L⇒¬gTFPP','N; 0≠1; original language','proved-in-note','R10-3','p=¬□p no closed-term solution'),
 ('R10-07','Con_L⇒¬gU','N; 0≠1','proved-in-note','R10-3','box p=p fixed by 0 and 1'),
 ('R10-08','Con_L∧FLöb impossible','N; 0≠1','proved-in-note','R10-3','FLob at x=0 gives 1≤0'),
 ('R10-09','Con_S+SC+FPP+¬gTFPP+¬gU','[0,1] MV with box=id','proved-in-note','R10-3','SC solve p=(1+a)/2'),
 ('R10-10','SC⇏F_1,1','N,K,4,Lob,CP,gU (draft)','draft-plus-checked-calculation','R10-4','localized MV ring R_-'),
 ('R10-11','gTFPP⇔HSP(A) gFPP','finitary language','carry-v9','R10-5','universally algebraic free algebra argument'),
 ('R10-12','TermCont⇒GuardCont_p; converse fails','real order topology; Godel residual','proved-in-note','R10-6','box≡1'),
 ('R10-13','AMC⇒uAMC','general bicRAMS','unresolved','R10-6','conflicting old proof sketches'),
 ('R10-14','gTFPP⇒gU','N,K,4 bicRAMS','unresolved','R10-5','IA and consistency eliminate candidates'),
 ('R10-15','SC+IA_SC⇒gU','N,K; local IA for each a','conditional-on-draft','R10-1','use main FLob finite system theorem'),
 ('R10-16','V22-V25 infinite systems','N,K,4 etc as formerly specified','needs-independent-audit','R10-9','old derivations not independently checked'),
 ('R10-17','Old assertion Con_S+SC+gTFPP via MV id','N,K MV id','withdrawn','R10-9','closed-term obstruction'),
 ('R10-18','Complete Heyting frame AMC⇔uAMC⇔ωExh','strong frame hypotheses','old-proof-recheck','R10-6','separate from general bicRAMS'),
 ('R10-19','IA_SC versus IA□ strict separation','N,K etc','unresolved','R10-2','full countermodel not independently checked'),
]
with (ROOT/'REGISTER_V10_NEW.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.writer(f);w.writerow(['id','statement','assumptions','status','reference','witness_or_idea']);w.writerows(records)
# manifest indexed by file names in archive package after copy
sources=Path('/mnt/data/rams1_sources')
for basename in ['fixed_point_atlas.pdf','fixed_point_atlas.tex','MLG2026_revision-notes.md','author_notes_ja.md']:
 p=sources/basename
 if p.exists():shutil.copy2(p,ROOT/('source_'+basename))
shutil.copy2(S/'fixed_points_mix.pdf',ROOT/'source_fixed_points_mix.pdf')
shutil.copy2(S/'atlas_v16.txt',ROOT/'source_atlas_v16_extracted.txt')
print('master',len(old.splitlines()),'lines; update',len(proof.splitlines()),'lines; registry',len(records),'records')
