#!/usr/bin/env python3
"""Exact, finite rational audit: IA does not imply Mix over N,K,4."""
from fractions import Fraction as F
from itertools import product
A = [F(0), F(1,2), F(1)]
prod = lambda a,b: max(F(0), a+b-1)
imp = lambda a,b: min(F(1), 1-a+b)
box = lambda a: max(F(1,2), a)
assert box(F(1)) == 1
assert all(prod(box(imp(a,b)),box(a)) <= box(b) for a,b in product(A,repeat=2))
assert all(box(a) <= box(box(a)) for a in A)
assert all(box(prod(a,box(a))) == box(a) for a in A)
assert not all(box(a) <= prod(box(a),box(box(a))) for a in A)
assert all(imp(box(a),a) in A for a in A)
assert not any(p == imp(box(p),F(1,2)) for p in A)
print('PASS: N,K,4,IA and not Mix; SC(1/2) fails')
