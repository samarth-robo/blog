---
layout: post
title:  "Ubuntu 18.04 multi-user VNC access (Part 2)"
tags: [remote_work]
---

We will use [`x11vnc`](https://github.com/LibVNC/x11vnc) to set up remote VNC access of an Ubunutu computer for multiple users. This setup

- works through reboots
- never needs physical presence at the computer
- assumes one user with sudo permissions (called `BIGUSER`), and multiple other users without sudo permissions (called `SMALLUSER`)

Please read [Part 1]({{ site.baseurl }}{% post_url 2020-09-28-vnc_multiuser %}) for `x11vnc` and `systemctl` basics.

## How to handle reboots?

On Ubuntu 18.04, the Gnome display manager `gdm` itself runs an X server, which presents the login screen to all users.
Once a user enters their credentials, they are transferred to their own X server. We will mimic this process: create
`x11vnc` servers for each user (on different ports) that present this login X server over the network. Once a user
enters their credentials and their own X server is started, we will kill the old login `x11vnc` server and transfer them
to another `x11vnc` server that presents this new X server.

## Setup

For each user (`BIGUSER` or `SMALLUSER`), `BIGUSER` creates a pair of `systemctl` service files:

```
$ cat /etc/systemd/system/x11vnc-gdm-USER.service
[Unit]
Description=Start x11vnc at startup.
After=display-manager.service

[Service]
ExecStart=/usr/bin/x11vnc -many -shared -display :0 -auth /run/user/121/gdm/Xauthority -noxdamage -rfbauth /home/USER/.vnc/passwd -rfbport PORT -o /home/USER/.vnc/gdm-log.txt
Restart=on-failure
RestartSec=3

[Install]
WantedBy=graphical.target
```

and

```
$ cat /etc/systemd/system/x11vnc-gnome-shell-USER.service
[Unit]
Description=x11vnc server for Gnome shell session of USER

[Service]
User=USER
Type=simple
ExecStartPre=/bin/sh -c 'while ! pgrep -U "USER" Xorg; do sleep 2; done'
ExecStartPre=+/bin/systemctl stop x11vnc-gdm-USER.service
ExecStart=/bin/sh -c '/usr/bin/x11vnc -forever -shared -find -auth /home/USER/.Xauthority -clip 3840x2160+0+856 -rfbauth /home/USER/.vnc/passwd -rfbport PORT -o /home/USER/.vnc/gnome-shell-log.txt'
Restart=on-failure
RestartSec=3

[Install]
WantedBy=graphical.target
```

Notes:
- The first service file is for the login `x11vnc` and the second one for the post-login `x11vnc`. See [Part 1]({{ site.baseurl }}{% post_url 2020-09-28-vnc_multiuser %})
to understand how services work and the `x11vnc` commandline options.
- Remember to change for each user: `USER` (username), `PORT` (5900, 5901, 5902 etc. separate port for each user but same for both files), `-clip` (screen offsets for each user).
- Notice how the second service waits while the user's X server is created, and then kills that user's login `x11vnc` server.
- Eventhough `SMALLUSER`s cannot sudo, the `+` in `ExecStartPre` allows the `/bin/systemctl stop x11vnc-gdm-USER.service` to run with full privileges.
- Next, `BIGUSER` runs `sudo visudo` and adds the following lines (one per `SMALLUSER`) at the end of the file:
```bash
SMALLUSER ALL=(ALL) NOPASSWD: /bin/fgconsole, /bin/chvt
```
- This allows `SMALLUSER` to run `fgconsole` and `chvt` as sudo, which are useful for switching between users as described at the end of
[Part 1]({{ site.baseurl }}{% post_url 2020-09-28-vnc_multiuser %}).

Finally, `BIGUSER` enables and starts both services for each user:

```bash
$ sudo systemctl enable x11vnc-gdm-USER.service
$ sudo systemctl start x11vnc-gdm-USER.service 
$ sudo systemctl enable x11vnc-gnome-shell-USER.service
$ sudo systemctl start x11vnc-gnome-shell-USER.service
```

## Next Steps

See [Part 1]({{ site.baseurl }}{% post_url 2020-09-28-vnc_multiuser %}) for SSH tunneling from your local computer
to the services running on the remote computer, and then controlling the remote computer using the 
[RealVNC Viewer](https://www.realvnc.com/en/connect/download/viewer/macos/).
