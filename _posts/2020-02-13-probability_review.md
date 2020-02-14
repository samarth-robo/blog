---
layout: post
title:  "Probability Review"
tags: [math, review]
---

I want to note down simple explanations of two probability terms that have confused me in the past. Consider this example:
<img src="{{site.baseurl}}/assets/images/bayes_net.png">
(above) example Bayes Net, taken from [lecture notes by Mark Gales](http://mi.eng.cam.ac.uk/~mjfg/local/4F10.old/lect10.pdf). 

## Conditional Independence
Both Sprinkler and Rain individually depend on whether it is Cloudy. Without knowing whether it is Cloudy or not,
if I tell you that the Sprinkler is on, you might guess that it is not Raining, because the Sprinker is usually on
when it is not Cloudy, and that means less chance of Rain.

In other words, Cloudy is a hidden variable connecting Sprinkler and Rain.

In contrast, as soon as you know that is it is Cloudy, new information about the Sprinkler will not
influence your guess about whether it is Raining. Hence, Sprinkler and Rain are conditionally independent

## Explaining Away
Ignore the Cloudy variable for this discussion. Not knowing whether the Grass is Wet, information about whether the Sprinker
is on will not influence your guess about whether it is Raining. But as soon as you know that the Grass is Wet, knowing that
the Sprinkler is on will lead you to believe that it is not Raining, since an on Sprinkler explains away the Wet Grass.

Mathematical explanations can be found in the [lecture notes](http://mi.eng.cam.ac.uk/~mjfg/local/4F10.old/lect10.pdf).
