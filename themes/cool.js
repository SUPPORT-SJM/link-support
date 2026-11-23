/* ================================================================
   デザイン：クールビジネステーマ（v1.2.157）の動き
   ----------------------------------------------------------------
   ・丸がふわふわ並ぶページ（#stage の中の .bub）を、手帳のカードの一覧に並べかえます
   ・カードを押すと、もとの丸を押したのと同じ動き（ページへ移る・ポップアップを開く）になります
   ・トップページ（index.html）は、ページの中に専用の並べ方（renderCool）があるので、ここでは何もしません
================================================================ */
(function () {
  if (document.documentElement.getAttribute("data-sky-theme") !== "cool") return;
  function run() {
    if (document.getElementById("cool")) return;   /* トップページ */
    var stage = document.getElementById("stage");
    if (!stage) return;
    var bubs = Array.prototype.filter.call(stage.querySelectorAll(".bub"), function (b) { return !b.classList.contains("back-btn") && !b.classList.contains("sun"); });
    if (!bubs.length) return;
    var back = stage.querySelector(".back-btn, .sun") || document.querySelector(".back-btn");
    var ttlEl = document.querySelector(".ttl h1, .ttl, h1");
    var title = ttlEl ? ttlEl.textContent.replace(/\s+/g, " ").trim() : document.title;
    var esc = function (t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
    var h = '<div class="cb-book"><div class="cb-head"><button type="button" class="cb-back" id="cbBack">↩️ もどる</button><h2 class="cb-title">' + esc(title) + '</h2></div>';
    bubs.forEach(function (b, i) {
      var ic = b.querySelector(".ball"), nm = b.querySelector(".nm");
      h += '<button type="button" class="cb-card" data-i="' + i + '"><span class="ball">' + (ic ? ic.innerHTML : "") + '</span>'
        + '<span class="tx"><span class="nm">' + esc(nm ? nm.textContent.replace(/\s+/g, "") : "") + '</span></span><span class="ar">›</span></button>';
    });
    h += '</div>';
    var box = document.createElement("section");
    box.className = "cool cool-page";
    box.innerHTML = h;
    stage.parentNode.insertBefore(box, stage);
    document.body.classList.add("cb-list");
    box.querySelectorAll(".cb-card").forEach(function (c) {
      c.addEventListener("click", function () { var b = bubs[+c.dataset.i]; if (b) b.click(); });
    });
    var bb = document.getElementById("cbBack");
    bb.addEventListener("click", function () {
      if (back && back.click) back.click();
      else history.back();
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
