/* ================================================================
   アクセス記録(どのページが見られたかを数えます)
   ----------------------------------------------------------------
   ・どなたが見たかは記録しません(会員番号や名前は送りません)
   ・端末の種類・ブラウザ・端末ごとの目印だけを送ります
   ・止めたいときは、各ページの <script src="...track.js"> を消してください
================================================================ */
(function () {
  var GAS = "https://script.google.com/macros/s/AKfycbzY2l20zwGULjnKRUqvRpbH79fPkl5e-sWNVoXEIgBrDpqhjDAx2zLvJuqO3sZxAfHj/exec";

  try {
    /* 端末ごとの目印(どなたかは分かりません。同じ端末かどうかを見るだけです) */
    var uid = localStorage.getItem("skyarc_uid");
    if (!uid) {
      uid = "u" + Math.random().toString(36).slice(2, 10);
      localStorage.setItem("skyarc_uid", uid);
    }

    var ua = navigator.userAgent || "";
    var device = /iPad|Tablet/i.test(ua) ? "タブレット"
               : /Mobile|Android|iPhone/i.test(ua) ? "スマホ" : "パソコン";
    var browser = /Line\//i.test(ua) ? "LINE内"
                : /CriOS|Chrome/i.test(ua) ? "Chrome"
                : /FxiOS|Firefox/i.test(ua) ? "Firefox"
                : /Edg/i.test(ua) ? "Edge"
                : /Safari/i.test(ua) ? "Safari" : "その他";

    /* ページ名(フォルダ+ファイル名) */
    var path = location.pathname.replace(/\/+$/, "/");
    var page = path.split("/").filter(Boolean).slice(-2).join("/") || "index";
    if (path.endsWith("/")) page = page + "/(トップ)";

    var q = "?action=track"
          + "&page=" + encodeURIComponent(page)
          + "&device=" + encodeURIComponent(device)
          + "&browser=" + encodeURIComponent(browser)
          + "&uid=" + encodeURIComponent(uid)
          + "&width=" + encodeURIComponent(window.innerWidth || 0);

    /* 表示を止めないよう、こっそり送ります */
    fetch(GAS + q, { method: "GET", mode: "no-cors", keepalive: true }).catch(function () {});
  } catch (e) { /* 記録できなくても、ページの表示には影響しません */ }
})();
