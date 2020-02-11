---
layout: post
title:  "Fix a corrupt Hard Disk"
tags: [review, cv]
---
Sometimes, hard-disks (HDDs) have hiccups. This post mentions some common steps I use to get out of such situations.

0. Check if you indeed have a HDD problem. A common symptom is if `touch test` or simple I/O commands like that hang up and cannot be killed.
Such processes show up with a "D" status in `htop`, and they cannot be interrupted with even with `SIGKILL`.
You will also not be able to `umount` the disk.

1. If you reboot the computer at this stage, it will get stuck in an `fsck` check while booting and never get past that.
So the best is to remove the HDD's entry from `/etc/fstab`, and unplugging the HDD *before* rebooting.
If you forgot to do that, Ubuntu will usually put you into a root shell after showing something like
"Welcome to emergency mode". Use this to remove the `fstab` entry for the HDD, unplug the HDD, and then `reboot`.

2. Now you should be 

Emergency mode -> edit fstab -> reboot

sudo fdisk -l

sudo ntfsfix /dev/"device name"

Windows chkdsk

https://askubuntu.com/a/901307
