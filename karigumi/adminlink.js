/* ================================================================
   ページの下に「管理ページへ」のボタンをお出しします
   ----------------------------------------------------------------
   ・どのページにも同じものが出ます
   ・押すと管理ページへ移り、その方の段階に合った内容が出ます
   ・段階が足りない方には、ご案内をお出ししてお戻しします
   ・管理ページそのものでは出しません
================================================================ */
(function () {
  /* 管理ページ・クリエマップでは出しません */
  var here = location.pathname;
  if (here.indexOf("kanri-x7k2m9") >= 0 || here.indexOf("creamap-x7k2m9") >= 0) return;

  function build() {
    /* 育成フォルダの中にいるかで、道すじを変えます */
    var inIkusei = here.indexOf("/ikusei/") >= 0;
    var url = (inIkusei ? "./" : "./ikusei/") + "kanri-x7k2m9.html";
    if (here.indexOf("/first-support/") >= 0) url = "../ikusei/kanri-x7k2m9.html";

    var css = document.createElement("style");
    css.textContent = ''
      + '.sky-adminbar{max-width:520px;margin:0 auto;padding:22px 16px calc(env(safe-area-inset-bottom) + 26px);'
      + 'border-top:1px solid rgba(110,95,181,.14);}'
      + '.sky-adminbar a{display:flex;align-items:center;justify-content:center;gap:8px;'
      + 'padding:14px;border-radius:13px;background:#EDEAF9;color:#6E5FB5;'
      + 'text-decoration:none;font-family:"Zen Maru Gothic","Noto Sans JP",sans-serif;'
      + 'font-weight:700;font-size:14.5px;transition:.15s;}'
      + '.sky-adminbar a:active{background:#DED9F2;}';
    document.head.appendChild(css);

    var box = document.createElement("div");
    box.className = "sky-adminbar";
    box.innerHTML = '<a href="' + url + '">🔐 管理ページへ</a>';

    /* ページのいちばん下（すべての内容の後ろ）に置きます */
    document.body.appendChild(box);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
