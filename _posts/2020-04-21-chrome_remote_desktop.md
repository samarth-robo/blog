---
layout: post
title:  "Chrome Remote Desktop Hacks"
tags: [remote_work]
---
Working remotely is essential in these COVID-19 times. I have found [Chrome Remote Desktop](https://remotedesktop.google.com/) to be very useful. Its competitor TeamViewer often flags academic use wrongly as commercial use, causing inconvenience. In this post, I want to write about two ways you can hack Chrome Remote Desktop to make it more productive for Linux.

First, you will of course need to get Google Chrome and set up Chrome Remote Desktop.

## Reconnect to existing X session
By default, it starts a new X session every time you connect to your remote computer. However, if your remote computer has an X session running, it is very useful to keep connecting to that one every time. This is what TeamViewer does, for example. After doing this, a `nautilus` window that you start in one Chrome Remote Desktop session will be there in the next session.

Follow the steps mentioned in [this StackExchange answer](https://superuser.com/a/850359).

## Un-freezing the Chrome Remote Desktop Server
If you don't connect to your remote computer for a few days, you might find that you are no longer able to connect to it. It will show up as 'Offline' in your local Chrome Remote Desktop screen, with a message 'Last online on <date>'. Or it might show up as 'Online', but the connection will not go through. To solve this, SSH into your remote computer, and reload the server config:
```
/opt/google/chrome-remote-desktop/chrome-remote-desktop --reload
``` 
  
## Re-starting the Chrome Remote Desktop Server
But if the computer shows up as offline with a message 'X server failed to start or crashed', that can mean:

1. X server is actually running, but your user has somehow been logged out. You can verify this by running `systemctl status display-manager.service` and verifying
that it shows `active(running)` in green somewhere in the output. To log into your user, you need an alternative way to access the X server, so that you can enter
your credentials and log in. You can use the following steps:
  - [Set up x11vnc]({{ site.baseurl }}{% post_url 2020-09-28-vnc_multiuser_1 %}) on your remote computer. Just compile and install `x11vnc`, no need to set up the
`systemctl` user service in `~/.config/systemd`
  - Run `x11vnc -auth guess` there. `-auth guess` uses the "MIT magic cookie" from your system-level display manager (e.g. `gdm`, `lightdm`) rather than your user-specific magic cookie. It will start a VNC server on your remote computer on port 5900. This is an unsecure passwordless server, so make sure you only run it temporarily!
  - Download a VNC client, like [RealVNC](https://www.realvnc.com/en/connect/download/viewer/) on your local computer
  - Point the VNC client to `<local-computer-name-or-ip>:5900`
  - If your VNC client is not able to make this connection, port 5900 is probably blocked on your remote computer. Establish a SSH tunnel between your local computer and remote computer's ports 5900 as mentioned in the [blog post]({{ site.baseurl }}{% post_url 2020-09-28-vnc_multiuser %}), and point your VNC client
to `localhost:5900` instead
  - The VNC client will bring you to the login screen of your display manager. Enter your password, log in, and then close the VNC connection. So now your user has been logged in to the X server. Closing the VNC connection will also cause the VNC server to shut down automatically
  - SSH into the remote computer and re-start Chrome Remote Desktop: `/opt/google/chrome-remote-desktop/chrome-remote-desktop --start`
  
2. X server is not running. I don't have much experience with this situation, but you could try restarting the X server with `sudo systemctl restart display-manager.service`
