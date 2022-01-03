---
layout: default
title: About/Index
permalink: /about/
---

A techincal blog by [Samarth Brahmbhatt](https://samarth-robo.github.io/), discussing computer vision, robotics and machine learning.

{% assign n = site.tags | size %}
{% assign tags = site.tags | sample: n %}
{% for tag in tags %}
  <h3>{{ tag[0] }}</h3>
  <ul>
    {% for post in tag[1] %}
      <li><a href="{{ post.url | prepend:site.baseurl }}">{{ post.title }}</a></li>
    {% endfor %}
  </ul>
{% endfor %}
