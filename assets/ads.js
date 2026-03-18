// ads.js — ad slot initialization (current framework)
// Ad slots are inactive by default; this file exists for framework compliance
// and future activation without structural changes to HTML.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var slots = document.querySelectorAll(".ad-slot[data-active='true']");
    slots.forEach(function (slot) {
      // Placeholder: activate slot rendering when data-active is true
      slot.setAttribute("aria-hidden", "false");
    });
  });
})();
