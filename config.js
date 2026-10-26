/* ================================================================
   共通の設定（ここだけ書き換えれば、全ページに行きわたります）
   ----------------------------------------------------------------
   このファイルだけをアップし直せば、下の内容が全ページに反映されます。
   1ページ直すたびに全部アップする、という手間がなくなります。

   ※ ブラウザが古い内容を覚えていることがあります。
     変わらないときは、URLの後ろに ?v=196 などを付けて開いてください
================================================================ */

/* ---------------- ① バージョン ---------------- */
window.SKY_VERSION = "v1.179";
window.SKY_VERSION_DATE = "2026/10/27";

/* ---------------- ② GASのURL ----------------
   デプロイし直してURLが変わったときは、ここだけ書き換えてください */
window.SKY_GAS_URL = "https://script.google.com/macros/s/AKfycbzY2l20zwGULjnKRUqvRpbH79fPkl5e-sWNVoXEIgBrDpqhjDAx2zLvJuqO3sZxAfHj/exec";

/* ---------------- ③ 系列の一覧 ----------------
   ふだんは、管理画面の「🌳 系列のつながり」で直します（そちらが優先されます）。
   下の一覧は、「系列のつながり」をまだ作っていないときや、読みこめないときに使います */
window.SKY_KEIRETSU = [
  "🚀SkyExceed","🦅Zenith1","🏰Utop","🌟グローハピネス🌟","🥷HOT STUFF⚜️",
  "TELLUS.","FEAT","🌬️ザ・クラウドブルー(蒼雲)","✈️JET RISE","✨アフロディーテ",
  "⭐️ルミナス","エネルギー🔥","💎プリズム","📚FairyTail","ミラメリ🪄","🪽HERO","♾️ZERO♾️"
];

/* ---------------- ③-2 「系列のつながり」から、いまある系列を受け取ります ----------------
   ・前に受け取った一覧を、この端末に覚えておいて、すぐに使います
   ・10分以上たっていたら、裏で新しい一覧を受け取ります
   ・受け取った一覧が変わっていたら、ページの系列の選択肢も入れかえます
     （いま選んである値は、一覧になくても消しません） */
window.SKY_KEIRETSU_DEFAULT = window.SKY_KEIRETSU.slice();
(function () {
  var KEY = "sky_keiretsu_v1";
  function use(c) {
    if (!c || !c.list || !c.list.length) return false;
    window.SKY_KEIRETSU = c.list.slice();
    window.SKY_KEIRETSU_INFO = c.all || [];
    return true;
  }
  /* 系列の選択肢を入れかえます（系列名が3つ以上ならんでいる選択肢だけ） */
  function refill(oldList) {
    var known = {};
    oldList.concat(window.SKY_KEIRETSU_DEFAULT, window.SKY_KEIRETSU).forEach(function (k) { known[k] = true; });
    document.querySelectorAll("select").forEach(function (sel) {
      if (sel.getAttribute("data-kei-fixed")) return;
      var opts = Array.prototype.slice.call(sel.options);
      var keiOpts = opts.filter(function (o) { return known[o.value] && o.textContent === o.value; });
      if (keiOpts.length < 3) return;
      var cur = sel.value;
      var first = opts.indexOf(keiOpts[0]);
      var before = opts.slice(0, first).filter(function (o) { return !known[o.value]; });
      var after = opts.slice(first).filter(function (o) { return !known[o.value]; });
      var list = window.SKY_KEIRETSU.slice();
      if (cur && known[cur] && list.indexOf(cur) < 0) list.push(cur);
      sel.innerHTML = "";
      before.forEach(function (o) { sel.appendChild(o); });
      list.forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = k; sel.appendChild(o); });
      after.forEach(function (o) { sel.appendChild(o); });
      sel.value = cur;
    });
  }
  window.skyKeiretsuStore = function (j) {
    if (!j || j.ok !== true) return;
    var oldList = (window.SKY_KEIRETSU || []).slice();
    if (!j.list || !j.list.length) {
      try { localStorage.removeItem(KEY); } catch (e) {}
      return;
    }
    try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), list: j.list, all: j.all || [] })); } catch (e) {}
    use(j);
    if (JSON.stringify(oldList) !== JSON.stringify(window.SKY_KEIRETSU)) {
      var go = function () {
        refill(oldList);
        try { document.dispatchEvent(new Event("sky-keiretsu")); } catch (e) {}
      };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
    }
  };
  var c = null;
  try { c = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) {}
  if (c) use(c);
  var fresh = c && c.t && (Date.now() - c.t < 10 * 60 * 1000);
  if (!fresh && window.SKY_GAS_URL && window.fetch) {
    fetch(window.SKY_GAS_URL + "?action=keiretsuList")
      .then(function (r) { return r.json(); })
      .then(window.skyKeiretsuStore)
      .catch(function () {});
  }
})();

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

