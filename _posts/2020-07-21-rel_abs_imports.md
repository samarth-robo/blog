---
layout: post
title: "Relative and absolute imports in Python3"
tags: coding
---

This always confuses me. When can I use relative imports (`from ..module.misc import foo`)?
When do I have do use `python -m foo`? I do not like doing that.

These two SO answers are very helpful:
1. [Answer 1](https://stackoverflow.com/a/43859946/2469613)
2. [Answer 2](https://stackoverflow.com/a/16985066/2469613)

The crux is that relative imports are not allowed in the main module (code that you run from the command line without the `-m` switch, which I call "scripts"). I prefer running scripts from the root of the project directory, like `python scripts/script1.py`.

There are two possible solutions.
1. Organize all your importable content in subdirectories under your scripts directory.
```
scripts/
scripts/script1.py
scripts/script2.py
scripts/module1/__init__.py
scripts/module1/foo.py
...
scripts/moduleN/__init__.py
scripts/moduleN/bar.py
```
Then in `scripts/script1.py` you can do `from module1 import foo`, and run `python scripts/script1.py`.

2. If you **need** to have sibling directories like
```
base/
base/scripts/script1.py
base/scripts/script2.py
base/module1/__init__.py
base/module1/foo.py
...
base/moduleN/__init__.py
base/moduleN/bar.py
```
then you need an `init_paths.py` in `scripts`, containing `import sys; sys.path.append('.')`. Note the `.`, not `..`. This is because I intend to run scripts from `base` like `python scripts/script1.py`, so `base` will be in Python's `sys.path`. 

3. Run with `python -m`. I do not consider this as an option because I dislike it.