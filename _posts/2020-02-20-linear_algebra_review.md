---
layout: mathpost
title:  "Linear Algebra Review"
mathjax: true
tags: [math, review]
---
# SVD
$A_{m \times n} = U_{m \times n} \Sigma_{n \times n} V_{n \times n}^T$, where $\Sigma$ has $n$ singular values, and $V$ columns are $n$ singular vectors.

$U$ columns are eigenvectors of $AA^T$, $V$ columns are eigenvectors of $A^TA$.

## Uses
1. Solution to $\min_{\mathbf{x}} A\mathbf{x} = 0$ s.t. $\norm{\mathbf{x}} = 1$ is the last column of $V$, where $A = U \Sigma V^T$.
