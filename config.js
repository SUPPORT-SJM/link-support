/* ================================================================
   共通の設定（ここだけ書き換えれば、全ページに行きわたります）
   ----------------------------------------------------------------
   このファイルだけをアップし直せば、下の内容が全ページに反映されます。
   1ページ直すたびに全部アップする、という手間がなくなります。

   ※ ブラウザが古い内容を覚えていることがあります。
     変わらないときは、URLの後ろに ?v=196 などを付けて開いてください
================================================================ */

/* ---------------- ① バージョン ---------------- */
window.SKY_VERSION = "v1.200";
window.SKY_VERSION_DATE = "2026/10/28";

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

/* ================================================================
   管理者モード（管理者の方だけ）
   ----------------------------------------------------------------
   ・「管理者」の役職がある方は、ふだんは、管理者をのぞいたご自身の立場で動きます
       （アドバンス・系列代表・チーム代表・部門・サポーター・クリエなど、本当のとおり）
   ・左下の「🛠 管理者モード」を押して、
       「管理者（すべて）」をえらぶと、管理者としてすべて見られます
       ほかの状態をえらぶと、その状態だけで見え方を試せます（ご自身の情報は、いったん外します）
         立場（サポーター〜チーム代表）・部門・進み具合は、どれも1つずつ付け外しするだけです（ほかは自動でつきません）
   ・「管理者モードをオフにする」で、ふだんの状態に戻ります
   ・この端末の中だけの切りかえです。名簿のご自身の情報は変わりません
   ・GASにも、いまの状態（dbg）を一緒に送ります。GASは、本当に管理者の方のときだけ使います
================================================================ */
window.skyDebug = (function () {
  var KEY = "sky_dbg", REAL = "sky_dbg_real";
  var ROLES = ["アドバンス", "系列代表", "チーム代表"];
  var DEPTS = ["アドバイザー部門","ユーザーサポート部門","動画視聴会部門","アポ部屋部門","Bトレ部門","交流部門","マルシェ応援部門","交通整備課"];
  var LS = null; try { LS = window.localStorage; } catch (e) {}
  if (!LS || typeof Storage === "undefined") return { get:function(){return null;} };
  var origSet = Storage.prototype.setItem;
  function rawGet(k) { try { return LS.getItem(k); } catch (e) { return null; } }
  function rawSet(k, v) { try { origSet.call(LS, k, v); } catch (e) {} }
  function parse(s) { try { return JSON.parse(s || "null"); } catch (e) { return null; } }
  function isAdm(m) { return !!m && /管理者/.test(String(m.role || "")); }
  function nid(x) { return String(x == null ? "" : x).replace(/^0+/, ""); }
  function strip(role) { return String(role || "").split(/[,、\s]+/).filter(function (r) { return r && r !== "管理者"; }).join(","); }
  /* いまの状態：null＝オフ（ふだん） / {mode:"admin"}＝管理者としてすべて / {mode:"custom", ...}＝えらんだ状態 */
  function get() { var d = parse(rawGet(KEY)); return d && (d.mode === "admin" || d.mode === "custom") ? d : null; }
  function real() { return parse(rawGet(REAL)); }
  function realAdmin() {
    var m = parse(rawGet("skyarc_member")); if (!m) return null;
    if (!m._dbg && isAdm(m)) return m;
    var r = real();
    return r && nid(r.id) === nid(m.id) && isAdm(r) ? r : null;
  }
  function labelOf(d) {
    if (!d) return "オフ";
    if (d.mode === "admin") return "管理者";
    var t = (d.roles || []).slice(-1)[0] || (d.crie ? "クリエイターズ" : d.sup ? "サポーター" : "メンバー");
    return t;
  }
  /* 本当の会員情報 → いまの状態で見せる会員情報 */
  function view(r, d) {
    var o = {}; for (var k in r) o[k] = r[k];
    if (!d) { o.role = strip(r.role); o._dbg = "self"; return o; }
    if (d.mode === "admin") { o._dbg = "admin"; return o; }
    o.sup = !!d.sup; o.crie = !!d.crie; o.role = (d.roles || []).join(",");   /* えらんだとおり（自動ではつけません） */
    o.dept = d.dept || ""; o.deptLead = !!d.lead; o.schedIn = !!d.sched; o._dbg = "custom";
    return o;
  }
  function progDone(d) { return { hajime: !!(d.prog && d.prog.h), guide: !!(d.prog && d.prog.g), step1: !!(d.prog && d.prog.s) }; }
  function dbgParam(d) {
    if (!d) return JSON.stringify({ self:1 });
    if (d.mode === "admin") return "";
    return JSON.stringify({ sup: d.sup ? 1 : 0, crie: d.crie ? 1 : 0, roles: d.roles || [], dept: d.dept || "",
                            lead: d.lead ? 1 : 0, sched: d.sched ? 1 : 0, prog: d.prog || null });
  }

  /* 会員情報・進み具合が保存されるときに、いまの状態を重ねます */
  Storage.prototype.setItem = function (k, v) {
    try {
      if (this === LS && k === "skyarc_member") {
        var m = parse(v);
        if (m) {
          var r = real();
          if (!m._dbg && isAdm(m)) { origSet.call(LS, REAL, v); r = m; }
          if (r && nid(r.id) === nid(m.id) && isAdm(r)) {
            /* GASから届いた情報は、ご本人の本当の情報に重ねなおします（名前などは新しいほう） */
            var base = {}; for (var a in m) base[a] = m[a];
            base.role = r.role; base.sup = r.sup; base.crie = r.crie;
            if (m._dbg !== "custom" && !get()) { base.dept = m.dept; base.deptLead = m.deptLead; base.schedIn = m.schedIn; }
            else { base.dept = r.dept; base.deptLead = r.deptLead; base.schedIn = r.schedIn; }
            delete base._dbg;
            v = JSON.stringify(view(base, get()));
          } else if (rawGet(KEY) && rawGet(KEY) !== "null") {
            origSet.call(LS, KEY, "null");          /* 管理者でない方がログインしたら、管理者モードは終わり */
          }
        }
      } else if (this === LS && k === "skyarc_point") {
        var d2 = get(), c = parse(v);
        if (d2 && d2.mode === "custom" && c) { c.done = progDone(d2); v = JSON.stringify(c); }
      }
    } catch (e) {}
    return origSet.call(this, k, v);
  };

  /* GASへの問い合わせに、いまの状態（dbg）を添えます（管理者の方だけ） */
  if (window.fetch) {
    var of = window.fetch;
    window.fetch = function (input, init) {
      try {
        var url = typeof input === "string" ? input : (input && input.url) || "";
        if (/script\.google(usercontent)?\.com\/macros/.test(url) && realAdmin()) {
          var pj = dbgParam(get());
          if (pj) {
            if (init && init.body) {
              if (typeof URLSearchParams !== "undefined" && init.body instanceof URLSearchParams) init.body.set("dbg", pj);
              else if (typeof FormData !== "undefined" && init.body instanceof FormData) init.body.set("dbg", pj);
              else if (typeof init.body === "string") init.body += "&dbg=" + encodeURIComponent(pj);
            } else if (typeof input === "string") {
              input += (input.indexOf("?") >= 0 ? "&" : "?") + "dbg=" + encodeURIComponent(pj);
            }
          }
        }
      } catch (e) {}
      return of.call(this, input, init);
    };
  }

  /* 切りかえ（d：null＝オフ） */
  function set(d) {
    var r = realAdmin(); if (!r) return;
    rawSet(KEY, d ? JSON.stringify(d) : "null");
    rawSet(REAL, JSON.stringify(r));
    rawSet("skyarc_member", JSON.stringify(view(r, d)));
    if (d && d.mode === "custom") {
      var c = parse(rawGet("skyarc_point")) || {}; c.id = r.id; c.done = progDone(d); rawSet("skyarc_point", JSON.stringify(c));
    } else {
      try { LS.removeItem("skyarc_point"); } catch (e) {}   /* 本当の進み具合は、トップページで読み直します */
    }
    location.reload();
  }
  /* 読みこんだときに、まだ重ねていなければ重ねます（はじめてこの版になったとき） */
  (function () {
    var m = parse(rawGet("skyarc_member"));
    if (m && !m._dbg && isAdm(m)) { rawSet(REAL, JSON.stringify(m)); rawSet("skyarc_member", JSON.stringify(view(m, get()))); }
  })();

  /* ---------- 左下のボタンと、えらぶ画面 ---------- */
  var openFn = null;
  function ui() {
    if (!realAdmin() || document.getElementById("skyDbgBtn")) return;
    var d = get();
    var css = document.createElement("style");
    css.textContent = ''
      + '#skyDbgBtn{position:fixed;left:10px;bottom:calc(env(safe-area-inset-bottom) + 10px);z-index:9600;border:none;border-radius:999px;'
      +   'padding:6px 11px;font-size:11.5px;font-weight:700;font-family:inherit;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.22);opacity:.92;'
      +   'background:#8A84A0;color:#fff;max-width:calc(100vw - 90px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '#skyDbgBtn.adm{background:#3C3557;}'
      + 'body{padding-bottom:calc(env(safe-area-inset-bottom) + 50px) !important;}'   /* いちばん下の中身が、ボタンに隠れないように */
      + '#skyDbgBtn.cus{background:#F57C00;}'
      + '#skyDbgBtn.adm,#skyDbgBtn.cus{animation:skyDbgPulse 2.4s ease-in-out infinite;}'   /* オンのあいだは、オレンジ色にゆっくり明滅 */
      + '@keyframes skyDbgPulse{0%,100%{box-shadow:0 4px 14px rgba(0,0,0,.22),0 0 0 0 rgba(245,124,0,0);}50%{box-shadow:0 4px 14px rgba(0,0,0,.22),0 0 0 7px rgba(245,124,0,.35),0 0 18px 6px rgba(245,124,0,.45);}}'
      + '@media (prefers-reduced-motion: reduce){#skyDbgBtn.adm,#skyDbgBtn.cus{animation:none;}}'
      + '#skyDbgOv{display:none;position:fixed;inset:0;z-index:9700;background:rgba(30,26,50,.55);align-items:center;justify-content:center;padding:14px;}'
      + '#skyDbgOv.show{display:flex;}'
      + '#skyDbgOv .c{background:#fff;border-radius:18px;width:100%;max-width:410px;max-height:calc(100vh - 28px);overflow:auto;padding:18px 16px;color:#3E3A50;'
      +   'font-family:inherit;box-shadow:0 14px 40px rgba(0,0,0,.3);text-align:left;}'
      + '#skyDbgOv h3{font-size:16px;font-weight:900;color:#3C3557;margin:0 0 4px;}'
      + '#skyDbgOv .s{font-size:11.5px;color:#77748A;line-height:1.7;margin:0 0 8px;}'
      + '#skyDbgOv .lb{font-size:12px;font-weight:700;color:#3C3557;margin:12px 0 5px;}'
      + '#skyDbgOv .g{display:flex;flex-wrap:wrap;gap:6px;}'
      + '#skyDbgOv .g button{border:1.5px solid #DCD7EC;background:#fff;color:#4A3F7A;border-radius:999px;padding:7px 12px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;}'
      + '#skyDbgOv .g button.on{background:#F57C00;border-color:#F57C00;color:#fff;}'
      + '#skyDbgOv .g button.on::before{content:"✓ ";}'
      + '#skyDbgOv .adm{display:block;width:100%;padding:11px;border:none;border-radius:12px;background:#3C3557;color:#fff;font-size:14px;font-weight:900;font-family:inherit;cursor:pointer;}'
      + '#skyDbgOv select{width:100%;font-size:15px;padding:7px 9px;border:1.5px solid #DCD7EC;border-radius:9px;font-family:inherit;}'
      + '#skyDbgOv .go{display:block;width:100%;margin-top:14px;padding:12px;border:none;border-radius:12px;background:#F57C00;color:#fff;font-size:14.5px;font-weight:900;font-family:inherit;cursor:pointer;}'
      + '#skyDbgOv .off{display:block;width:100%;margin-top:8px;padding:11px;border:1.5px solid #3C3557;border-radius:12px;background:#fff;color:#3C3557;font-size:13.5px;font-weight:700;font-family:inherit;cursor:pointer;}'
      + '#skyDbgOv .x{display:block;width:100%;margin-top:4px;padding:10px;border:none;background:none;color:#8A84A0;font-size:12.5px;font-family:inherit;cursor:pointer;}';
    document.head.appendChild(css);

    var btn = document.createElement("button");
    btn.id = "skyDbgBtn"; btn.type = "button";
    btn.className = !d ? "" : d.mode === "admin" ? "adm" : "cus";
    btn.textContent = !d ? "🛠 管理者モード：オフ" : d.mode === "admin" ? "🛠 管理者モード：オン" : "🛠 管理者モード／" + labelOf(d);
    btn.title = "管理者モード（押すと切りかえられます）";
    /* トップページでは、ふわふわ浮く丸（使い方・会員情報と同じ形）で出すので、このボタンは隠します */
    if (window.SKY_DBG_FLOATER) btn.style.display = "none";
    document.body.appendChild(btn);

    var st = d && d.mode === "custom" ? JSON.parse(JSON.stringify(d))
           : { mode:"custom", sup:false, crie:false, roles:[], dept:"", lead:false, sched:false, prog:{ h:false, g:false, s:false, p:false, r:false } };
    st.prog = st.prog || { h:false, g:false, s:false, p:false, r:false }; st.roles = st.roles || [];
    var ov = document.createElement("div"); ov.id = "skyDbgOv"; document.body.appendChild(ov);
    function chip(on, t, act) { return '<button type="button" class="' + (on ? "on" : "") + '" data-a="' + act + '">' + t + '</button>'; }
    function markNow() {
      var n = 0; ["h", "g", "s"].some(function (k) { if (st.prog[k]) { n++; return false; } return true; });
      return ["🫘 たね", "🌱 芽が出た", "🌷 花が咲いた", "🌈 ファーストサポート修了認定"][n];
    }
    function draw() {
      ov.innerHTML = '<div class="c">'
        + '<h3>🛠 管理者モード</h3>'
        + '<p class="s">いま：<b>' + (!d ? "オフ（ふだんのご自身の立場）" : d.mode === "admin" ? "オン（管理者としてすべて）" : "オン（" + labelOf(d) + "として試し中）") + '</b><br>'
        + 'この端末の中だけの切りかえです。名簿のご自身の情報は変わりません。</p>'
        + '<button type="button" class="adm" data-a="admin">🔐 管理者としてすべて見る</button>'
        + '<p class="s" style="margin:12px 0 0;">または、下で状態をえらんで試します。どれも、押すとつく・もう一度押すと外れる、だけです（ほかのものは自動でつきません）。</p>'
        + '<div class="lb">立場（何もつけない＝メンバー）</div><div class="g">'
        + chip(st.sup, "サポーター", "f:sup") + chip(st.crie, "クリエイターズ", "f:crie")
        + ROLES.map(function (r) { return chip(st.roles.indexOf(r) >= 0, r, "r:" + r); }).join("") + '</div>'
        + '<div class="lb">部門</div><select data-a="dept"><option value="">なし（未所属）</option>'
        + DEPTS.map(function (k) { return '<option value="' + k + '"' + (st.dept === k ? " selected" : "") + '>' + k + '</option>'; }).join("") + '</select>'
        + '<div class="g" style="margin-top:6px;">' + chip(st.lead, "部門統括", "lead") + chip(st.sched, "スケジュール入力担当", "sched") + '</div>'
        + '<div class="lb">ファーストサポートの3つ（1つずつ押して、終わった・まだを切りかえ）</div><div class="g">'
        + chip(st.prog.h, "① はじめの一歩", "p:h") + chip(st.prog.g, "② 初期サポートガイド", "p:g") + chip(st.prog.s, "③ 活用の1stステップ", "p:s") + '</div>'
        + '<p class="s" style="margin:6px 0 0;">名前の左のマーク：<b style="font-size:15px;">' + markNow() + '</b>（🫘 → 🌱 → 🌷 → 🌈）</p>'
        + '<div class="lb">その先の進み具合</div><div class="g">'
        + chip(st.prog.p, "ぴよぴよ卒業", "p:p") + chip(st.prog.r, "グルコンリーダー修了", "p:r") + '</div>'
        + '<button type="button" class="go" data-a="go">この状態で試す</button>'
        + '<div class="lb" style="margin-top:16px;">🎉 お祝いを見てみる（トップページで出るお祝いの見本。記録はしません）</div><div class="g">'
        + (window.skyCelebrate ? window.skyCelebrate.keys.map(function (k) { return '<button type="button" data-a="cel:' + k + '">' + window.skyCelebrate.label(k) + '</button>'; }).join("") : '')
        + '</div>'
        + (d ? '<button type="button" class="off" data-a="off">管理者モードをオフにする（ふだんに戻す）</button>' : '')
        + '<button type="button" class="x" data-a="x">とじる</button></div>';
    }
    ov.addEventListener("click", function (e) {
      if (e.target === ov) { ov.classList.remove("show"); return; }
      var t = e.target.closest ? e.target.closest("[data-a]") : null; if (!t || t.tagName === "SELECT") return;
      var a = t.getAttribute("data-a");
      /* どれも、押すとつく・もう一度押すと外れる、だけ（ほかのものは自動でつけません） */
      if (a === "f:sup") st.sup = !st.sup;
      else if (a === "f:crie") st.crie = !st.crie;
      else if (a.indexOf("r:") === 0) { var r = a.slice(2), i = st.roles.indexOf(r);
        if (i >= 0) st.roles.splice(i, 1); else st.roles.push(r);
        st.roles = ROLES.filter(function (x) { return st.roles.indexOf(x) >= 0; }); }
      else if (a === "lead") st.lead = !st.lead;
      else if (a === "sched") st.sched = !st.sched;
      else if (a.indexOf("p:") === 0) { var k = a.slice(2); st.prog[k] = !st.prog[k]; }
      else if (a === "admin") { set({ mode:"admin" }); return; }
      else if (a === "go") { st.mode = "custom"; set(st); return; }
      else if (a === "off") { set(null); return; }
      else if (a === "x") { ov.classList.remove("show"); return; }
      else if (a.indexOf("cel:") === 0) {
        ov.classList.remove("show");
        var me = parse(rawGet("skyarc_member")) || {};
        window.skyCelebrate(a.slice(4), { preview:true, name: me.name || "" });
        return;
      }
      draw();
    });
    ov.addEventListener("change", function (e) { if (e.target.getAttribute("data-a") === "dept") st.dept = e.target.value; });
    openFn = function () { draw(); ov.classList.add("show"); };
    btn.addEventListener("click", openFn);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ui); else ui();

  return { get: get, set: set, realAdmin: realAdmin, label: function () { return labelOf(get()); },
           open: function () { if (!openFn) ui(); if (openFn) openFn(); } };
})();

