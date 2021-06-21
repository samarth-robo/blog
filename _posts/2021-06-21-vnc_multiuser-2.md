---
layout: post
title:  "Ubuntu 18.04 multi-user VNC access (Part 2)"
tags: [remote_work]
---

We will use [`x11vnc`](https://github.com/LibVNC/x11vnc) to set up remote VNC access of an Ubunutu computer for multiple users. This setup

- works through reboots
- never needs physical presence at the computer.

Please read [Part 1]({{ site.baseurl }}{% post_url 2020-09-28-vnc_multiuser-1 %}) for `x11vnc` and `systemctl` basics.
