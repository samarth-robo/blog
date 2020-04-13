---
layout: mathpost
title:  "Image Inpainting"
tags: [vision]
---

```
tl_im = np.asarray([j[0]-self.kernel_size//2, j[1]-self.kernel_size//2])
br_im = np.asarray([j[0]+self.kernel_size//2, j[1]+self.kernel_size//2])
tl_k  = np.asarray([0, 0], dtype=np.int)
br_k  = np.asarray([len(self.k), len(self.k)], dtype=np.int)
tl_spill = np.minimum(0, tl_im)
tl_im -= tl_spill
tl_k  -= tl_spill
br_spill = np.maximum(0, br_im-self.imsize)
br_im -= br_spill
br_k  -= br_spill
imj[tl_im[1]:br_im[1], tl_im[0]:br_im[0], idx] = \
  self.k[tl_k[1]:br_k[1], tl_k[0]:br_k[0]]
```

[(page source)](https://github.com/samarth-robo/blog/blob/gh-pages/_posts/image_inpainting.md)
