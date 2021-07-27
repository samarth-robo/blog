---
layout: post
title:  "Monitoring Process Tree RAM and CPU usage"
tags: [remote_work, misc]
---

We often need to monitor the RAM usage of a long-running process. For example, to see if a mysterious segfault in 
out ML training is caused by a memory leak. The following script runs your executable while logging its % RAM and CPU
usage to a `.txt` file.

Run it like so: `$ . monitoring_script.sh`. (You will need to make it executable before the first time:
`chmod +x monitoring_script.sh`).

Note the `.` in the first command. [It allows](https://stackoverflow.com/a/10781862/2469613) `monitoring_script.sh`
to export the `MY_PID` environment variable to the terminal session you run it from. Later, you can use
`kill -9 ${MY_PID}` to kill the long-running executable started in `monitoring_script.sh`. This is because it starts
the long-running executable in the background, which prevents killing it through the usual `Ctrl-C` method.

The the CPU and RAM usage is captured every 5 seconds, and written to `resource_usage.txt` in `memory cpu` format per
line. The usage of the entire process tree created by `long_running_executable.sh` is captured.

`monitoring_script.sh`:
```bash
#!/usr/bin/env bash

# trap logic from https://linuxconfig.org/how-to-propagate-a-signal-to-child-processes-from-a-bash-script
trap 'kill "${MY_PID}"; wait "${MY_PID}"' SIGINT SIGTERM

resource_file="resource_usage.txt"
echo "#memory cpu" > ${resource_file}

long_running_executable.sh &

export MY_PID=$!
echo ${MY_PID}

# https://unix.stackexchange.com/a/185799/453686
while kill -0 ${MY_PID}; do
  sleep 5
  # https://unix.stackexchange.com/a/218947/453686
  usage=`ps -o pid,ppid,pgid,comm,%cpu,%mem  -u ${USER} | grep ${MY_PID} | awk '{memory+=$6;cpu+=$5} END {print memory,cpu}'`
  echo ${usage} >> ${resource_file}
done
```
