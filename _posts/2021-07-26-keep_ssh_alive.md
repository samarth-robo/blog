---
layout: post
title:  "Keep your SSH Session Alive"
tags: [remote_work, misc]
---

Add to the `~/.ssh/config` of your *local* computer i.e. SSH client:

```
ServerAliveInterval 15
ServerAliveCountMax 4
```

It sends a heartbeat signal to the SSH server every 15 seconds, and prevents an idle SSH session from freezing.