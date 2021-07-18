---
layout: mathpost
title:  "Optimization"
mathjax: true
tags: [math, optimization]
---
## Iterative optimization
Many problems involve minimizing the squared L2 norm of some error, which is a non-linear function of some parameters $\theta$.
This error $\epsilon$ is the difference between observed values
$\mathbf{Y}$ and values predicted from an input $\mathbf{X}$ by a non-linear function $f(\mathbf{X}, \theta)$: $\epsilon(\theta) = f(\mathbf{X}, \theta) - \mathbf{Y}$.
The objective function is

$$
g(\theta) = \frac{1}{2} \epsilon(\theta)^T \epsilon(\theta)
$$

Its derivatives are:

$$
\begin{align*}
g_\theta &= \epsilon_\theta^T \epsilon\\
g_{\theta\theta} &= \epsilon_\theta^T\epsilon_\theta + \epsilon_{\theta\theta}^T\epsilon
\end{align*}
$$

Consider the Taylor series expansion of the cost function:

$$
g(\theta + \Delta) = g + g_\theta\Delta + \frac{1}{2}\Delta^T g_{\theta\theta}\Delta + \ldots
$$

To find the minimizer $\Delta$, we take the derivative w.r.t. $\Delta$ and set it to 0, ignoring terms above the second order. This gives us the update equation

$$
g_{\theta\theta}\Delta = -g_\theta
$$

The four famous iterative optimization methods differ by different choices for approximating the Hessian $g_{\theta\theta}$.

- **Newton's method**. Hessian is computed fully. The drawback is that computing the Hessian might be complicated for some problems. This method assumes that the cost function is approximately quadratic around the minimum, and shows rapid convergence in that area.

- **Gauss-Newton**. Hessian is approximated as $\epsilon_\theta^T\epsilon_\theta$, avoiding computing the second derivative. Hence the update equation is

  $$
  \begin{align*}
  \epsilon_\theta^T\epsilon_\theta \Delta &= -g_\theta\\
  \implies \Delta &= -\left(\epsilon_\theta^T\epsilon_\theta\right)^{-1} \epsilon_\theta^T \epsilon
  \end{align*}
  $$

- **Gradient Descent**. Takes steps along the direction of steepest descent of $g$. The Hessian is approximated as a scaled identity, leading to the update equation

  $$
  \begin{align*}
  \gamma \Delta &= -g_\theta\\
  \implies \Delta &= -\frac{1}{\gamma} \epsilon_\theta^T \epsilon
  \end{align*}
  $$

  The advantage is that it is always guaranteed to lower the objective function, and the update is simple to compute. However, convergence near the minimum is not as fast as Newton's method, and choosing a right learning rate $\gamma$ is difficult.

- **Levenberg-Marquadt**. The Hessian is approximated as a linear addition of the Hessian approximations used in Gauss-Newton and Gradient Descent:

  $$
  \begin{align*}
  \left(\epsilon_\theta^T\epsilon_\theta + \lambda I\right) \Delta &= -g_\theta\\
  \implies \Delta &= -\left(\epsilon_\theta^T\epsilon_\theta + \lambda I\right)^{-1} \epsilon_\theta^T \epsilon
  \end{align*}
  $$

  Depending on the value of $\lambda$, this algorithm can seamlessly switch between Gauss-Newton (rapid convergence near a minimum), and Gradient Descent (guaranteed decrease in cost function).
