/* ================================================================
   アクセス記録(どのページが見られたかを数えます)
   ----------------------------------------------------------------
   ・どなたが見たかは記録しません(会員番号や名前は送りません)
   ・端末の種類・ブラウザ・端末ごとの目印だけを送ります
   ・止めたいときは、各ページの <script src="...track.js"> を消してください
================================================================ */
(function () {
  var GAS = window.SKY_GAS_URL;   /* 共通設定（config.js）から受け取ります */

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

    /* ================================================================
       ページが出そろってから、静かに送ります
       ----------------------------------------------------------------
       開いた直後に送ると、表示のための読み込みと取り合いになり、
       ページが出るまで待たされてしまうためです。
    ================================================================ */
    var sent = false;
    function send() {
      if (sent) return;
      sent = true;
      /* 画像を1枚読みに行く形にします（応答を待ちません） */
      try {
        new Image().src = GAS + q + "&_=" + Date.now();
      } catch (e) {
        fetch(GAS + q, { method:"GET", mode:"no-cors", keepalive:true }).catch(function(){});
      }
    }

    /* 表示が終わってから、さらに少し待って送ります */
    function later() { setTimeout(send, 1200); }
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later);

    /* 開いてすぐ離れた場合にも、取りこぼさないようにします */
    window.addEventListener("pagehide", send);

  } catch (e) { /* 記録できなくても、ページの表示には影響しません */ }
})();
