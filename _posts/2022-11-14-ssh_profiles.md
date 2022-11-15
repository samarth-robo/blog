---
layout: post
title:  "Multiple SSH profiles"
tags: [remote_work, misc]
---

If you have a work GitHub account in addition to a personal one, you most probably need to clone, pull from, and push to
from repositories with multiple different
[SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh). This post talks about how to
manage them.

The main issue is that GitHub does not allow the same SSH key to be used in multiple user accounts. So if the SSH key
you use in your personal account is at `~/.ssh/id_rsa`, then generate a new one for your work using `ssh-keygen`. In
that process, when it asks you the path where that key should be created, give `~/.ssh/work_key`. Add this key to your
work GitHub account.

Put all your work repositories in one directory, for example `~/work`. Next, add the following lines to `~/.gitconfig`:

```
[includeIf "gitdir:~/work"]
  [user]
    email = <YOUR WORK EMAIL ADDRESS>
    name = <YOUR WORK NAME>
  [core]
    sshCommand = ssh -i ~/.ssh/work_key
```

The config makes `git` SSH with the key in `~/.ssh/work_key` when cloning, pulling from, and pushing to repositories
whose `.git` directories are under `~/work`.