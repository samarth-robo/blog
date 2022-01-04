---
layout: post
title:  "SSH Tunnel"
tags: [remote_work]
---

A handy [SSH Tunneling](https://www.ssh.com/academy/ssh/tunneling/example) script. Useful for many remote work
tasks, for example securing a [remote]({{ site.baseurl }}{% post_url 2020-09-28-vnc_multiuser %})
[desktop]({{ site.baseurl }}{% post_url 2021-06-21-vnc_multiuser_2 %}) connection.

```bash
#!/usr/bin/env bash

if [ $# -eq 2 ]; then
  echo "Go to: http://localhost:$2, which is connected to http://$1:$2"
  ssh -N -L $2:localhost:$2 $1
elif [ $# -eq 3 ]; then
  echo "Go to: http://localhost:$2, which is connected to http://$1:$3"
  ssh -N -L $2:localhost:$3 $1
else
  echo "Usage: ./$0 remote_host local_port [remote_port]"
  echo "Received $# arguments instead"
  exit -1
fi
```