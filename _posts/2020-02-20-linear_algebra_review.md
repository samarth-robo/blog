---
layout: mathpost
title:  "Linear Algebra Review"
mathjax: true
tags: [math, review]
---

# [The Matrix Cookbook](https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf)

# SVD
$A_{m \times n} = U_{m \times n} \Sigma_{n \times n} V_{n \times n}^T$, where $\Sigma$ has $n$ singular values, and $V$ columns are $n$ singular vectors.

$U$ columns are eigenvectors of $AA^T$, $V$ columns are eigenvectors of $A^TA$. Singular values are square roots of eigenvalues. Proof:

Consider the SVD:

$$
\begin{align*}
A &= U \Sigma V^T\\
\implies AA^T &= U \Sigma V^T V \Sigma U^T\\
&= U \Sigma^2 U^T
\end{align*}
$$

which is an eigen decomposition of $AA^T$. Eigenvalues are squared elements of $\Sigma$, and columns of $U$ are the eigenvectors. Similar proof for columns of $V$ being eigenvectors of $A^TA$.

## Uses
1. Solution to $\min_{\mathbf{x}} A\mathbf{x} = 0$ s.t. $\norm{\mathbf{x}} = 1$ is the last column of $V$, where $A = U \Sigma V^T$ (proof in Hartley and Zisserman A5.3).
2. Enforcing rank$=2$ constraint on $3 \times 3$ matrices e.g. when estimating the fundamental matrix or a rotation matrix. $A = U diag(r, s, t) V^T$ where the singular values $r$, $s$, and $t$ are in descending order. Then the constrained matrix is $A' = U diag(r, s, 0) V^T$
3. In [PCA](https://alliance.seas.upenn.edu/~cis520/dynamic/2016/wiki/index.php?n=Lectures.PCA), the principal components are the columns of $V$ with the highest singular values after performing SVD on the mean-subtracted data matrix.

# Miscellaneous
- For skew-symmetric $A$, $\mathbf{x}^T A \mathbf{x} = 0$, $\forall \mathbf{x}$.
- Matrix $A$ is positive semidefinite $A \succeq 0$ iff all its eigenvalues are $\geq 0$. 

[(page source)](https://github.com/samarth-robo/blog/blob/gh-pages/_posts/2020-02-20-linear_algebra_review.md)