/* ================================================================
   育ちのマーク（名前の左につきます）
   ----------------------------------------------------------------
   はじめの一歩 → 初期サポートガイド → 活用の1stステップ の順に、終わったところまでで決まります
     0：🫘 たね（まだ何も終わっていない）
     1：🌱 芽が出た（はじめの一歩が終わった）
     2：🌷 花が咲いた（初期サポートガイドも終わった）
     3：🌈 ファーストサポート修了認定（活用の1stステップも終わった）
   ・順番どおりでないとき（ガイドだけ先に終わった など）は、はじめから順に終わったところまでで決めます
   ・ご本人の進み具合は、トップページを開いたときに読んで、この端末に覚えておきます（skyarc_point）
================================================================ */
window.skyGrowth = (function () {
  var MARK  = ["🫘", "🌱", "🌷", "🌈"];
  var LABEL = ["たね", "芽が出た", "花が咲いた", "ファーストサポート修了認定"];
  function stage(done) {
    done = done || {};
    var n = 0;
    ["hajime", "guide", "step1"].some(function (k) { if (done[k] === true) { n++; return false; } return true; });
    return n;
  }
  /* ご本人の段階（分からなければ null） */
  function mine() {
    try {
      var m = JSON.parse(localStorage.getItem("skyarc_member") || "null");
      var c = JSON.parse(localStorage.getItem("skyarc_point") || "null");
      if (m && c && c.done && String(c.id).replace(/^0+/, "") === String(m.id).replace(/^0+/, "")) return stage(c.done);
    } catch (e) {}
    return null;
  }
  function nid(x) { return String(x == null ? "" : x).trim().replace(/^0+/, ""); }
  /* ご本人の名前の前につける文字（「🌈 」など。分からないとき・別の方のときは空） */
  function selfTag(id) {
    try {
      var m = JSON.parse(localStorage.getItem("skyarc_member") || "null");
      if (!m || (id != null && nid(id) !== nid(m.id))) return "";
    } catch (e) { return ""; }
    var g = mine();
    return g == null ? "" : MARK[g] + " ";
  }
  /* ほかの方の名前の前につける文字（GASから受け取った grow {hajime,guide,step1} から） */
  function tag(grow) { return grow ? MARK[stage(grow)] + " " : ""; }
  /* 進捗（{hajime:{done},guide:{done},step1:{done}}）から grow の形にします */
  function fromProgress(pr) {
    if (!pr) return null;
    return { hajime: !!(pr.hajime && pr.hajime.done), guide: !!(pr.guide && pr.guide.done), step1: !!(pr.step1 && pr.step1.done) };
  }
  return { stage: stage, mine: mine, selfTag: selfTag, tag: tag, fromProgress: fromProgress,
           mark: function (s) { return MARK[s] || ""; }, label: function (s) { return LABEL[s] || ""; } };
})();

/* ================================================================ */
(function () {
  function apply() {
    var txt = window.SKY_VERSION + " (" + window.SKY_VERSION_DATE + ")";

    /* ① 決まった置き場所（.verTag / #verTag）に入れます */
    var slots = document.querySelectorAll(".verTag, #verTag");
    slots.forEach(function (el) { el.textContent = txt; });

    /* ② 置き場所が無いページには、いちばん下にそっと足します */
    if (!slots.length) {
      var d = document.createElement("div");
      d.className = "verTag";
      d.style.cssText = "text-align:center;font-size:9.5px;color:#C4B8B0;"
        + "font-family:monospace;padding:14px 0 22px;";
      d.textContent = txt;
      (document.querySelector("main") || document.body).appendChild(d);
    }

    /* ③ 古い書き方が残っていれば、それも書き換えます */
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
