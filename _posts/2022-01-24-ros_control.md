---
layout: post
title:  "Write a ROS controller"
tags: [robotics, ros]
---

If you are writing a [ROS controller](http://wiki.ros.org/ros_control), that means you are working with a real robot.
Congratulations!

It involves a lot of boilerplate code, so this post describes the process step-by-step. We will focus
on the general process rather that the actual code of the controller. _See
[`franka_ros/franka_example_controllers/CartesianImpedanceExampleController`](https://github.com/frankaemika/franka_ros/blob/develop/franka_example_controllers/src/cartesian_impedance_example_controller.cpp)
for a concrete example_.

We will assume that you want to write `MyController` in the `eg_controller` [ROS package](http://wiki.ros.org/Packages),
which is in the `ws` [ROS workspace](http://wiki.ros.org/catkin/Tutorials/create_a_workspace). Directory structure
follows the [convention](http://wiki.ros.org/Packages#Common_Files_and_Directories).

- Header file `include/eg_controller/mycontroller.h` and source code `src/mycontroller.cpp` implement the
`eg_controller::MyController` class that inherits from
[`controller_interface::ControllerBase`](https://docs.ros.org/en/jade/api/controller_interface/html/c++/classcontroller__interface_1_1ControllerBase.html)
or a derivative thereof

- Build the shared library `libeg_controller` containing the `eg_controller::MyController` class
[using `CMakeLists.txt`](http://wiki.ros.org/catkin/CMakeLists.txt)

- You will probably have to `<depend>` on `controller_interface` and `hardware_interface` in `package.xml` to be able
to compile

- Put the following macro at the end of `src/mycontroller.cpp`. It allows the ROS control infrastructure
(specifically, [`controller_manager/spawner`](http://wiki.ros.org/controller_manager#spawner))
to dynamically load the `eg_controller::MyController` controller class using
[`ROS pluginlib`](http://wiki.ros.org/pluginlib/Tutorials/Writing%20and%20Using%20a%20Simple%20Plugin):

```cpp
PLUGINLIB_EXPORT_CLASS(eg_controller::MyController, controller_interface::ControllerBase)
```

- Also for ROS pluginlib: put the following XML in `ws/src/eg_controller/eg_controller_plugin.xml`. Note how it references
the shared library `libeg_controller` we compiled above.

```xml
<library path="lib/libeg_controller">
  <class name="eg_controller/MyController" type="eg_controller::MyController" base_class_type="controller_interface::ControllerBase">
    <description>
      Short description of MyController.
    </description>
  </class>
</library>
```

- Last step for ROS pluginlib: put the following XML at the end of `ws/src/eg_controller/package.xml`

```xml
<export>
  <controller_interface plugin="${prefix}/eg_controller_plugin.xml"/>
</export>
```

- Controller packages provide a YAML file describing the parameters their controllers use. Because controllers are
dynamically loaded classes only, and not their complete ROS nodes, it is not possible to pass command line arguments to them.
The only way to configure them is to load their parmeters to the ROS parameter server in the proper namespace. Then the
controller code can load them from that namespace. For example `ws/src/eg_controller/config/eg_controller.yaml`:

```yaml
mycontroller:
  type: eg_controller/MyController
  param1: 108
  param2:
    - tat
    - tvam
    - asi
```
This YAML file when loaded to the ROS parameter server will allow
[`controller_manager/spawner`](http://wiki.ros.org/controller_manager#spawner) to load the `mycontroller` controller.
`type` will allow it to look up the matching pluginlib entry, and the controller class can use the rest of the
parameters - `param1` and `param2` here

- For example, you can load this controller in a launch file like so:

```xml
<?xml version="1.0" ?>
<launch>
  <!-- load MyController's parameters -->
  <rosparam command="load" file="$(find eg_controller)/config/eg_controller.yaml" />
  <!-- load MyController -->
  <node name="controller_spawner" pkg="controller_manager" type="spawner" respawn="false" output="screen" args="myconroller"/>
</launch>
```

## Notes

- **Threading model**: [`controller_manager/spawner`](http://wiki.ros.org/controller_manager#spawner)), the actual node that loads
controllers, uses `rospy.spin()`. `rospy.spin()` has a complex threading model whose details are not well documented. Matthew Elwin
[has investigated them in detail](https://nu-msr.github.io/me495_site/lecture08_threads.html). The relevant part is that
_callbacks in the controller code can run in separate threads and are not thread-safe_. For example, see how
[`franka_ros/franka_example_controllers/CartesianImpedanceExampleController`](https://github.com/frankaemika/franka_ros/blob/develop/franka_example_controllers/src/cartesian_impedance_example_controller.cpp)
uses a mutex.
