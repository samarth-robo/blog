---
layout: post
title:  "Setting Up VSCode with ROS"
tags: [remote_work]
---

Working from home? [VSCode](https://code.visualstudio.com) is one of the best IDEs out there (they claim it is an "editor", but with proper extensions it becomes a full-blown IDE). [Remote work with SSH](https://code.visualstudio.com/docs/remote/ssh) is my favorite VSCode feature. It allows you to edit code locally but compile and run it on a remote server. All you need is an SSH connection. Everything works super smoothly.

# General Instructions
- Open the catkin workspace root directory in VSCode, instead of individual packages. This will help in compiling
everything together and code navigation.
- I had the habit of just symlinking various package directories in `catkin_ws/src` instead of actually having the code
thre. But VSCode has [bugs](https://github.com/microsoft/vscode/issues/116064) that prevent Git change detection and
code navigation for code that lives inside symlinks. So for ROS I now do not use symlinks inside `src`.

# C++
Lately I have been developing ROS C++ code with this setup. The
[VSCode ROS extension](https://marketplace.visualstudio.com/items?itemName=ms-iot.vscode-ros)
does most of the legwork like setting up include paths and IntellSense databases for ROS (code navigation, auto-complete, etc.).
However, it does not properly configure IntelliSense for the code *within* the package you are developing, so IntelliSense
functions for navigating the code under development don't work (as of 23 Jan, 2022).

[This blog post by Erdal](https://erdalpekel.de/?p=157) gives two crucial pieces of information:
- Those paths can be provided to IntelliSense using the `compileCommands` field in `c_cpp_properties.json`. Its value
should be the path to a `compile_commands.json` file.
- CMake i.e. the build system used under the hood by catkin can be configured to produce `compile_commands.json` with
the [`CMAKE_EXPORT_COMPILE_COMMANDS`](https://cmake.org/cmake/help/latest/variable/CMAKE_EXPORT_COMPILE_COMMANDS.html)
variable.

Next, we can use [Tim Redick](https://gist.github.com/Tuebel)'s
[`merge_compile_commands.sh`](https://gist.github.com/Tuebel/fd09c3c0f85c08bf417eecace16aecf3) script to merge the 
`compile.commands.json`s from various packages in the whole catkin workspace. I have reproduced it below, put it in
the root of your workspace.

```bash
#!/usr/bin/env bash
printf '[' > compile_commands.json
find ./build -type f -name 'compile_commands.json' -exec sh -c "cat {} | tail -n+2 | head -n-1 && printf ','" >> compile_commands.json \;
sed -i '$s/.$//' compile_commands.json
printf '\n]\n' >> compile_commands.json
```

Below is my `tasks.json` that aliases `catkin: build` by renaming it to `catkin_build` and creating another task
named `catkin: build` that depends on `catkin_build` and executes `merge_compile_commands.sh` afterwards. It also
has the `CMAKE_EXPORT_COMPILE_COMMANDS` CMake directive, and a `catkin: clean` task.

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "shell",
			"command": "catkin build --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=1"  // <- ADD OTHER CMAKE DIRECTIVES HERE
			"problemMatcher": [
				"$catkin-gcc"
			],
			"label": "catkin_build"
		},
		{
			"type": "catkin",
			"args": [
				"clean",
				"--yes"
			],
			"problemMatcher": [
				"$catkin-gcc"
			],
			"label": "catkin_clean"
		},
		{
			"command": "${workspaceFolder}/merge_compile_commands.sh",
			"type": "shell",
			"group": {
				"kind": "build",
				"isDefault": true
			},
			"label": "catkin: build",
			"problemMatcher": [],
			"dependsOn": [
				"catkin_build"
			]
		},
		{
			"command": "rm ${workspaceFolder}/compile_commands.json",
			"type": "shell",
			"problemMatcher": [],
			"group": "build",
			"label": "catkin: clean",
			"dependsOn": [
				"catkin_clean"
			]
		}
  ]
}
```

The only next step is to add `"compileCommands": "PATH_TO_WORKSPACE_ROOT/compile_commands.json"` to `.vscode/c_cpp_properties.json`.

# Python
- Use the new [Pylance](https://devblogs.microsoft.com/python/announcing-pylance-fast-feature-rich-language-support-for-python-in-visual-studio-code/)
Python language server. Microsoft has shifted its efforts to that instead of the default Python languager server.
- Make sure you follow [ROS recommendations](http://docs.ros.org/en/api/catkin/html/howto/format2/installing_python.html#modules) for Python
nodes and moduled inside packages, and build the workspace once (e.g. using the `catkin: make` task discussed above).
- Add your package path to Pylance's search paths in `.vscode/settings.json`: `"python.analysis.extraPaths" = ["<path_to_ws>/src/<package_name>/src/<package_name>"]`. Currently (Dec 2020), variable substitution like `${workspaceFolder}` is not supported so you will have to use the full path.
- Especially useful if your package generates messages, services, and actions: Add `FULL_PATH_TO_WS_ROOT/devel/lib/python2.7/dist-packages` to `python.analysis.extraPaths` and `python.autoComplete.extraPaths` in `.vscode/settings.json`.
- Disable linting: `"python.linting.enabled": false`. I think linting is not very useful, and Pylance does a lot of convenience tasks anyway. If you do want
linting, you will need to modify `~/.pylintrc` as [mentioned in this SO comment](https://stackoverflow.com/questions/43574995/visual-studio-code-pylint-unable-to-import-protorpc#comment106946541_55915465).