/* ================================================================
   お祝い（トップページで出します）
   ----------------------------------------------------------------
   skyCelebrate("hajime")  … 画面いっぱいの演出と、ひとことのカード
     はじめの一歩        … 花吹雪
     初期サポートガイド  … 花吹雪＋クラッカー
     活用の1stステップ   … 花吹雪＋クラッカー＋流れ星
     サポーター・ぴよぴよ卒業 … 花吹雪＋クラッカー
     クリエ・アドバンス  … 流れ星＋花吹雪（おめでとう、ではなく「ようこそ」）
     系列代表・チーム代表 … 流れ星（覚悟を持って、一緒に）
     グルコンリーダー修了 … 花吹雪＋クラッカー＋流れ星
   ・とじると、お返しの Promise が終わります（つぎのお祝いを順番に出すため）
================================================================ */
window.skyCelebrate = (function () {
  var C = {
    hajime: { fx:["petal"], em:"🌱", title:"はじめの一歩、<br>お楽しみ様でした！", msg:"芽が出ました。ここからが、はじまりです。", btn:"ありがとう！" },
    guide:  { fx:["petal","cracker"], em:"🌷", title:"初期サポートガイド、<br>コンプリートやりましたね！", msg:"花が咲きました。いい調子です！", btn:"ありがとう！" },
    step1:  { fx:["petal","cracker","star"], em:"🌈", title:"活用の1stステップまで、<br>すべてコンプリート！", msg:"ファーストサポート修了認定です。<br>お楽しみ様でした。<br>どんどん活用しましょう！", btn:"ありがとう！" },
    sup:    { fx:["petal","cracker"], em:"🐣", title:"サポーター認定、<br>飛躍していきましょう！", msg:"これから、チームのみなさんのサポートを<br>一緒にしていきましょう。", btn:"よろしくお願いします！" },
    piyo:   { fx:["petal","cracker"], em:"🐔", title:"ぴよぴよ卒業、<br>ますます楽しみですね！", msg:"サポートの基本が身につきました。", btn:"ありがとう！" },
    crie:   { fx:["star","petal"], em:"🌱", title:"クリエイターズへ、<br>ようこそ。", msg:"ここからがスタートです。<br>これからよろしくお願いします。<br>一緒に走っていきましょう！", btn:"よろしくお願いします！" },
    gr:     { fx:["petal","cracker","star"], em:"🌳", title:"グルコンリーダー育成修了、<br>お楽しみ様でした！", msg:"場をつくり、人を導く力が育ちました。", btn:"ありがとう！" },
    adv:    { fx:["star","petal"], em:"🗝️", title:"アドバンスへ、<br>ようこそ。", msg:"これから、<br>一緒にやっていきましょう！", btn:"よろしくお願いします！" },
    keirep: { fx:["star"], em:"🔥", title:"系列代表として、<br>よろしくお願いします。", msg:"覚悟を持って、一緒にやっていきましょう。", btn:"一緒にやっていきます！" },
    team:   { fx:["star"], em:"👑", title:"チーム代表、<br>いつもありがとうございます。", msg:"みんなの夢を、<br>一緒に虹にしていきます。", btn:"ありがとう。" }
  };
  var LABEL = { hajime:"はじめの一歩", guide:"初期サポートガイド", step1:"活用の1stステップ", sup:"サポーター", piyo:"ぴよぴよ卒業",
                crie:"クリエイターズ", gr:"グルコンリーダー修了", adv:"アドバンス", keirep:"系列代表", team:"チーム代表" };
  var reduce = false; try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  function css() {
    if (document.getElementById("skyCelebCss")) return;
    var st = document.createElement("style"); st.id = "skyCelebCss";
    st.textContent = ''
      + '#skyCeleb{position:fixed;inset:0;z-index:9800;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(40,30,70,.45);}'
      + '#skyCeleb canvas{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;}'
      + '#skyCeleb .cc{position:relative;background:#fff;border-radius:22px;max-width:360px;width:100%;padding:26px 20px 20px;text-align:center;'
      +   'box-shadow:0 18px 50px rgba(0,0,0,.3);animation:skyCelebPop .55s cubic-bezier(.22,1.4,.44,1) both;font-family:inherit;color:#3E3A50;}'
      + '@keyframes skyCelebPop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}'
      + '#skyCeleb .em{font-size:52px;line-height:1;margin-bottom:8px;}'
      + '#skyCeleb h2{font-weight:900;font-size:19px;line-height:1.5;color:#4A3F7A;margin:0 0 8px;}'
      + '#skyCeleb .who{font-weight:700;font-size:14px;color:#2E7D62;margin:0 0 10px;}'
      + '#skyCeleb p.m{font-size:13.5px;line-height:1.9;color:#5A566E;margin:0 0 16px;word-break:keep-all;overflow-wrap:anywhere;}'
      + '#skyCeleb button{border:none;border-radius:999px;padding:12px 26px;font-size:15px;font-weight:900;font-family:inherit;cursor:pointer;'
      +   'background:linear-gradient(135deg,#F5A97A,#F49AC1);color:#fff;box-shadow:0 6px 16px rgba(244,154,193,.45);}'
      + '#skyCeleb .pv{display:inline-block;font-size:11px;font-weight:700;color:#C25E00;background:#FFF1E0;border-radius:999px;padding:2px 10px;margin-bottom:8px;}';
    document.head.appendChild(st);
  }
  /* ---------- 演出（キャンバスに描きます） ---------- */
  function run(cv, fx) {
    var ctx = cv.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var Wd = cv.width = innerWidth * dpr, Hd = cv.height = innerHeight * dpr;
    var parts = [], t0 = performance.now(), stop = false;
    var PET = ["#F9C5D5", "#F49AC1", "#FBD3E0", "#FFE4EC", "#F7B2C4"];
    var CON = ["#F49AC1", "#F5A97A", "#F5D06A", "#8FD9A8", "#6FC7D9", "#7BA3E8", "#A88BE0"];
    if (fx.indexOf("petal") >= 0) for (var i = 0; i < 70; i++) parts.push({ k:"p", x:Math.random()*Wd, y:-Math.random()*Hd*.9, vx:(Math.random()-.5)*.8*dpr, vy:(1+Math.random()*1.4)*dpr,
      r:(5+Math.random()*5)*dpr, a:Math.random()*6.28, va:(Math.random()-.5)*.08, c:PET[i % PET.length], d:0 });
    if (fx.indexOf("cracker") >= 0) [[0, Hd], [Wd, Hd]].forEach(function (o, s) {
      for (var j = 0; j < 80; j++) { var ang = (s ? -2.2 : -0.95) + (Math.random()-.5)*.9, sp = (9+Math.random()*9)*dpr;
        parts.push({ k:"c", x:o[0], y:o[1], vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp, w:(4+Math.random()*4)*dpr, h:(8+Math.random()*6)*dpr,
          a:Math.random()*6.28, va:(Math.random()-.5)*.3, c:CON[j % CON.length], d:250 + s*120 }); } });
    if (fx.indexOf("star") >= 0) for (var k = 0; k < 14; k++) parts.push({ k:"s", x:Wd*(.2+Math.random()*.9), y:-Hd*.1*Math.random(), vx:-(7+Math.random()*5)*dpr, vy:(4+Math.random()*3)*dpr,
      len:(60+Math.random()*80)*dpr, d:400 + k*260 });
    function frame(now) {
      if (stop) return;
      var el = now - t0;
      ctx.clearRect(0, 0, Wd, Hd);
      parts.forEach(function (p) {
        if (el < p.d) return;
        if (p.k === "p") { p.x += p.vx + Math.sin((el + p.r*40)/500)*.6*dpr; p.y += p.vy; p.a += p.va;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.beginPath();
          ctx.ellipse(0, 0, p.r, p.r*.55, 0, 0, 6.283); ctx.fill(); ctx.restore(); }
        else if (p.k === "c") { p.vy += .32*dpr; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); ctx.restore(); }
        else if (p.k === "s") { p.x += p.vx; p.y += p.vy;
          var gx = p.x - p.vx/Math.hypot(p.vx, p.vy)*p.len, gy = p.y - p.vy/Math.hypot(p.vx, p.vy)*p.len;
          var g = ctx.createLinearGradient(p.x, p.y, gx, gy); g.addColorStop(0, "rgba(255,248,200,1)"); g.addColorStop(1, "rgba(255,248,200,0)");
          ctx.strokeStyle = g; ctx.lineWidth = 3*dpr; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(gx, gy); ctx.stroke();
          ctx.fillStyle = "#FFF6C8"; ctx.beginPath(); ctx.arc(p.x, p.y, 3.2*dpr, 0, 6.283); ctx.fill();
          if (p.y > Hd + 50 || p.x < -200) { p.x = Wd*(.3+Math.random()*.8); p.y = -20; } }
      });
      if (el < 7000) requestAnimationFrame(frame); else ctx.clearRect(0, 0, Wd, Hd);
    }
    requestAnimationFrame(frame);
    return function () { stop = true; };
  }
  function show(key, opt) {
    opt = opt || {};
    return new Promise(function (resolve) {
      var c = C[key]; if (!c || !document.body) { resolve(); return; }
      css();
      var old = document.getElementById("skyCeleb"); if (old) old.remove();
      var ov = document.createElement("div"); ov.id = "skyCeleb";
      ov.innerHTML = '<canvas></canvas><div class="cc">' + (opt.preview ? '<div class="pv">🛠 お祝いの見本</div>' : '')
        + '<div class="em">' + c.em + '</div><h2>' + c.title + '</h2>'
        + (opt.name ? '<p class="who">' + String(opt.name).replace(/[<>&]/g, "") + 'さん</p>' : '')
        + '<p class="m">' + c.msg + '</p><button type="button">' + c.btn + '</button></div>';
      document.body.appendChild(ov);
      var stopFx = reduce ? function () {} : run(ov.querySelector("canvas"), c.fx);
      ov.querySelector("button").addEventListener("click", function () { stopFx(); ov.remove(); resolve(); });
    });
  }
  show.keys = Object.keys(C); show.label = function (k) { return LABEL[k] || k; };
  return show;
})();
