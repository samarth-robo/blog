---
layout: post
title:  "Setting Up VSCode with ROS"
tags: [remote_work]
---

Working from home? [VSCode](https://code.visualstudio.com) is one of the best IDEs out there (they claim it is an "editor", but with proper extensions it becomes a full-blown IDE). [Remote work with SSH](https://code.visualstudio.com/docs/remote/ssh) is my favorite VSCode feature. It allows you to edit code locally but compile and run it on a remote server. All you need is an SSH connection. Everything works super smoothly.

# C++
Lately I have been developing ROS C++ code with this setup. Since ROS uses the `catkin` build system, it can be a little difficult to configure the C++ IntelliSense (code navigation, auto-complete, etc.).

[This blog post by Erdal](https://erdalpekel.de/?p=157) gives nice step-by-step instructions.

I had to make one change, though: Instead of creating the new `catkin_make` task, I used the default `catkin: make` task that the VSCode ROS extension automatically creates.

For IntelliSense to work, CMake in the `catkin: make` task needs to be configured to generate `compile_commands.json`, as the blog mentions. But the `catkin: make` task command cannot be edited. However, it simply runs `catkin build` (or `catkin_make`, whichever command you normally use to build ROS workspaces) under the hood. So I pre-configure catkin for my ROS workspace like so:

```bash
$ cd catkin_ws
$ catkin config -a --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=1
```

Note that I use [`catkin-tools`](https://catkin-tools.readthedocs.io/), not the simple `catkin` that ships with ROS.

The above command caches the `CMAKE_EXPORT_COMPILE_COMMANDS` CMake argument in the catkin configuration. As mentioned in the blog, this CMake argument causes it to create `compile_commands.json` in `catkin_ws/build/<package_name>/`. If you point IntelliSense to this file using the `compileCommands` field in `c_cpp_properties.json` as mentioned in the blog, everything works :)

# Python
- Use the new [Pylance](https://devblogs.microsoft.com/python/announcing-pylance-fast-feature-rich-language-support-for-python-in-visual-studio-code/)
Python language server. Microsoft has shifted its efforts to that instead of the default Python languager server.
- Make sure you follow [ROS recommendations](http://docs.ros.org/en/api/catkin/html/howto/format2/installing_python.html#modules) for Python
nodes and moduled inside packages, and build the workspace once (e.g. using the `catkin: make` task discussed above).
- Add your package path to Pylance's search paths in `settings.json`: `"python.analysis.extraPaths" = ["<path_to_ws>/src/<package_name>/src/<package_name>/src"]`. Currently (Dec 2020), variable substitution like `${workspaceFolder}` is not supported so you will have to use the full path.
- Disable linting: `"python.linting.enabled": false`. I think linting is not very useful, and Pylance does a lot of convenience tasks anyway. If you do want
linting, you will need to modify `~/.pylintrc` as [mentioned in this SO comment](https://stackoverflow.com/questions/43574995/visual-studio-code-pylint-unable-to-import-protorpc#comment106946541_55915465).
