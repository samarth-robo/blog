MathJax.Hub.Config({
  jax: ["input/TeX", "output/HTML-CSS"],
  tex2jax: {
    inlineMath: [['$', '$']],
    displayMath: [['$$', '$$'],['\\[','\\]']],
    processEscapes: true,
    skipTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
  },
  messageStyle: "none",
  "HTML-CSS": { preferredFont: "TeX", availableFonts: ["STIX","TeX"] },
  TeX: {
    equationNumbers: { autoNumber: "AMS" },
    extensions: ["AMSmath.js", "AMSsymbols.js","AMScd.js"],
    TagSide: "left",
    Macros: {      
      homo: ['\\ensuremath{\\tilde{\\mathbf{#1}}}', 1],
      ensuremath: '',
    }
  }
});

MathJax.Ajax.loadComplete("https://samarth-robo.github.io/blog/assets/js/MathJaxLocal.js");
