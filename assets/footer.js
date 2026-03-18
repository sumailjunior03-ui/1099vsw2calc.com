// footer.js — footer initialization (current framework)
(function () {
  function setText(id, txt) {
    document.querySelectorAll("#" + id).forEach(function (el) {
      el.textContent = txt;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setText("copyrightYear", String(new Date().getFullYear()));
    setText("partnersEmail", "partnerships@calc-hq.com");
  });
})();
