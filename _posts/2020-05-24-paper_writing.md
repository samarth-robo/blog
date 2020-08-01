---
layout: post
title:  "Paper Writing Notes"
tags: [writing]
---

I compiled these notes from feedback given by [James Hays](https://www.cc.gatech.edu/~hays/)
and [Charlie Kemp](charliekemp.com) during my PhD.

# Abstract
(due to Charlie)
- **Motivation**: Wouldn't it be great if we could do X!
- **Challenge**: But, it's really tough to do X because of Y.
- **Contribution**: We overcame Y with Z, and have done X!

# Body Text
- If writing a dataset paper, focus on showing off as much of the raw data as possible. You can slice it in creative ways.
Analysis of the patterns and behaviors captured in the data is also good.
- Think very carefully about new terms you introduce (they should not invoke conflicting preconceived notions in
the reader’s mind). E.g. James’ comments on using the terms “heatmaps” and “contact saliency” in ContactDB:
"heatmap" makes sense because we do, literally, have heat maps. But because the term is used more generically for many
visualizations I'm not sure I like it in our paper. Maybe "contact maps"? "saliency" made more sense for the
"tactile mesh saliency" paper because they weren't capturing actual grasps but just asking people where they think
they'd touch. Saliency has more an implication of "attention" or "intention" and not ACTUAL grasp. We have real contacts
from real grasps so I wonder if there is a better term to use. 
- Figure and Table captions should be self-contained. For example, if a figure shows qualitative results from a network,
the caption should mention which of the investigated networks was used.
- Mention the method used to select the qualitative examples shown in a figure.
If cherry-picked, mention that too e.g. “Figure X shows plausible-looking predictions from our model…”.
- Mention observations from qualitative figures in the text e.g. Figure X shows qualitative predictions from our models.
Note that model A captures high-frequency details better than model B.
- Similarly, each unit describing an experiment should have a concluding sentence.
- Avoid making blanket statements e.g. Observing contact heatmaps is “impossible” with RGB and depth cameras.
- Avoid assuming thoughts e.g. “Participants grasp each object with a functional intent in mind” -> Charlie’s comment:
we can't know what they had in their minds. Instead communicate the protocol what participants were asked to do.
- Avoid justifying things by the quantity of your effort. E.g. James’ comment on my writing "Since we put considerable
effort into designing the features,...": I might also rephrase that. It's not really the effort we spent that matters,
it's the fact that we think the features are rich and provide fairly direct (and therefore easily learnable) evidence
of contact.
- From James: Jessica Hodgins gave advice to never use "since" when "because" would suffice, because "since" can imply
a time ordering. E.g. “Since model A performs better than model B,...” -> “Because model A performs better than model B,...”
- Avoid long and complicated sentences.
- Avoid over- or under-selling due to personal opinions. Examples:
  - James’ comment on my claim that "Finally, we introduced the new and important task of …”: Is it arrogant to call
  it "important" when nobody had thought to do it before? Maybe emphasize that people COULDN'T do it before.
  "Finally, our dataset is the first to enable the new task of …”
  - Charlie’s comment on my claim that “inclusion of non-fingertip areas (palm and rest of the finger) is essential
  to build accurate models of grasping contact for soft robotic manipulators”: edit text on soft robotics. it's not necessary.
  rather, it presents an opportunity to inform the design of soft robotic manipulators. It also emphasizes the large
  role that the soft tissue of the human hand plays in grasping and manipulation.
  - Charlie’s comment on my claim “By analyzing contact areas, we show that non-fingertip areas play an important role in
  human grasps”: We don't know what the role is nor if it is important. However, we can state that a substantial amount of
  contact made during human grasping is from contact with parts of the hand other than the fingertips.
- Include a section on limitations.

## Tense
(due to Charlie)
- **Related Work**
  - "Researcher X showed Y"
  - Past Tense: The researchers published the work and conducted the work in the past - prior to this paper
- **When describing the research process**
  - "We developed X"
  - Past Tense: We developed the thing in the past - prior to this paper
- **The experiments conducted for the paper**
  - "We did X"
  - Past Tense: We conducted the experiments in the past - prior to this paper
- **When referring to what we're doing in the paper**
  - "We present X"
  - Present Tense: The paper does these things as the person reads it
- **When describing a method, algorithm, equation, or proof**
  - "Our method uses X"
  - "Our algorithm does Y"
  - "A equals B"
  - Present Tense: The method, algorithm, equation, or proof is still the same in the present (while the person is reading
  the paper). This is analogous to the statement "Atlanta is in Georgia." If you were to say "Atlanta was in Georgia"
  you'd wonder where Atlanta is now, in the present.

# Conclusion
Charlie: I recommend never stating or committing to plans for future work. At the end of the paper, they should be excited about the
excellent work you just presented!

# Tips for cutting down on space
- Which figures can be removed or made smaller?
- If a line has a single word, can you re-word the paragraph so that a line is saved?
- If you find yourself using a lot of subsections or any subsubsections, consider converting them to bold text at the start
of paragraphs.