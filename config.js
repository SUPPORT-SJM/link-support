/* ================================================================
   共通の設定（ここだけ書き換えれば、全ページに行きわたります）
   ----------------------------------------------------------------
   このファイルだけをアップし直せば、下の内容が全ページに反映されます。
   1ページ直すたびに全部アップする、という手間がなくなります。

   ※ ブラウザが古い内容を覚えていることがあります。
     変わらないときは、URLの後ろに ?v=196 などを付けて開いてください
================================================================ */

/* ---------------- ① バージョン ---------------- */
window.SKY_VERSION = "v1.100";
window.SKY_VERSION_DATE = "2026/08/18";

/* ---------------- ② GASのURL ----------------
   デプロイし直してURLが変わったときは、ここだけ書き換えてください */
window.SKY_GAS_URL = "https://script.google.com/macros/s/AKfycbzY2l20zwGULjnKRUqvRpbH79fPkl5e-sWNVoXEIgBrDpqhjDAx2zLvJuqO3sZxAfHj/exec";

/* ---------------- ③ 系列の一覧 ----------------
   系列が増えたり名前が変わったときは、ここだけ直してください */
window.SKY_KEIRETSU = [
  "🚀SkyExceed","🦅Zenith1","🏰Utop","🌟グローハピネス🌟","🥷HOT STUFF⚜️",
  "TELLUS.","FEAT","🌬️ザ・クラウドブルー(蒼雲)","✈️JET RISE","✨アフロディーテ",
  "⭐️ルミナス","エネルギー🔥","💎プリズム","📚FairyTail","ミラメリ🪄","🪽HERO","♾️ZERO♾️"
];

/* ---------------- ④ お住まいの地域 ---------------- */
window.SKY_AREAS = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

/* ================================================================ */
(function () {
  function apply() {
    var txt = window.SKY_VERSION + " (" + window.SKY_VERSION_DATE + ")";

    /* 決まった置き場所（.verTag / #verTag）に入れます */
    document.querySelectorAll(".verTag, #verTag").forEach(function (el) {
      el.textContent = txt;
    });

    /* ページに直接書かれている古いバージョン表記も、ここで書き換えます */
    var re = /v\d+\.\d+\s*\(\d{4}\/\d{2}\/\d{2}\)/g;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var hits = [];
    while (walker.nextNode()) {
      if (re.test(walker.currentNode.nodeValue)) hits.push(walker.currentNode);
      re.lastIndex = 0;
    }
    hits.forEach(function (node) {
      node.nodeValue = node.nodeValue.replace(re, txt);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
