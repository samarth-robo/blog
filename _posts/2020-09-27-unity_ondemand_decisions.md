---
layout: post
title:  "Unity ml-agents On Demand Decisions"
tags: [simulation, machine_learning]
---

[Unity `ml-agents`](https://github.com/Unity-Technologies/ml-agents/blob/master/docs/Readme.md) provides a nice simulation environment to learn and prototype
RL agents. But the callback frequency and ordering of certain callback functions can be confusing, especially if you use the
[Python API](https://github.com/Unity-Technologies/ml-agents/blob/master/docs/Python-API.md) with an external learning framework like
[tensorflow/agents](https://github.com/tensorflow/agents), which "steps" the environment differently than Unity's own internal "Academy" does. This blog post 
tries to condense some of the things I have learnt from browsing the forums and experimenting.

# Action and Decision Frequency
By default, the environment is stepped at every Unity `FixedUpdate()` ([source](https://forum.unity.com/threads/how-do-i-manually-call-collectobservations-and-agentaction.834385/#post-5514061)).
`FixedUpdate()` is where Unity's physics loop runs, and it is guaranteed to run at a fixed frequency independent of rendering fluctuations. Actions predicted by
RL are applied to the agent at every envionment step. But decisions are **not** requested from the RL alorithm at every environment step. The details depend on
the `DecisionRequester` component of your agent. If "Take Actions Between Decisions" is checked in the `DecisionRequester`, the same RL-predicted action is repeated
for `Decision Step` (which is also a property of the `DecisionRequester`) frames. If not checked, a zero action is applied. All this is mentioned in the
[`DecisionRequester` API](https://docs.unity3d.com/Packages/com.unity.ml-agents@1.0/api/Unity.MLAgents.DecisionRequester.html), but is hard to find in the
`ml-agents` GitHub documentation.

# Stepping Externally
An extra layer of complexity is added when you use the Python API and external learning framework. As mentioned
[here](https://github.com/Unity-Technologies/ml-agents/blob/master/docs/Python-API.md#the-baseenv-interface), one Python `step()` steps the Unity environment
as much as needed to make the agent request an input from the Python API. This happens when the agent requests a decision (aka RL inference).

The decision requesting happens automatically. But sometimes you need to control this behavior. For example, you may need a couple of `FixedUpdate()` physics loops
to reset your agent/environment, and don't want a decision to be requested while this reset is going on. For this, you have to remove the `DecisionRequester` component
from you agent, and essentially copy-paste its code into your agent code. In this code, you can use a condition to determine if `Agent.RequestDecision()` should
be called. Here is a code snippet (it should be interpreted in the context of `DecisionRequester`'s code):

```
void MakeRequests(int academyStepCount) {
    if (condition) {  // use your condition here
        if (academyStepCount%decisionStep==0) RequestDecision();
        else if (takeActionsBetweenDecisions) RequestAction();
    } else {
        // do something else if needed
    }
}
```
