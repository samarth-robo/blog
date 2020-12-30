---
layout: post
title:  "Transferring Files from Action Cameras to Computers"
tags: [misc,hardware,macos]
---

I was recently gifted an "action camera": the
[Akaso EK7000 Pro](https://www.akasotech.com/ek7000pro-buy). You might have
heard of the more famous action camera, the GoPro. GoPro has tools to transfer
videos to the computer, but some other action cameras lack this functionality.

Akaso E7000 Pro (and many other digital cameras including almost all mainstream
DSLRs) operate the
[Picture Transfer Protocol](https://en.wikipedia.org/wiki/Picture_Transfer_Protocol)
(PTP) over USB and/or IP.

If your camera only has an IP interface, it typically sets up its own WiFi network
and allows a single PTP client to connect. If you don't know the IP, and have an
iPhone, follow these steps:

- Install the connecting app (e.g. iSmart DV for Akaso cameras) on the phone
- Start WiFi on the camera and connect the phone to it
- At the same time, connect the phone to your Mac computer with USB
- Set up capture on the computer of packets that the phone communicates. This
is done
[using `rvctl`](https://developer.apple.com/documentation/network/recording_a_packet_trace)
- Install [WireShark](https://www.wireshark.org) on your computer and point it
to the interface (typically called `rvi0`) created by `rvctl`
- Look at the packet addresses as the phone app communicates with the camera
to get the IP address of the camera

Now disconnect your phone and connect the computer to the camera's WiFi network.

Since the camera operates PTP/IP, you can use [gphoto2](http://gphoto.org) on the
computer to communicate with it. You need to first install
[libgphoto2](https://github.com/gphoto/libgphoto2) and then the
[gphoto2](https://github.com/gphoto/gphoto2) frontend which links to `libgphoto2`.
Then, use the following commands:

```bash
# print camera info summary
$ gphoto2 --port ptpip:<camera_ip> --summary
# list all files in the camera memory
# outputs 
# #1: <file1 info>
# #2: <file2 info> and so on...
$ gphoto2 --port ptpip:<camera_ip> --list-files
# get file #2
$ gphoto2 --port ptpip:<camera_ip> --get-file 2
# get all files
$ gphoto2 --port ptpip:<camera_ip> --get-all-files
# print help
$ gphoto2 --help
```
