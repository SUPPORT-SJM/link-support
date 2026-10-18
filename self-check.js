/* ================================================================
   本人の記録（ご本人がチェックしたもの）の共通部品
   ----------------------------------------------------------------
   使っているページ：初期サポートガイド・活用の1stステップ・紹介・ビジネス活動サポート
   保存先：スプレッドシートのタブ「本人の記録」（GAS の selfGet / selfSet）
   ・チェックを入れて保存すると、その日の日付が入ります（すでに日付があれば、そのまま）
   ・チェックを外して保存すると、日付が消えます
   ・初期サポートマネジメントに「本人」の記録として出ます

   使い方
     const vals = await skySelf.get();                 … { 項目: "2026/10/18", … }（ログインしていなければ null）
     const vals = await skySelf.set({ s1:true, s2:false }); … 保存して、保存後の中身を返します
     skySelf.listHtml(["s1","s2"], vals, "sem")        … チェックの一覧（HTML）
     skySelf.readList(要素)                            … 一覧のチェックを { 項目: true/false } で読みます
================================================================ */
(function () {
  const LABEL = {
    u:"ユーザーサポート会",
    s1:"LINKセミナー 通常編", s2:"LINKセミナー 社長編", s3:"LINKセミナー 自己ブランディング特化版",
    s4:"LINKセミナー グループ構築特化版", s5:"LINKセミナー 新サービス特化版",
    c:"直近のLINKセレモニーの予約",
    g1:"高山翔子さんのグルコン", g2:"いと・すけさんのグルコン", g3:"冨田由起子さんのグルコン",
    k:"チーム交流会", w:"ワイワイチャット参加"
  };
  function me() {
    try {
      const m = JSON.parse(localStorage.getItem("skyarc_member") || "null");
      if (m && m.id && m.pin) return m;
    } catch (e) {}
    return null;
  }
  async function get() {
    const m = me();
    if (!m) return null;
    try {
      const r = await fetch(window.SKY_GAS_URL + "?action=selfGet&id=" + encodeURIComponent(m.id) + "&pin=" + encodeURIComponent(m.pin));
      const j = await r.json();
      if (typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return null;
      return (j && j.ok) ? (j.vals || {}) : null;
    } catch (e) { return null; }
  }
  async function set(changes) {
    const m = me();
    if (!m) return { ok:false, error:"login" };
    try {
      const body = new URLSearchParams({ action:"selfSet", id:m.id, pin:m.pin, changes: JSON.stringify(changes) });
      const r = await fetch(window.SKY_GAS_URL, { method:"POST", body: body });
      const j = await r.json();
      if (typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return { ok:false, error:"maintenance" };
      return j || { ok:false };
    } catch (e) { return { ok:false, error:"net" }; }
  }
  function md(t) { const x = String(t || "").match(/^\d{4}\/(\d{1,2})\/(\d{1,2})/); return x ? Number(x[1]) + "/" + Number(x[2]) : ""; }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  /* チェックの一覧（チェックした日を小さく添えます） */
  function listHtml(keys, vals, group) {
    vals = vals || {};
    return '<div class="self-list" data-g="' + esc(group || "") + '">' + keys.map(k =>
      '<label class="self-row"><input type="checkbox" data-k="' + k + '"' + (vals[k] ? " checked" : "") + '>'
      + '<span>' + esc(LABEL[k] || k) + '</span>'
      + '<small class="self-d">' + (vals[k] ? md(vals[k]) + " に記録" : "") + '</small></label>').join("") + "</div>";
  }
  function readList(el) {
    const out = {};
    (el ? el.querySelectorAll("input[data-k]") : []).forEach(i => { out[i.dataset.k] = i.checked; });
    return out;
  }
  /* 保存したあとの日付を、一覧に反映します */
  function paint(root, vals) {
    vals = vals || {};
    (root || document).querySelectorAll(".self-row input[data-k]").forEach(i => {
      const k = i.dataset.k;
      i.checked = !!vals[k];
      const d = i.parentNode.querySelector(".self-d");
      if (d) d.textContent = vals[k] ? md(vals[k]) + " に記録" : "";
    });
  }
  /* 見た目（どのページでも同じに見えるように、ここで用意します） */
  (function css() {
    if (document.getElementById("selfCss")) return;
    const st = document.createElement("style");
    st.id = "selfCss";
    st.textContent = ".self-list{display:flex;flex-direction:column;gap:6px;margin:10px 0 4px;}"
      + ".self-row{display:flex;align-items:center;gap:9px;background:#FFFDF8;border:1.5px solid #F2DEC8;border-radius:10px;padding:9px 11px;font-size:13.5px;line-height:1.5;cursor:pointer;}"
      + ".self-row input{width:20px;height:20px;flex-shrink:0;accent-color:#FF7043;}"
      + ".self-row span{flex:1;}"
      + ".self-d{font-size:11px;color:#A1887F;white-space:nowrap;}"
      + ".self-note{font-size:12px;color:#8D6E63;line-height:1.7;margin-top:4px;}";
    (document.head || document.documentElement).appendChild(st);
  })();
  window.skySelf = { LABEL: LABEL, get: get, set: set, listHtml: listHtml, readList: readList, paint: paint, md: md };
})();
