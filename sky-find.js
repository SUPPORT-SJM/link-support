/* ================================================================
   照合（「この方ですか？」）の共通部品
   ----------------------------------------------------------------
   会員番号か、お名前（一部だけでも）を入れると、名簿から候補をさがして
   「この方ですか？」とおたずねします。次の画面で同じものを使います。
     ・会員情報登録ページ（touroku.html）… 紹介者・アップ・担当・アドバイザー
     ・管理画面の会員の編集 … 紹介者・アップクリエ・サポート担当・アドバイザー
     ・初期サポートマネジメント … （ク）アップクリエ・（担）サポート担当
     ・まとめて登録／更新 … 候補に見つからないときの「手で入れて照合」

   さがす範囲
     ・ログインしていない画面 … ぴったり同じお名前の方だけ（ほかの方の情報を出しすぎないため）
     ・管理画面など … ぴったり同じ方は名簿全体から、一部だけ合う方（名字だけ・下の名前だけなど）は
                      その方が見られる範囲から。scopeOnly のときは見られる範囲だけ

   使い方
     const r = await skyFind.search({ qid:"00012345" } または { qname:"さかい" }, { auth, scopeOnly })
       → { ok, list:[{ id, name, realName, keiretsu, exact }], mismatch, miss, more, error }
     skyFind.show(box, r, onPick, { scopeOnly })   … 候補を出して、えらばれたら onPick(候補)
     skyFind.run(box, 入れた文字, onPick, { auth, scopeOnly })  … 上の2つをまとめて
================================================================ */
(function () {
  const esc = (t)=>String(t == null ? "" : t).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const half = (t)=>{ let x = String(t == null ? "" : t); try{ x = x.normalize("NFKC"); }catch(e){} return x.trim(); };

  /* 入れた文字が番号か、お名前かを見分けます */
  function parse(text){
    const t = half(text);
    const d = t.replace(/[\s-]/g, "");
    if(/^\d+$/.test(d)) return { qid: d, qname: "" };
    return { qid: "", qname: t };
  }

  /* ログインしている方（管理画面などで使います） */
  function auth(){
    try{
      const m = JSON.parse(localStorage.getItem("skyarc_member") || "null");
      if(m && m.id && m.pin) return { id: m.id, pin: m.pin, email: m.email || "" };
    }catch(e){}
    return null;
  }

  async function getJson(params){
    const q = Object.keys(params).map(k=>k + "=" + encodeURIComponent(params[k] == null ? "" : params[k])).join("&");
    const res = await fetch(window.SKY_GAS_URL + "?" + q);
    return res.json();
  }

  /* さがします（ログインしていない画面では、ぴったり同じ方だけ） */
  async function search(q, opt){
    opt = opt || {};
    const qid = half(q.qid).replace(/\s/g, ""), qname = half(q.qname);
    if(!qid && !qname) return { ok:false, error:"missing" };
    if(qid && !/^\d+$/.test(qid)) return { ok:false, error:"badid" };
    const a = opt.auth === undefined ? null : opt.auth;
    if(a && a.id && a.pin){
      const j = await getJson({ action:"findPerson", id:a.id, pin:a.pin, email:a.email || "",
                                qid: qid, qname: qname, scopeOnly: opt.scopeOnly ? "1" : "0" });
      if(typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return { ok:false, error:"maintenance" };
      return j || { ok:false };
    }
    if(qid){
      const j = await getJson({ action:"matchIdName", id:qid, name:qname });
      if(typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return { ok:false, error:"maintenance" };
      if(!j || j.ok !== true) return { ok:false, error: j && j.error };
      if(!j.found) return { ok:true, list:[], miss:"id" };
      return { ok:true, list:[{ id:qid, name:j.name, keiretsu:j.keiretsu, exact:true }], mismatch: !!qname && j.match === false };
    }
    const j = await getJson({ action:"findByName", name:qname });
    if(typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return { ok:false, error:"maintenance" };
    if(!j || j.ok !== true) return { ok:false, error: j && j.error };
    return { ok:true, list:(j.members || []).map(m=>Object.assign({ exact:true }, m)) };
  }

  /* 見た目（どの画面でも同じに見えるように、ここで用意します） */
  function css(){
    if(document.getElementById("skyFindCss")) return;
    const st = document.createElement("style");
    st.id = "skyFindCss";
    st.textContent = ".skf-box{margin-top:6px;}"
      + ".skf-note{font-size:12px;color:#8A6D00;line-height:1.7;margin:6px 0 2px;}"
      + ".skf-ng{font-size:12px;color:#B3352F;line-height:1.7;margin:6px 0 2px;}"
      + ".skf-ok{font-size:12px;color:#2F7A5C;font-weight:700;line-height:1.7;margin:6px 0 2px;}"
      + ".skf-cand{border:1.5px solid #E4E0F0;border-radius:11px;padding:9px 11px;margin-top:6px;font-size:13px;background:#fff;text-align:left;}"
      + ".skf-cand small{display:block;color:#8A84A0;font-size:11px;margin-top:1px;}"
      + ".skf-cand button{margin-top:7px;width:100%;padding:8px;border-radius:9px;border:none;background:#6E5FB5;color:#fff;font-weight:700;font-size:12.5px;cursor:pointer;font-family:inherit;}";
    document.head.appendChild(st);
  }

  /* 候補を出します。えらばれたら onPick(候補) */
  function show(box, r, onPick, opt){
    opt = opt || {};
    css();
    box.classList.add("skf-box");
    if(!r || r.ok !== true){
      const e = r && r.error;
      box.innerHTML = `<p class="skf-ng">${esc(({
        missing:"会員番号か、お名前を入れてください", badid:"会員番号は数字で入れてください",
        short:"もう少しくわしく入れてください（名字だけ・下の名前だけでも大丈夫です）",
        noperm:"この画面からは照合できません", pin:"ログインし直してから、お試しください",
        maintenance:"ただいまデータの整理中です"
      })[e] || "照合できませんでした。少しおいてお試しください")}</p>`;
      return;
    }
    const list = r.list || [];
    if(!list.length){
      box.innerHTML = `<p class="skf-ng">${r.miss === "id"
        ? (opt.scopeOnly ? "見られる範囲に、その会員番号の方はいません" : "その会員番号の方は、名簿に見つかりませんでした")
        : "見つかりませんでした。名字だけ・下の名前だけ・ニックネームなど、ほかの書き方でもお試しください"}</p>`;
      return;
    }
    let note = "";
    if(r.mismatch) note = "この会員番号の方は「" + esc(list[0].name) + "」さんです。入れたお名前とは合いません。";
    else if(list.length > 1) note = (list.every(c=>c.exact) ? "同じお名前の方が " + list.length + "人います。" : "あてはまりそうな方が " + list.length + "人" + (r.more ? "以上" : "") + "います。")
      + "番号と系列で見分けてください。";
    else if(!list[0].exact) note = "一部だけ合う方です。";
    box.innerHTML = (note ? `<p class="skf-note">${note}</p>` : "")
      + list.map((c, i)=>`<div class="skf-cand">この方ですか？<br><b>${esc(c.name || "（お名前未登録）")}</b>さん`
        + (c.realName && c.realName !== c.name ? `（${esc(c.realName)}）` : "")
        + `<small>${esc(c.id)}${c.keiretsu ? "｜" + esc(c.keiretsu) : ""}</small>`
        + `<button type="button" data-i="${i}">はい、この方にする</button></div>`).join("");
    box.querySelectorAll(".skf-cand button").forEach(b=>b.addEventListener("click", ()=>{
      const c = list[Number(b.dataset.i)];
      box.innerHTML = `<p class="skf-ok">✓ ${esc(c.name || "")}さん（${esc(c.id)}${c.keiretsu ? "｜" + esc(c.keiretsu) : ""}）にしました</p>`;
      if(onPick) onPick(c);
    }));
  }

  /* 入れた文字でさがして、候補を出します */
  async function run(box, text, onPick, opt){
    opt = opt || {};
    const q = (text && typeof text === "object") ? text : parse(text);
    css();
    box.classList.add("skf-box");
    box.innerHTML = '<p class="skf-note">照合しています…</p>';
    let r;
    try{ r = await search(q, opt); }catch(e){ r = { ok:false, error:"net" }; }
    show(box, r, onPick, opt);
    return r;
  }

  window.skyFind = { parse, auth, search, show, run, esc };
})();
