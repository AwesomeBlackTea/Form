(function() {
  var themeBtn = document.getElementById("themeBtn");
  if (!themeBtn) return;
  themeBtn.onclick = function() {
    document.body.classList.toggle("dark");
    themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  };
  themeBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
})();
