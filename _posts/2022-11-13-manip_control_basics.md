---
layout: mathpost
title:  "Control Basics for Robot Manipulation"
mathjax: true
tags: [robotics, control, simulation]
---

Robot manipulation involves precise and/or reactive motion of the robot arm, often focused at the end-effector. A
hierarchical control scheme is usually employed, where an algorithm (e.g. a learnt motion policy) predicts motion
targets at a low frequency (~ 30 Hz), and a low-level controller running at high frequency (~ 1 kHz) moves the robot to
reach the current target. We will discuss only the latter in its _torque control_ form here i.e. the low-level
controller has to calculate the torques to be applied to each DoF of the arm.

Let us start from the dynamics equation
(see the [previous post]({{ site.baseurl }}{% post_url 2022-11-10-simulation_basics %}) on simulation basics for a
detailed description):

$$
M(\mathbf{q}) \ddot{\mathbf{q}} + C(\mathbf{q}, \dot{\mathbf{q}}) \dot{\mathbf{q}} =
\mathbf{u} + \tau_g \left( \mathbf{q} \right) + \sum_{c \in \mathcal{C}} J_c^T \left( \mathbf{q} \right) F_c
$$

If the entire desired DoF (i.e. joint space) trajectory $\mathbf{q}_d^{(t)}$ where time $t \in [0, T]$ is available
beforehand, we can also calculate the desired velocity $\dot{\mathbf{q}}_d^{(t)}$ and desired acceleration
$\ddot{\mathbf{q}}_d^{(t)}$. We saw in the
[previous post]({{ site.baseurl }}{% post_url 2022-11-10-simulation_basics %}) how a feed-foward + PD formulation of
the control input torque $\mathbf{u}$ results in a nice linear system.

But often the entire desired trajectory is not available beforehand. For example, when executing a RL policy trained
in simulation on a real robot, the next action depends on the current observation, so we only have access to one step
of the desired trajectory. So we set the desired DoF velocity and acceleration to zero and obtain the following
low-level controllers:

## Stiffness control (joint space):

$$
\mathbf{u} = K_P \left( \mathbf{q}_d - \mathbf{q} \right) - K_D \dot{\mathbf{q}}
$$

This is susceptible to bias from gravity and the coriolis forces.

## Impedance control (joint space):

$$
\mathbf{u} = K_P \left( \mathbf{q}_d - \mathbf{q} \right) - K_D \dot{\mathbf{q}} - \tau_g +
C(\mathbf{q}, \dot{\mathbf{q}}) \dot{\mathbf{q}}
$$

This compensates for gravity and coriolis forces. Estimates of $\tau_g$ and
$C(\mathbf{q}, \dot{\mathbf{q}}) \dot{\mathbf{q}}$ are usually given by the robot driver library.
Now if the learnt policy predicts motion targets in the task space i.e. the 6-DoF space of the end-effector motion,
we can convert the end-effector wrench to joint torque using the end-effector Jacobian matrix $J_e(\mathbf{q})$.

## Impedance control (task space)

End-effector wrench $\Omega \left( \mathbf{q} \right) = K_P \left( \mathbf{p}_d - \mathbf{p}(\mathbf{q}) \right) - K_D \dot{\mathbf{p}}(\mathbf{q})$
where $\mathbf{p}(\mathbf{q})$ is the 6-DoF pose of the end-effector, a function of the DoF positions $\mathbf{q}$.

$$
\mathbf{u} = J_e^T(\mathbf{q}) \Omega \left( \mathbf{q} \right) - \tau_g + C(\mathbf{q}, \dot{\mathbf{q}}) \dot{\mathbf{q}}
$$

## [Operational space control](https://ieeexplore.ieee.org/document/1087068) (task space)

Redundant manipulator robots have more actuator DoFs than end-effector DoFs. $J^T_e(\mathbf{q})$ has a non-empty
null space i.e. no end-effector wrench $\Omega \left( \mathbf{q} \right)$ will be able to affect some DoFs or a
part of their span when multiplied by $J^T_e(\mathbf{q})$ to calculate the joint torques. So we are free to shape some
behaviour in that null space. Usually we have a direct joint-space PD control to the home positions of the joints
$\mathbf{q}_0$:

$$
\Lambda = J_e^T(\mathbf{q}) \Omega \left( \mathbf{q} \right) +
(I - J(\mathbf{q})^T \bar{J}(\mathbf{q})^T) \left( K'_P (\mathbf{q}_0 - \mathbf{q}) - K'_D \dot{\mathbf{q}} \right)
$$

where $\bar{J}(\mathbf{q})$ is the pseudo-inverse of $J(\mathbf{q})$ and the final control input joint torques are

$$
\mathbf{u} = \Lambda - \tau_g + C(\mathbf{q}, \dot{\mathbf{q}}) \dot{\mathbf{q}}
$$

## OSC while grasping (task space)

Finally, if the robot is being moved while grasping some object, the control input joint torques can compensate for the
weight of the grasped object. Most robot driver libraries provide an estimate of the "external" torque
$\hat{\tau}_{ext} (\mathbf{q})$, which can arise from the weight of unknown grasped objects or unexpected contacts with the
environment. The libraries provide this estimate by subtracting the commanded and gravity joint torques from the total
joint torque reported by torque sensors in the motors.

$$
\mathbf{u} = \Lambda - \tau_g + C(\mathbf{q}, \dot{\mathbf{q}}) \dot{\mathbf{q}} - \hat{\tau}_{ext} (\mathbf{q})
$$