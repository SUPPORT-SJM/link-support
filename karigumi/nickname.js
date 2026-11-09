/* ================================================================
   オープンチャット用ニックネームの共通部品
   ----------------------------------------------------------------
   使っているページ：はじめの一歩・入るべきオープンチャット集・初期サポートガイド・
                     便利ボタン集・紹介・ビジネス活動サポート（ワイワイチャット）

   作り方（LINEのオープンチャットは20文字をこえると入れられないため）
     1. 基本の形：🌈お名前/Skyarc＋系列名
          系列名が絵文字で始まるとき … スラッシュなし（🌈さかいあたる/Skyarc🪽HERO）
          絵文字で始まらないとき     … スラッシュを残す（🌈さかいあたる/Skyarc/TELLUS.）
     2. 20文字をこえたら「/Skyarc」をはぶきます（🌈さかいあたる🚀SkyExceed）
     3. それでもこえるときは、そのままコピーはできるようにして、
        「途中で途切れてしまいます」とお知らせします（あとで設定から直せます）
     ・ザ・クラウドブルー(蒼雲) は、絵文字と「蒼雲」だけにします（🌬️蒼雲）
     ・文字の数え方：絵文字1つも、かな・英字1つも、すべて1文字と数えます

   使い方
     const r = skyNick.make("さかいあたる", "🪽HERO");
       → { text, len, over, dropped }   dropped … Skyarc をはぶいたとき true
     skyNick.render(結果を出す欄, お名前, 系列)   … 欄に出して、こえたときは注意を添えます
     skyNick.copy(文字) … コピーします（できたら true）
================================================================ */
(function () {
  const LIMIT = 20;
  let seg = null;
  try { seg = new Intl.Segmenter("ja", { granularity: "grapheme" }); } catch (e) {}
  function len(t) { return seg ? Array.from(seg.segment(String(t))).length : Array.from(String(t)).length; }
  function startsEmoji(t) {
    try { return new RegExp("^\\p{Extended_Pictographic}", "u").test(String(t)); } catch (e) { return /^[\uD83C-\uDBFF☀-➿]/.test(String(t)); }
  }
  /* 系列名をニックネーム用にします（長い正式名称をみじかく） */
  function keiShort(kei) {
    const k = String(kei || "").trim();
    if (/クラウドブルー/.test(k)) {
      let emo = "🌬️";
      try { emo = (k.match(new RegExp("^(\\p{Extended_Pictographic}\\uFE0F?)", "u")) || [""])[0] || "🌬️"; } catch (e) {}
      return emo + "蒼雲";
    }
    return k;
  }
  function make(name, kei) {
    const n = String(name || "").trim();
    const k = keiShort(kei);
    const sep = startsEmoji(k) ? "" : "/";
    const full = "🌈" + n + "/Skyarc" + sep + k;
    if (len(full) <= LIMIT) return { text: full, len: len(full), over: false, dropped: false };
    const short = "🌈" + n + sep + k;
    return { text: short, len: len(short), over: len(short) > LIMIT, dropped: true };
  }
  const OVER_MSG = "⚠️ 20文字をこえるので、オープンチャットでは途中で途切れてしまいます。"
                 + "いったんこのままコピーして大丈夫です（あとで設定から直せます）";
  /* 結果の欄に出します。こえたときは、欄のすぐ下に注意を添えます */
  function render(box, name, kei) {
    const r = make(name, kei);
    box.textContent = r.text;
    let w = box.nextElementSibling;
    if (!w || !w.classList || !w.classList.contains("nick-warn")) {
      w = document.createElement("p");
      w.className = "nick-warn";
      w.style.cssText = "font-size:12px;color:#B3352F;line-height:1.7;margin:-6px 0 10px;";
      box.parentNode.insertBefore(w, box.nextSibling);
    }
    w.textContent = r.over ? OVER_MSG : "";
    w.style.display = r.over ? "block" : "none";
    return r;
  }
  function clearWarn(box) {
    const w = box && box.nextElementSibling;
    if (w && w.classList && w.classList.contains("nick-warn")) w.style.display = "none";
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (e2) {}
      document.body.removeChild(ta);
      return ok;
    }
  }
  window.skyNick = { make: make, render: render, clearWarn: clearWarn, copy: copy, len: len, LIMIT: LIMIT, OVER_MSG: OVER_MSG };
})();
