/* ================================================================
   初期サポート（メンバーマネジメントルームの中で使います）
   ・もとの「初期サポートマネジメント」のしくみを、そのまま部品にしたものです
   ・読みこみ：SS.load(会員) … タブ「サポート状況」から（supportList）
   ・一覧のカードの中に、①〜④の信号と（ク）（担）（紹）（説）を出します
   ・変更は、まずこの画面の中だけ。メンバーマネジメントルームの「💾 一覧の変更を保存」でまとめて保存します
================================================================ */
window.SS = (function(){
const GAS_URL = window.SKY_GAS_URL;
const $ = s=>document.querySelector(s);
const esc = t=>String(t == null ? "" : t).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let me = null, data = null, byId = {}, onChange = function(){}, toast = function(t){ alert(t); };
/* ================================================================
   項目と状態
================================================================ */
const GROUPS = [
  { key:"u",   title:"① ユーザーサポート会", items:["u"] },
  { key:"sem", title:"② LINKセミナー（5種類）", items:["s1","s2","s3","s4","s5"] },
  { key:"g",   title:"③ グルコン", items:["g"] },
  { key:"k",   title:"④ チーム交流会", items:["k"] }
];
const ITEM_LABEL = { u:"ユーザーサポート会", s1:"通常編", s2:"社長編", s3:"自己ブランディング特化版",
                     s4:"グループ構築特化版", s5:"新サービス特化版", g:"グルコン", k:"チーム交流会" };
const STATES = [
  { v:"",         t:"未案内" },
  { v:"案内した", t:"案内した（返事待ち）" },
  { v:"参加予定", t:"参加予定" },
  { v:"参加済み", t:"参加済み" },
  { v:"見送り",   t:"今回は見送り" }
];

/* ================================================================
   日付の計算（経過月数・直近3ヶ月）
================================================================ */
function today0(){ const d = new Date(); d.setHours(0,0,0,0); return d; }
function parseD(t){
  const m = String(t || "").match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}
function md(t){ const d = parseD(t); return d ? (d.getMonth() + 1) + "/" + d.getDate() : ""; }
function monthsSince(d){
  const t = today0();
  let n = (t.getFullYear() - d.getFullYear()) * 12 + (t.getMonth() - d.getMonth());
  if(t.getDate() < d.getDate()) n--;
  return Math.max(0, n);
}
function within3(d){ return d && monthsSince(d) < 3; }

/* 1つの項目の信号（①③④） */
function sigOne(key, it){
  const s = it.s, d = parseD(it.d);
  if(!s) return { c:"r", v:"未案内" };
  if(s === "案内した") return { c:"y", v:"返事待ち" + (d ? "（" + md(it.d) + " 案内）" : "") };
  if(s === "見送り") return { c:"y", v:"今回は見送り" };
  if(s === "参加予定"){
    if(!d) return { c:"y", v:"参加予定（日付なし）" };
    if(d < today0()) return { c:"r", v:md(it.d) + " の予定が過ぎています" };
    return { c:"y", v:md(it.d) + " に参加予定" };
  }
  /* 参加済み */
  if(!d) return { c:"g", v:"参加済み" };
  const n = monthsSince(d);
  const ago = n === 0 ? "今月" : n + "ヶ月前";
  if(key === "k" && n >= 3) return { c:"y", v:"前回 " + md(it.d) + "（" + ago + "）" };
  return { c:"g", v:"参加済み " + md(it.d) + "（" + ago + "）" };
}
/* セミナー5種のまとめ */
function sigSem(items){
  const ks = ["s1","s2","s3","s4","s5"];
  let done = 0, latest = null, passed = false, moving = false;
  ks.forEach(k=>{
    const it = items[k] || {}; const d = parseD(it.d);
    if(it.s === "参加済み"){ done++; if(d && (!latest || d > latest)) latest = d; }
    else if(it.s === "参加予定"){ moving = true; if(d && d < today0()) passed = true; }
    else if(it.s === "案内した" || it.s === "見送り") moving = true;
  });
  const last = latest ? "／直近 " + (latest.getMonth() + 1) + "/" + latest.getDate() : "";
  if(passed) return { c:"r", v:done + "/5 種・予定日が過ぎています" };
  if(done === 0) return moving ? { c:"y", v:"0/5 種・案内中" } : { c:"r", v:"0/5 種・未案内" };
  /* 参加した日が入っていないときは、3ヶ月の判定はしません */
  const recent = latest ? within3(latest) : null;
  if(recent === false && !moving) return { c:"r", v:done + "/5 種・3ヶ月以上あいています" + last };
  if(done === 5 && recent !== false) return { c:"g", v:"5/5 種 参加済み" + last };
  return { c:"y", v:done + "/5 種" + (recent === false ? "・3ヶ月以上あいています" : "") + last };
}
function signals(m){
  return {
    u: sigOne("u", m.items.u || {}),
    sem: sigSem(m.items),
    g: sigOne("g", m.items.g || {}),
    k: sigOne("k", m.items.k || {})
  };
}
/* ================================================================
   本人の記録（会員ご本人が、初期サポートガイド・活用の1stステップでチェックしたもの）
   サポーターの記録とは別に「🙋本人：…」と添えて、見くらべられるようにします
================================================================ */
const SELF_G = [["g1","高山翔子さん"],["g2","いと・すけさん"],["g3","冨田由起子さん"]];
function selfLine(m, g){
  const v = m.self || {};
  if(g === "u") return v.u ? "🙋本人：参加 " + md(v.u) : "";
  if(g === "sem"){
    const n = ["s1","s2","s3","s4","s5"].filter(k=>v[k]).length;
    return n ? "🙋本人：" + n + "/5 種 見た" : "";
  }
  if(g === "g"){
    const l = SELF_G.filter(x=>v[x[0]]).map(x=>x[1] + " " + md(v[x[0]]));
    return l.length ? "🙋本人：" + l.join("・") : "";
  }
  if(g === "k") return v.k ? "🙋本人：参加 " + md(v.k) : "";
  return "";
}

/* 参加予定のいちばん近い日（並べ替えに使います） */
function nextPlan(m){
  let best = null;
  Object.keys(m.items).forEach(k=>{
    const it = m.items[k]; if(it.s !== "参加予定") return;
    const d = parseD(it.d); if(d && d >= today0() && (!best || d < best)) best = d;
  });
  return best;
}


function hkey(id){ return String(id || "").replace(/^0+/, ""); }
function pad8(id){ const t = String(id || ""); return /^\d+$/.test(t) && t.length < 8 ? t.padStart(8, "0") : t; }
function who(name, id){ return name || (id ? (/^\d+$/.test(String(id)) ? pad8(id) : String(id)) : "未設定"); }
async function api(params){
  const body = Object.assign({ id:me.id, pin:me.pin, email:me.email || "" }, params);
  const res = await fetch(GAS_URL, { method:"POST", body:new URLSearchParams(body) });
  return res.json();
}
/* 読みこみ（うまくいかなかったときは、一覧の初期サポートの欄に理由を出します） */
let status = "loading";
async function load(m, opt){
  me = m; onChange = (opt && opt.onChange) || onChange; toast = (opt && opt.toast) || toast;
  status = "loading";
  try{
    const j = await api({ action:"supportList" });
    if(!j || j.ok !== true){
      status = j && j.error === "suplayout" ? "layout" : (j && j.error === "noperm" ? "noperm" : "error");
      onChange(); return false;
    }
    data = j; byId = {};
    data.members.forEach(x=>{ x.orig = JSON.parse(JSON.stringify(x.items)); byId[hkey(x.id)] = x; });
    status = "ok"; onChange(); return true;
  }catch(e){ status = "error"; onChange(); return false; }
}
function get(id){ return byId[hkey(id)] || null; }
function itemChanged(m, k){
  const a = (m.items && m.items[k]) || {}, b = (m.orig && m.orig[k]) || {};
  return (a.s || "") !== (b.s || "") || (a.d || "") !== (b.d || "");
}
function supChanges(){
  const out = [];
  (data ? data.members : []).forEach(m=>Object.keys(m.items || {}).forEach(k=>{
    if(itemChanged(m, k)) out.push({ target: m.id, item: k, state: m.items[k].s || "", date: m.items[k].d || "" });
  }));
  return out;
}
/* 並びに使う数（保存ずみの状態で）：🔴の数・🟡の数 */
function score(id){
  const m = get(id); if(!m) return { r:0, y:0 };
  const cs = Object.values(signals({ items: m.orig || m.items })).map(x=>x.c);
  return { r: cs.filter(c=>c === "r").length, y: cs.filter(c=>c === "y").length };
}
/* カードの中身 */
function cardHtml(id){
  if(status === "loading") return '<div class="ss-note">初期サポートの記録を読みこんでいます…</div>';
  if(status === "layout") return '<div class="ss-note err">「サポート状況」タブの見出しが決まった形とちがうため、初期サポートの記録を止めています。管理者の方にお知らせください。</div>';
  if(status !== "ok") return '<div class="ss-note err">初期サポートの記録を読みこめませんでした。少しおいて読み直してください。</div>';
  const m = get(id);
  if(!m) return '<div class="ss-note">初期サポートの記録はありません（あなたの担当の範囲外の方です）</div>';
  const sg = signals(m);
  const chip = g=>`<button type="button" class="ss-chip ${g.items.some(k=>itemChanged(m, k)) ? "pend" : ""}" onclick="SS.openEd('${esc(m.id)}','${g.key}')">
      <span class="ss-dot ${sg[g.key].c}"></span>
      <span><span class="t">${esc(g.title)}</span><br><span class="v">${esc(sg[g.key].v)}</span>${selfLine(m, g.key) ? `<span class="me">${esc(selfLine(m, g.key))}</span>` : ""}</span></button>`;
  return `<div class="ss-chips">${GROUPS.map(chip).join("")}</div>`;
}
function peopleHtml(id){
  const m = get(id); if(!m) return "";
  return `<span title="アップクリエ">（ク）${personHtml(m, "upline")}</span><span title="サポート担当">（担）${personHtml(m, "helper")}</span>`
    + `<span title="紹介者">（紹）${esc(who(m.introName, m.intro))}</span><span title="アドバイザー（説明してくださった方）">（説）${esc(who(m.advName, m.advId))}</span>`
    + (m.self && m.self.w ? `<span class="me" title="ご本人が「参加しました」を押した日">🙋ワイワイチャット参加 ${esc(md(m.self.w))}</span>` : "");
}
let pendingPeople = {}, ppTarget = null, ppField = "";
function effPerson(m, f){
  const p = pendingPeople[hkey(m.id)];
  if(p && p[f]) return p[f];
  return f === "upline" ? { id: m.upline, name: m.uplineName } : { id: m.helper, name: m.helperName };
}
function personHtml(m, f){
  const e = effPerson(m, f);
  const txt = esc(who(e.name, e.id));
  if(!data || !data.canPeople) return txt;
  const pend = !!(pendingPeople[hkey(m.id)] && pendingPeople[hkey(m.id)][f]);
  return `<a href="#" class="plink ${pend ? "pend" : ""}" onclick="SS.openPeople('${esc(m.id)}','${f}');return false;">${txt}</a>`;
}
function peopleChanges(){
  const out = [];
  Object.keys(pendingPeople).forEach(k=>{
    const m = data && data.members.find(x=>hkey(x.id) === k);
    if(!m) return;
    Object.keys(pendingPeople[k]).forEach(f=>out.push({ target: m.id, field: f, id: pendingPeople[k][f].id }));
  });
  return out;
}
function openPeople(id, f){
  ppTarget = data.members.find(x=>x.id === id); ppField = f;
  if(!ppTarget) return;
  const e = effPerson(ppTarget, f);
  $("#ssppTitle").textContent = f === "upline" ? "（ク）アップクリエを設定" : "（担）サポート担当を設定";
  $("#ssppWho").textContent = (ppTarget.name || "") + "さん（" + pad8(ppTarget.id) + "）";
  $("#ssppId").value = ""; $("#ssppName").value = "";
  $("#ssppRes").innerHTML = ""; $("#ssppMsg").className = "msg";
  $("#ssppClear").style.display = e.id ? "" : "none";
  $("#sspp").classList.add("show");
  setTimeout(()=>$("#ssppId").focus(), 50);
}
function closePeople(){ $("#sspp").classList.remove("show"); }
/* 照合は、共通の部品（sky-find.js）を使います（管理画面の会員の編集・まとめて登録と同じしくみです） */
function findPeople(){
  const id = String($("#ssppId").value || "").normalize("NFKC").replace(/\s/g, "");
  const nm = String($("#ssppName").value || "").trim();
  const msg = (t)=>{ $("#ssppMsg").className = "msg err"; $("#ssppMsg").textContent = t; };
  $("#ssppRes").innerHTML = ""; $("#ssppMsg").className = "msg";
  if(!id && !nm){ msg("会員番号か、お名前を入れてください"); return; }
  if(id && !/^\d+$/.test(id)){ msg("会員番号は数字で入れてください"); return; }
  skyFind.run($("#ssppRes"), { qid: id, qname: nm }, c=>pickPerson(c.id, c.name || ""),
              { auth: { id: me.id, pin: me.pin, email: me.email || "" } });
}
function pickPerson(id, name){
  if(!ppTarget) return;
  const k = hkey(ppTarget.id);
  const now = ppField === "upline" ? { id: ppTarget.upline, name: ppTarget.uplineName } : { id: ppTarget.helper, name: ppTarget.helperName };
  pendingPeople[k] = pendingPeople[k] || {};
  if(hkey(now.id) === hkey(id)) delete pendingPeople[k][ppField];   /* 元と同じなら、変更なし */
  else pendingPeople[k][ppField] = { id: id, name: name };
  if(!Object.keys(pendingPeople[k]).length) delete pendingPeople[k];
  closePeople();
  draw();
}


let edMember = null, edGroup = null, edDraft = {};
function openEd(id, gkey){
  edMember = data.members.find(m=>m.id === id);
  edGroup = GROUPS.find(g=>g.key === gkey);
  if(!edMember || !edGroup) return;
  edDraft = {};
  edGroup.items.forEach(k=>{ const it = edMember.items[k] || {}; edDraft[k] = { s: it.s || "", d: it.d || "" }; });
  $("#ssedTitle").textContent = edGroup.title;
  $("#ssedWho").textContent = (window.skyGrowth ? skyGrowth.tag(edMember.grow) : "") + (edMember.name || "") + "さん（" + edMember.id + "）";
  $("#ssedMsg").className = "msg";
  $("#ssedUpd").textContent = edMember.updated ? "最後の更新：" + edMember.updated + "　" + (edMember.updatedBy || "") : "";
  drawEd();
  $("#ssed").classList.add("show");
}
function closeEd(){ $("#ssed").classList.remove("show"); }
function toInputDate(t){ const d = parseD(t); if(!d) return ""; const p = n=>String(n).padStart(2,"0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }
function todayText(){ const d = today0(); return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate(); }
function drawEd(){
  $("#ssedBody").innerHTML = edGroup.items.map(k=>{
    const dr = edDraft[k];
    const dateLabel = dr.s === "参加予定" ? "参加する日" : dr.s === "参加済み" ? "参加した日" : dr.s === "案内した" ? "案内した日" : "日付";
    return `<div class="sem">
      ${edGroup.items.length > 1 ? `<div class="lb">${esc(ITEM_LABEL[k])}</div>` : ""}
      <div class="states">${STATES.map(st=>`<button type="button" class="${dr.s === st.v ? "on" : ""}" onclick="SS.pickState('${k}','${st.v}')">${esc(st.t)}</button>`).join("")}</div>
      ${dr.s ? `<div class="dt">${dateLabel}<input type="date" value="${toInputDate(dr.d)}" onchange="SS.pickDate('${k}',this.value)">
        ${dr.d ? `<button type="button" class="x" onclick="SS.pickDate('${k}','')">日付を消す</button>` : ""}</div>` : ""}
    </div>`;
  }).join("");
}
function pickState(k, v){
  const dr = edDraft[k];
  dr.s = v;
  if(!v) dr.d = "";
  /* 案内した・参加済みは、日付が空なら今日を入れておきます（あとで直せます） */
  else if(!dr.d && (v === "案内した" || v === "参加済み")) dr.d = todayText();
  else if(v === "参加予定" || v === "見送り"){ const d = parseD(dr.d); if(v === "見送り") dr.d = ""; else if(d && d < today0()) dr.d = ""; }
  drawEd();
}
function pickDate(k, v){ edDraft[k].d = v ? v.replace(/-/g, "/") : ""; drawEd(); }
function saveEd(){
  const changed = edGroup.items.filter(k=>{ const it = edMember.items[k] || {}; return (it.s || "") !== edDraft[k].s || (it.d || "") !== edDraft[k].d; });
  if(!changed.length){ closeEd(); return; }
  const noDate = changed.filter(k=>edDraft[k].s === "参加予定" && !edDraft[k].d);
  if(noDate.length){ $("#ssedMsg").className = "msg err"; $("#ssedMsg").textContent = "参加予定の日付を入れてください"; return; }
  /* この画面の中だけで変えます。上の「💾 一覧の変更を保存」でまとめて保存します */
  changed.forEach(k=>{ edMember.items[k] = { s: edDraft[k].s, d: edDraft[k].d }; });
  closeEd();
  draw();
}


function pendCount(){ return data ? supChanges().length + peopleChanges().length : 0; }
function discard(){
  pendingPeople = {};
  if(data) data.members.forEach(m=>{ m.items = JSON.parse(JSON.stringify(m.orig)); });
}
/* 保存（メンバーマネジメントルームの「💾 一覧の変更を保存」から） */
async function save(){
  const changes = supChanges(), pchanges = peopleChanges();
  if(!changes.length && !pchanges.length) return true;
  let allOk = true;
  try{
    if(changes.length){
      const j = await api({ action:"supportSetMany", changes: JSON.stringify(changes) });
      if(typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return false;
      if(!j || j.ok !== true){
        allOk = false;
        toast(({ busy:"いま混み合っています。少しおいてお試しください",
                 suplayout:"「サポート状況」タブの見出しが決まった形とちがうため、保存を止めました。管理者の方にお知らせください" })[j && j.error] || "初期サポートの保存ができませんでした");
      }else{
        const bad = [];
        j.results.forEach(r=>{
          const m = data.members.find(x=>x.id === r.target);
          if(!m) return;
          if(r.ok){ m.orig[r.item] = { s: r.s, d: r.d }; m.items[r.item] = { s: r.s, d: r.d }; m.updated = j.updated; m.updatedBy = j.updatedBy; }
          else{
            m.items[r.item] = JSON.parse(JSON.stringify(m.orig[r.item] || { s:"", d:"" }));
            bad.push((m.name || r.target) + "さん：" + ({ outofscope:"担当の範囲外の方です", baddate:"日付の形がちがいます" }[r.error] || "保存できませんでした"));
          }
        });
        if(bad.length){ allOk = false; alert("保存できなかった変更があります（" + bad.length + "件）\n\n" + bad.join("\n")); }
      }
    }
    if(pchanges.length){
      const j = await api({ action:"supportSetPeople", changes: JSON.stringify(pchanges) });
      if(typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return false;
      if(!j || j.ok !== true){
        allOk = false;
        toast(({ busy:"いま混み合っています。少しおいてお試しください", noperm:"アップクリエ・サポート担当の設定は、クリエーターズ以上の方ができます" })[j && j.error] || "アップクリエ・サポート担当の保存ができませんでした");
      }else{
        const bad = [];
        j.results.forEach(r=>{
          const m = data.members.find(x=>x.id === r.target);
          const k = hkey(r.target);
          if(m && r.ok){
            if(r.field === "upline"){ m.upline = r.id; m.uplineName = r.name; } else { m.helper = r.id; m.helperName = r.name; }
          }else if(m){
            bad.push((m.name || r.target) + "さんの" + (r.field === "upline" ? "アップクリエ" : "サポート担当") + "："
              + ({ outofscope:"担当の範囲外の方です", noperson:"その番号の方が名簿にいません" }[r.error] || "保存できませんでした"));
          }
          if(pendingPeople[k]){ delete pendingPeople[k][r.field]; if(!Object.keys(pendingPeople[k]).length) delete pendingPeople[k]; }
        });
        if(bad.length){ allOk = false; alert("保存できなかった変更があります（" + bad.length + "件）\n\n" + bad.join("\n")); }
      }
    }
    return allOk;
  }catch(e){ toast("通信できませんでした"); return false; }
}
/* 報告用に保存：いま表示している方（ids）の初期サポートを、スプレッドシートの「初期サポート報告」タブに足します */
async function saveReport(ids, cond){
  if(status !== "ok"){ toast("初期サポートの記録が読みこめていません"); return; }
  const list = ids.map(get).filter(Boolean);
  if(!list.length){ toast("表示している方がいません"); return; }
  if(!confirm("いま表示している " + list.length + "名の初期サポートを、スプレッドシートの「初期サポート報告」タブに保存します。\n（しぼりこみ：" + cond + "）\nよろしいですか？")) return;
  const mark = { g:"🟢", y:"🟡", r:"🔴" };
  const rows = list.map(m=>{ const sg = signals({ items: m.orig || m.items });
    return { id: m.id, name: m.name, keiretsu: m.keiretsu || "チーム未設定",
      helper: m.helperName || (m.helper ? "会員番号 " + m.helper : "未設定"),
      u: mark[sg.u.c] + " " + sg.u.v, sem: mark[sg.sem.c] + " " + sg.sem.v,
      g: mark[sg.g.c] + " " + sg.g.v, k: mark[sg.k.c] + " " + sg.k.v,
      red: String(Object.values(sg).filter(x=>x.c === "r").length) }; });
  if(typeof skyBusy === "function" && skyBusy("report")) return;
  if(typeof skyLoading === "function") skyLoading("報告用に保存しています", "しばらくお待ちください");
  try{
    const j = await api({ action:"supportReport", rows: JSON.stringify(rows), cond: cond });
    if(typeof skyLoadingDone === "function") skyLoadingDone();
    if(typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return;
    if(!j || j.ok !== true){
      toast(({ busy:"いま混み合っています。少しおいてお試しください",
               suplayout:"「初期サポート報告」タブの見出しが決まった形とちがうため、保存を止めました" })[j && j.error] || "保存できませんでした");
      return;
    }
    toast("✅ " + j.count + "名分を「" + j.sheet + "」タブに保存しました（" + j.at + "）");
  }catch(e){
    if(typeof skyLoadingDone === "function") skyLoadingDone();
    toast("通信できませんでした");
  }finally{ if(typeof skyBusyEnd === "function") skyBusyEnd("report"); }
}
function draw(){ onChange(); }
return { load, get, cardHtml, peopleHtml, score, pendCount, discard, save, saveReport,
         openEd, closeEd, pickState, pickDate, saveEd, openPeople, closePeople, findPeople, pickPerson,
         status: ()=>status };
})();
