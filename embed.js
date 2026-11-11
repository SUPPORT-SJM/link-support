/* ================================================================
   ポップアップの中にページを出すとき（?embed=1）の見せ方（仮組み v1.2.007）
   ・戻るボタン・メニューなどを隠して、中身だけを見せます
   ・?part=xx があると、data-part に xx を持つところだけを出します（印のないところは出したまま）
================================================================ */
(function(){
  var q = location.search;
  if(!/[?&]embed=1/.test(q)) return;
  document.documentElement.classList.add("embed");
  var m = q.match(/[?&]part=([\w-]+)/);
  var hide = ["a.back-btn","a.back-btn2","a.back",".skym-btn",".skym-home",".skym",".skym-bg","#skyDbgBtn",".beta-bar",".beta-foot","[data-embed-hide]"];
  var css = hide.map(function(x){ return "html.embed body " + x; }).join(",") + "{display:none !important;}"
          + "html.embed body{padding-top:10px !important;}html.embed body .hero{margin-right:0 !important;}";
  if(m) css += "html.embed body [data-part]:not([data-part~='" + m[1] + "']){display:none !important;}";
  var st = document.createElement("style"); st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();
