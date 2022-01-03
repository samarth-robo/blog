---
layout: post
title:  "RGB-D Rendering in Unity"
tags: [simulation, robotics, unity]
---

[**Example Unity Project** (GitHub)](https://github.com/samarth-robo/unity_rgbd_rendering)

[Unity ML-Agents](https://github.com/Unity-Technologies/ml-agents) can be used to create simulation environments for
Reinforcement Learning projects. Unity's [perception package](https://github.com/Unity-Technologies/com.unity.perception)
offers tool to create labelled synthetic images, but **depth** is not one of the labels currently supported. Here I will
discuss a simple method I pieced together from various blog posts and forum answers. The perspective is that of someone
who does not know much about the rendering pipeline.

# Some Unity terms
- Camera: class with camera instrinsic and extrinsic parameters.
- RenderTexture: the 2D (possibly multichannel) buffer on which the camera renders the 3D world.
- Material and Shader: Material is a bunch of parameters (colors, numbers, images and maps /which are also images/)
together. Shader is the piece of code which applies these parameters on the thing you render on a way which is usually
predetermined. Materials have the settings called "shader", so if you choose a material, you choose a shader. From
[this answer](https://forum.unity.com/threads/shaders-vs-materials.628672/#post-4210990).

# Rendering RGB-D
- Create a Camera, configure it with intrinsic parameters and position it in your environment. Make sure its
`Culling Mask` has the layers your want to render. Choose `Depth only` instead of `Skybox` for the `Clear Flags`. Skybox
rendering can occlude the scene rendering, as mentioned in [this forum answer](https://forum.unity.com/threads/subshader-with-zwrite-off-visible-in-scene-view-but-not-in-game-preview.269379/#post-2747693).
- In your C# code, get the Camera GameObject and set `Camera.depthTextureMode = DepthTextureMode.Depth` following
[this doc](https://docs.unity3d.com/Manual/SL-CameraDepthTexture.html), which makes the `_CameraDepthTexture` variable
available to the shader of the material this camera uses for rendering.
- Create a RenderTexture (see [this forum thread](https://forum.unity.com/threads/rendertexture-to-texture2d-too-slow.693850/)
for an excellent description of RenderTexture vs. Texture2D vs. Texture). The color format can be anything with RGBA
float channels, I use `R32G32B32A32_SFLOAT`.
- **Important**: Set the `Depth Buffer` to `At least 24 bits depth (with stencil)`. Absence of a depth buffer in the
RenderTexture prevents Z-buffering, and all objects will be rendered regardless of opacity and occlusion.
- Set this RenderTexture as the `Target Texture` of the Camera.
- Next, create a Material and a Shader. Replace the Shader code with the one given below, and set it as the Material's
shader. Tip: the shader will not be visible in the Material's drop-down menu if its name (mentioned at the top of the
shader code) starts with `Hidden/`. So I made it `Unlit/RGBDShader`.
- Finally, in a script attached to the same GameObject as the Camera, get the Material, and have the following
function:

```cs
public class YourClassName : MonoBehaviour
{
  void Start()
  {
    // get material here
  }

  // any other functions here

  void OnRenderImage(RenderTexture source, RenderTexture destination)
  {
    Graphics.Blit(source, destination, this.material);
  }
}
```

# RGB-D Shader
```
Shader "Unlit/RGBDShader"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
    }
    SubShader
    {
        Cull Back ZWrite On ZTest LEqual

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
            };

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }

            sampler2D _MainTex;
            sampler2D _CameraDepthTexture;

            fixed4 frag (v2f i) : SV_Target
            {
                fixed4 col = tex2D(_MainTex, i.uv);
                float depth = Linear01Depth(tex2D(_CameraDepthTexture, i.uv).r);
                return fixed4(col.rgb, depth);
            }
            ENDCG
        }
    }
}
```

The last part (fragment shader) is the most important. It puts the depth value (normalized to a `[0, 1]` range)
in the alpha channel of the rendered image.

# Using the RGB-D image
Example code:

```cs
Camera cam = GetComponent<Camera>();
render_tex = cam.targetTexture;
W = render_tex.width;
H = render_tex.height;
far_clip = cam.farClipPlane;

// we will get the RGB-D image in this Texture2D on the CPU
rgbd_im = new Texture2D(W, H, TextureFormat.RGBAFloat, false);

// GPU -> CPU
RenderTexture prev = RenderTexture.active;
RenderTexture.active = render_tex;
rgbd_im.ReadPixels(new Rect(0, 0, W, H), 0, 0);
RenderTexture.active = prev;
```

# Other sources I found useful
- [Ronja's tutorial on Unity depth postprocessing](https://www.ronja-tutorials.com/post/017-postprocessing-depth/)
- https://forum.unity.com/threads/adding-detph-to-channel-alpha.956193/
- https://forum.unity.com/threads/rendertexture-with-both-rgb-and-depth.642049/
- [Catlike Coding's Unity tutorials](https://catlikecoding.com/unity/tutorials/)
