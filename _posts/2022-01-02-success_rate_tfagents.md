---
layout: post
title:  "Measuring Policy Success Rate in TF-Agents"
tags: [reinforcement_learning, tf_agents]
---

Success rate of the agent (fraction of episodes which end because the agent solved the task successfully) can be a
useful metric to monitor while training an a reinforcement learning (RL) policy. This post shows how to do that in
[TF Agents](https://www.tensorflow.org/agents), a popular RL framework.

## 1. Modify your environment
Modify `env.step()` to return the reason for ending the episode. For
[gym API environments](https://gym.openai.com/docs/#observations), this can be done via a new key `done_reason` in
the `info` dictionary returned by `env.step()`. The integer values of `info['done_reason']` can be `-1: not done`,
`0: task fail`, `1: time out`, `2: success`.

Then following [this TF Agents `PyEnvironment` tutorial](https://www.tensorflow.org/agents/tutorials/2_environments_tutorial#creating_your_own_python_environment)
and [this structured observations example](https://www.tensorflow.org/agents/tutorials/8_networks_tutorial#custom_networks),

```py
from tf_agents.specs import ArraySpec, BoundedArraySpec
from tf_agents.trajectories import time_step as ts
from tf_agents.environments.py_environment import PyEnvironment

class MyPyEnv(PyEnvironment):
    def __init__(self, **env_kwargs):
        self._env = MyEnv(**env_kwargs)  # follows gym API
        self._discount = 0.99
        self.get_specs()
        self._episode_ended = False

    
    def get_specs(self):
        self._observation_spec = {'obs': ArraySpec(shape=(self._env.obs_dim,), dtype=np.float32, name='observation'),
                                  'aux': ArraySpec(shape=(), dtype=np.int32, name='auxiliary')}
        self._action_spec = BoundedArraySpec(shape=(self._env.action_dim,), dtype=np.float32, minimum=-1, maximum=1,
                                             name='action')


    def action_spec(self):
        return self._action_spec


    def observation_spec(self):
        return self._observation_spec


    def _reset(self) -> ts.TimeStep:
        obs = self._env.reset()
        self._episode_ended = False
        return ts.restart({'obs': obs.astype(np.float32), 'aux': np.array(1, dtype=np.int32)})


    def _step(self, action) -> ts.TimeStep:
        if self._episode_ended:
            return self.reset()
        obs, reward, self._episode_ended, info = self._env.step(action)
        obs = {'obs': obs.astype(np.float32), 'aux': np.array(info['done_reason'], dtype=np.int32)}
        time_step = ts.termination(obs, reward) if self._episode_ended else ts.transition(obs, reward, self._discount)
        return time_step
```
`MyPyEnv`'s observation is a dictionary, instead of a tensor. `observation['obs']` has the actual
observation tensor, and `observation['aux']` has an integer-coded reason for episode end.


## 2. Success rate metric
This is the fun part. We will create a new [metric](https://www.tensorflow.org/agents/api_docs/python/tf_agents/metrics),
which can be called every time step. This is a transition metric, which is called with the tuple
([`TimeStep`](https://www.tensorflow.org/agents/api_docs/python/tf_agents/trajectories/TimeStep),
[`PolicyStep`](https://www.tensorflow.org/agents/api_docs/python/tf_agents/trajectories/PolicyStep),
[`NextTimeStep`](https://www.tensorflow.org/agents/api_docs/python/tf_agents/trajectories/TimeStep)) every time step. Normal non-transition metrics are called with
[`Trajectory`](https://www.tensorflow.org/agents/api_docs/python/tf_agents/trajectories/Trajectory), which does not
contain the [`NextTimeStep`](https://www.tensorflow.org/agents/api_docs/python/tf_agents/trajectories/TimeStep)'s
observation. That is necessary, because it will be the last observation whenever the episode ends, and its `aux` will
contain the reason for the episode end.

The code for the metric is mostly copied from
[`AvertageEpisodeLengthMetric`](https://www.tensorflow.org/agents/api_docs/python/tf_agents/metrics/py_metrics/AverageEpisodeLengthMetric)
and is pretty simple. The second line of `_batched_call` is the most important.

```py
class SuccessRateMetric(PyMetric):
  def __init__(self, name='SuccessRate', buffer_size: int=10, batch_size=None):
    super(SuccessRateMetric, self).__init__(name)
    self._buffer = NumpyDeque(maxlen=buffer_size, dtype=np.float64)
    self._batch_size = batch_size
    self.reset()

  def reset(self):
    self._buffer.clear()

  def result(self) -> np.float32:
    """Returns the value of this metric."""
    if self._buffer:
      return self._buffer.mean(dtype=np.float32)
    return np.array(0.0, dtype=np.float32)

  def call(self, transition: tuple):
    time_step: TimeStep = transition[0]
    if not self._batch_size:
      if time_step.step_type.ndim == 0:
        self._batch_size = 1
      else:
        assert time_step.step_type.ndim == 1
        self._batch_size = time_step.step_type.shape[0]
      self.reset()
    if time_step.step_type.ndim == 0:
      transition = batch_nested_array(transition)
    self._batched_call(transition)

  def _batched_call(self, transition: tuple):
    next_time_step: TimeStep = transition[2]
    success = (next_time_step.observation['aux'][next_time_step.is_last()] == 2)
    self._buffer.extend(success)
```

## 3. Use this env and metric in policies and drivers
- To discard `observation['aux']` before feeding the TimeStep observation to policy neural networks, use a
"preprocessing combiner". Most [TF Agents in-built networks](https://www.tensorflow.org/agents/api_docs/python/tf_agents/networks)
support this or are planned to support in the near future. It is also straightforward to add this support by yourself
if it does not exist. Look at
[`ActorDistributionNetwork`](https://www.tensorflow.org/agents/api_docs/python/tf_agents/networks/actor_distribution_network/ActorDistributionNetwork)
code as an example. For our case, you need `preprocessing_combiner = tf.keras.layers.Lambda(lambda x: x['obs'])`.
- Since `SuccessRateMetric` defined above is a transition metric/observer, make sure you use it as a
`transition_observer` (not just `observer`) in
[`PyDriver`](https://www.tensorflow.org/agents/api_docs/python/tf_agents/drivers/py_driver/PyDriver)
for collecting experience in `MyPyEnv`.