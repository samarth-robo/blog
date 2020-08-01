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
    extensions: ["AMSmath.js", "AMSsymbols.js", "AMScd.js"],
    TagSide: "left",
    Macros: {
      homo: ['\\ensuremath{\\tilde{\\mathbf{#1}}}', 1],
      norm: ['\\ensuremath{\\vert \\vert #1 \\vert \\vert}', 1],
      dv:   ['\\ensuremath{\\frac{d #1}{d #2}}', 2],
      pdv:  ['\\ensuremath{\\frac{\\partial #1}{\\partial #2}}', 2],
      ensuremath: '',
    }
  }
});

// DEBUG
MathJax.Ajax.loadComplete("http://localhost:4000/blog/assets/js/MathJaxLocal.js");
// DEPLOY
MathJax.Ajax.loadComplete("https://samarth-robo.github.io/blog/assets/js/MathJaxLocal.js");