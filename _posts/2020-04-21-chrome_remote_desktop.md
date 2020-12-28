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

## Un-freezing the Chrome Remote Desktop server
If you don't connect to your remote computer for a few days, you might find that you are no longer able to connect to it. It will show up as 'Online' in your local Chrome Remote Desktop screen, but the connection might not go through. To solve this, SSH into your remote computer, and reload the server config:
```
/opt/google/chrome-remote-desktop/chrome-remote-desktop --reload
``` 
