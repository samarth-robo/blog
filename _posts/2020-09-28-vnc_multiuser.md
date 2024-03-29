---
layout: post
title:  "Ubuntu 18.04 multi-user VNC access (Part 1)"
tags: [remote_work]
---

**NOTE**: This post also has a [Part 2]({{ site.baseurl }}{% post_url 2021-06-21-vnc_multiuser_2 %}) which configures multi-user VNC to work through reboots.

Working from home? Chances are you need to see something visually on your office workstation. As I have said
[before](https://samarth-robo.github.io/blog/2020/04/21/chrome_remote_desktop.html) Google Chrome Remote Desktop
is great for this. But alas, some companies block it.

In that case, you need to set up your own VNC server on your office workstation, and install a client on your home computer. One important property I like in
the VNC server is that it should connect to the current ongoing X session rather than creating a new X session every time you connect from the client.
This allows windows to persist between connections, essentially as if you were directly at your office workstation. There are great tools to allow this, but in
my experience there are not enough clear explanatory articles that allow inexperienced users to get painlessly setup. Once you gain some experience, you can
make these tools do amazing things, because the tools themselves have detailed technical documentation.

Firstly, we want to avoid anything that creates its own X session, or requires a desktop environment different from what you currently have. So we don't want
[TigerVNC](https://wiki.archlinux.org/index.php/TigerVNC). What we want is [x11vnc](https://github.com/LibVNC/x11vnc). It essentially captures the current screen
and sends it over the network. `x11vnc` is amazingly well documented, but has a steep learning curve.

For Ubuntu, I found that the packaged binaries did not work. I had to compile from source from the [GitHub repository](https://github.com/LibVNC/x11vnc)
but the [instructions](https://github.com/LibVNC/x11vnc#building-x11vnc) worked well.

Next, you want to make sure `x11nvc` starts automatically every time you log in. Combining knowledge [from a](https://wiki.archlinux.org/index.php/TigerVNC)
[few](https://wiki.archlinux.org/index.php/Systemd/User) [forum](https://wiki.archlinux.org/index.php/Systemd#Using_units)
[pages](https://bbs.archlinux.org/viewtopic.php?id=230545) shows that you can use the `systemctl` method to set up a service in the "user" mode. This service is
not system-wide, it only activates when the user logs in after booting the computer (thus creating the X session which will be relayed by `x11vnc`). To do this,
place the following content in `~/.config/systemd/user/x11vnc.service`:

```
[Unit]
Description=Remote desktop service (VNC)

[Service]
Type=simple
# wait for Xorg started by ${USER}
ExecStartPre=/bin/sh -c 'while ! pgrep -U "$USER" Xorg; do sleep 2; done'
ExecStart=/usr/local/bin/x11vnc -rfbport 5900 -localhost -find -forever -clip 3840x2160+0+1141 -auth guess -rfbauth %h/.vnc/passwd
# or login with your username & password
#ExecStart=/usr/bin/x0vncserver -PAMService=login -PlainUsers=${USER} -SecurityTypes=TLSPlain

[Install]
WantedBy=default.target
```

Some explanation:
- The line `ExecStartPre=/bin/sh -c 'while ! pgrep -U "$USER" Xorg; do sleep 2; done'` waits for the X session to be created i.e. user to log in once. So you
**will** need to be physically present at your office workstation when you boot/reboot it, to log in. If you are a single user, you can set it to automatically
log in and set the screen to lock after 5 minutes of inactivity. That will eliminate the need for you to be there at reboots.
- `/usr/local/bin/x11vnc -rfbport 5900 -localhost -find -forever -clip 3840x2160+0+1141 -auth guess -rfbauth %h/.vnc/passwd` is the main x11vnc command:
  - `/usr/local/bin/x11vnc` is the full path to the binary. So you should do a `sudo make install` after compiling `x11vnc` from source. Or you can modify
  this path to wherever you installed the binary (e.g. somewhere in your home folder if you don't have sudo permissions).
  - `-rfbport 5900`: 5900 is the port number that your VNC client will need to connect to. In a multi-user setup,
  don't forget to assign a different port number for each user.
  - `-localhost` indicates that `x11vnc` should only accept connections coming from `localhost`. But you want to connect from a remote client! We will still use
  localhost because we want the connection to be encrypted (VNC protocol by itself sends everything unencrypted) by
  [SSH tunneling](https://www.ssh.com/ssh/tunneling/). This means we will forward port 5900 on the office workstation to port 5900 on our local client through
  an SSH connection, and then point the local VNC client to `http://localhost:5900`. You can set up this SSH tunnel by executing the following command in a 
  terminal on your client computer: `ssh -N -L 5900:localhost:5900 <office-workstation-hostname>`.
  - `-clip 3840x2160+0+1141` is used to clip the X buffer in case of a multi-motinor setup. To get correct values for clipping, run `x11vnc` without the clip 
  argument. It will print out the clipping information for each monitor when it is starting up.
  - `-rfbauth %h/.vnc/passwd` adds another layer of security by requiring a password to establish the VNC connection. For this, you will need to run
  `x11vnc -storepasswd` once and set the password. This will store the hashed password in `~/.vnc/passwd`.
  
OK, so once you have created the password and determined clipping dimensions, you can enable the service by `systemctl --user enable x11vnc.service`.
This is necessary before starting the service, it also makes the service run automatically everytime the computer is rebooted. Next, start the service by
`systemctl --user start x11vnc.service`. Check the status: `systemctl --user status x11vnc.service`:

```
● x11vnc.service - Remote desktop service (VNC)
   Loaded: loaded (/home/@@@/.config/systemd/user/x11vnc.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2020-09-28 16:28:29 PDT; 1s ago
  Process: 23499 ExecStartPre=/bin/sh -c while ! pgrep -U "$USER" Xorg; do sleep 2; done (code=exited, status=0/SUCCESS)
 Main PID: 23501 (x11vnc)
   CGroup: /user.slice/user-1002.slice/user@1002.service/x11vnc.service
           └─23501 /usr/local/bin/x11vnc -rfbport 5900 -localhost -find -forever -clip 3840x2160+0+1141 -auth guess -rfbauth /home/@@@/.vnc/passwd

Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: 28/09/2020 16:28:29
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: 28/09/2020 16:28:29 initialize_screen: fb_depth/fb_bpp/fb_Bpl 24/32/2560
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: 28/09/2020 16:28:29
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: 28/09/2020 16:28:29 Listening for VNC connections on TCP port 5900
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: 28/09/2020 16:28:29 Listening for VNC connections on TCP6 port 5900
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: 28/09/2020 16:28:29 listen6: bind: Address already in use
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: 28/09/2020 16:28:29 Not listening on IPv6 interface.
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: 28/09/2020 16:28:29
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: The VNC desktop is:      @@@-desk2:0
Sep 28 16:28:29 @@@-desk2 x11vnc[23501]: PORT=5900
```

You are good to go! On a Mac remote client, I have had good experience connecting to VNC servers with the
[RealVNC Viewer](https://www.realvnc.com/en/connect/download/viewer/macos/).

The good thing about the method I described above is that it works for a multi-user computer, and **does not need sudo** permissions for any user!

## Special Instructions for Multi-User
Some users might connect and encounter a blank and unresponsive screen. This bugged me for a while, but [this answer](https://askubuntu.com/a/672000)
finally suggested the solution. It has to do with virtual terminals. Each user's X server starts in a different virtual terminal. In fact, you are changing
virtual terminals when you press `Alt+Ctrl+F1-8`, and can switch between users in this way! But even if the previous user to access their VNC connection
disconnected, the current virtual terminal will not be yours. So each user will need to know their virtual terminal number using `sudo fgconsole` (only needed 
once when the computer is rebooted). Unfortunately,
SSH has its own new virtual terminal, so you will have to run this from your real X session i.e. while physically present in front of your computer. When you
want to connect to VNC, change the current virtual terminal to yours using `sudo chvt <your virtual terminal number>` (this does work over SSH!).

Because of this virtual terminal issue, multiple users will not be able to access their VNC connections simultaneously.


## Limitations
The above method requires each user to log in physically at least once, so that the user-level `systemctl` services start. It also does not work if the computer
is rebooted. [Part 2]({{ site.baseurl }}{% post_url 2021-06-21-vnc_multiuser_2 %}) solves these issues.
