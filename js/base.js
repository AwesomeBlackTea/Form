(function() {
  var p = location.pathname;
  var base = location.origin + (p.endsWith("/") ? p : p.replace(/\/[^/]*$/, "") + "/");
  document.write("<base href=\"" + base + "\">");
})();
