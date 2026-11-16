/* ================================================================
   集客の環境（v1.2.086）
   ・SASAEAI のプロフィールURL：入れる →「できた（保存する）」→ URLをコピー・QRコード
   ・LINK-BASE の事業URL：カテゴリ・タイトル・URLを入れて「できた（保存する）」で足していきます（いくつでも）
       v1.2.088：えらんでいる事業を消せます（linkbaseDel）
       v1.2.089：ごみ箱の四角いボタンだけに。並べかえ（↕ を押したまま上下。linkbaseOrder）と「すべて表示」のページ
       新しい3つを出し、「もっと見る」で全部。えらんだ事業のQRコードとURLのコピー
   ・ホームの「LINKを知ろう › 集客の環境を整えよう」と、便利な情報一覧の SASAEAI・LINK-BASE の丸で、同じものを出します
   ・保存先：スプレッドシートのタブ「SASAEAIプロフィール」「LINK-BASE掲載」（GAS：myLinks・sasaeaiSave・linkbaseAdd）
   ・QRコードは qrcode.js（qrcode-generator、MITライセンス）で、その場で作ります
================================================================ */
(function(){
  const CSS = `
.skl{margin:10px 0 2px;text-align:left}
.skl .skl-lab{display:block;font-size:13px;font-weight:700;color:#1565C0;margin:8px 0 4px}
.skl input[type=url],.skl input[type=text]{width:100%;border:1.5px solid #BBDEFB;border-radius:10px;padding:10px 12px;font-size:16px;font-family:inherit;color:#37474F;background:#fff;margin-bottom:6px;box-sizing:border-box}
.skl .skl-btn{display:block;width:100%;margin:8px 0 0;padding:12px;border-radius:12px;border:2px solid #1E88E5;background:#1E88E5;color:#fff;font-family:inherit;font-weight:700;font-size:15px;cursor:pointer}
.skl .skl-btn.sub{background:#fff;color:#2E7D32;border-color:#43A047}
.skl .skl-btn.sub.done{background:#43A047;color:#fff}
.skl .skl-btn:disabled{opacity:.45;cursor:default}
.skl .skl-msg{font-size:13px;font-weight:700;margin:6px 0 0;min-height:1em}
.skl .skl-url{font-size:12.5px;word-break:break-all;background:#F5F9FF;border-radius:8px;padding:6px 8px;margin-top:8px;line-height:1.5}
.skl .skl-qr{display:block;width:170px;height:170px;margin:10px auto 2px;border-radius:12px;border:1px solid #E0E0E0;image-rendering:pixelated;background:#fff}
.skl .skl-qrt{text-align:center;font-size:13.5px;font-weight:700;margin-top:4px}
.skl .skl-go{display:block;text-align:center;margin:12px 0 2px;color:#1565C0;font-weight:700;text-decoration:underline;font-size:15px}
.skl .skl-sec{font-family:"Zen Maru Gothic",sans-serif;font-weight:900;font-size:15px;color:#1565C0;margin:14px 0 4px;padding-top:10px;border-top:1px dashed #CFD8DC}
.skl .skl-it{display:flex;align-items:flex-start;gap:8px;border:2px solid #E3E8F0;border-radius:12px;padding:8px 10px;margin:6px 0;cursor:pointer}
.skl .skl-it.on{border-color:#1E88E5;background:#F5F9FF}
.skl .skl-it input{width:20px;height:20px;margin-top:3px;flex:none;accent-color:#1E88E5}
.skl .skl-it .c{display:inline-block;background:#E3F2FD;color:#1565C0;border-radius:999px;font-size:11.5px;font-weight:700;padding:0 8px;margin-right:4px}
.skl .skl-it .t{font-weight:700;font-size:14.5px;line-height:1.5}
.skl .skl-it .d{font-size:11.5px;color:#78909C}
.skl .skl-more{display:block;width:100%;margin-top:4px;padding:8px;border:none;background:none;color:#1565C0;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer;text-decoration:underline}
.skl .skl-empty{font-size:13.5px;color:#607D8B}
.skl .skl-cur{background:#F5F9FF;border:2px solid #BBDEFB;border-radius:14px;padding:10px 12px;margin:12px 0 4px}
.skl .skl-curt{font-weight:900;font-size:15.5px;line-height:1.5;margin:0}
.skl .skl-cur .c,.skl .skl-it .c{display:inline-block;background:#E3F2FD;color:#1565C0;border-radius:999px;font-size:11.5px;font-weight:700;padding:0 8px;margin-right:4px;vertical-align:1px}
.skl .skl-cur .skl-url{background:#fff}
.skl .skl-qrrow{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:6px}
.skl .skl-qrrow .skl-qr{margin:4px 0}
.skl .skl-trash{flex:none;width:48px;height:48px;border-radius:12px;border:2px solid #E57373;background:#fff;color:#C62828;font-size:22px;line-height:1;cursor:pointer;display:grid;place-items:center;padding:0}
.skl .skl-trash:disabled{opacity:.5}
.skl .skl-hint{font-size:12.5px;color:#607D8B;margin:2px 0 4px;line-height:1.6}
.skl .skl-it .skl-pick{flex:1;display:flex;gap:8px;align-items:flex-start;cursor:pointer;min-width:0}
.skl .skl-h{flex:none;width:40px;align-self:stretch;display:grid;place-items:center;font-size:20px;color:#90A4AE;border-left:1px dashed #CFD8DC;margin:-8px -10px -8px 0;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.skl .skl-it.drag{box-shadow:0 10px 24px rgba(30,80,140,.28);border-color:#1E88E5;background:#fff;position:relative;z-index:2}
.skl .skl-it.drag .skl-h{cursor:grabbing;color:#1E88E5}
#sklAll{position:fixed;inset:0;z-index:99990;background:#fff;display:flex;flex-direction:column}
#sklAll .skl-allhead{flex:none;padding:calc(env(safe-area-inset-top) + 14px) 16px 10px;font-family:"Zen Maru Gothic",sans-serif;font-weight:900;font-size:17px;color:#1565C0;border-bottom:3px solid #BBDEFB}
#sklAll .skl-allbody{flex:1;overflow:auto;padding:4px 16px 16px}
#sklAll .skl-allfoot{flex:none;padding:10px 16px calc(env(safe-area-inset-bottom) + 12px);border-top:1px solid #E3E8F0}
#sklAll .skl-allfoot button{display:block;width:100%;padding:12px;border-radius:12px;border:2px solid #CFD8DC;background:#fff;color:#455A64;font-family:inherit;font-weight:700;font-size:15px;cursor:pointer}
#sklConf{position:fixed;inset:0;z-index:99999;background:rgba(20,25,60,.45);display:flex;align-items:center;justify-content:center;padding:16px}
#sklConf .p{background:#fff;border-radius:16px;max-width:360px;width:100%;padding:16px;font-size:15px;line-height:1.7}
#sklConf .r{display:flex;gap:8px;margin-top:12px}
#sklConf button{flex:1;border-radius:12px;padding:11px;font-family:inherit;font-weight:700;font-size:15px;cursor:pointer}
`;
  function addCss(){ if(document.getElementById("sklCss")) return; const s = document.createElement("style"); s.id = "sklCss"; s.textContent = CSS; document.head.appendChild(s); }
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function me(){ try{ const m = JSON.parse(localStorage.getItem("skyarc_member") || "null"); return m && m.id ? m : null; }catch(e){ return null; } }
  async function copyText(t){
    try{ if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(t); return true; } }catch(e){}
    try{
      const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.fontSize = "16px";
      document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, t.length); const ok = document.execCommand("copy"); ta.remove(); return ok;
    }catch(e){ return false; }
  }
  function qrSrc(url){
    try{ const q = qrcode(0, "M"); q.addData(url); q.make(); return q.createDataURL(6, 8); }catch(e){ return ""; }
  }
  /* 確かめの小さなまど（ブラウザの確認ダイアログは使いません） */
  function sklConfirm(text, yes){
    const d = document.createElement("div"); d.id = "sklConf";
    d.innerHTML = '<div class="p"><p>' + esc(text) + '</p><div class="r"><button type="button" style="background:#fff;border:2px solid #CFD8DC;color:#455A64">いいえ</button><button type="button" style="background:#E53935;border:2px solid #E53935;color:#fff">はい</button></div></div>';
    document.body.appendChild(d);
    const b = d.querySelectorAll("button");
    b[0].onclick = () => d.remove();
    b[1].onclick = () => { d.remove(); yes(); };
  }
  let cache = null;
  async function api(params, post){
    const m = me(); const body = Object.assign({ id:m.id, pin:m.pin }, params);
    const u = window.SKY_GAS_URL;
    const r = post ? await fetch(u, { method:"POST", body:new URLSearchParams(body) }) : await fetch(u + "?" + new URLSearchParams(body).toString());
    return r.json();
  }
  async function load(force){
    if(cache && !force) return cache;
    const j = await api({ action:"myLinks" });
    if(j && j.ok) cache = j;
    return j;
  }
  function needLogin(box){ box.innerHTML = '<div class="skl"><p class="skl-empty">ログインすると、ここに保存できます。</p></div>'; }
  function errText(j){ return j && j.error === "unknown_action" ? "まだしくみが用意できていません（GASの更新待ち）。" : "読み込めませんでした。少しおいてお試しください。"; }
  function copyBtn(btn, msg, url, label){
    btn.onclick = async () => {
      const ok = await copyText(url);
      btn.classList.toggle("done", ok); btn.textContent = ok ? "✓ コピーしました" : label;
      msg.textContent = ok ? "そのまま貼りつけて使えます" : "コピーできませんでした。URLを長押ししてコピーしてください";
      msg.style.color = ok ? "#2E7D32" : "#C62828";
    };
  }

  /* ---------- SASAEAI ---------- */
  async function sasaeai(box, opt){
    opt = opt || {}; addCss();
    if(!me()) return needLogin(box);
    box.innerHTML = '<div class="skl"><p class="skl-empty">読み込んでいます…</p></div>';
    let d = null; try{ d = await load(); }catch(e){}
    if(!d || !d.ok){ box.innerHTML = '<div class="skl"><p class="skl-empty">' + errText(d) + '</p></div>'; return; }
    const draw = () => {
      const url = cache.sasaeai || "";
      box.innerHTML = '<div class="skl">' +
        (opt.view && url ? '<p style="font-weight:700;">あなたのSASAEAIのURLはこちらです</p>' : '') +
        '<label class="skl-lab">🤝 あなたのSASAEAIのプロフィールURL</label>' +
        '<input type="url" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="https://…" value="' + esc(url) + '">' +
        '<button type="button" class="skl-btn" data-k="save">✅ できた（保存する）</button><p class="skl-msg" data-k="smsg"></p>' +
        '<button type="button" class="skl-btn sub" data-k="copy"' + (url ? "" : " disabled") + '>📋 URLをコピーする</button><p class="skl-msg" data-k="cmsg"></p>' +
        (url ? '<img class="skl-qr" alt="SASAEAIのプロフィールのQRコード" src="' + qrSrc(url) + '"><p class="skl-qrt">スマホのカメラで読みとれます</p>' : '<p class="skl-empty">保存すると、URLのコピーとQRコードが出ます。</p>') +
        (opt.view ? '<a class="skl-go" href="https://sasaeai.link-platform.jp/" target="_blank" rel="noopener">SASAEAIマッチングサイトにアクセスする ›</a>' : '') +
        '</div>';
      const q = k => box.querySelector('[data-k="' + k + '"]');
      if(url) copyBtn(q("copy"), q("cmsg"), url, "📋 URLをコピーする");
      q("save").onclick = async () => {
        const v = box.querySelector("input").value.trim(), m = q("smsg");
        if(!/^https?:\/\/\S+$/i.test(v)){ m.textContent = "⚠️ https:// から始まるURLを貼りつけてください"; m.style.color = "#C62828"; return; }
        m.textContent = "☁️ 保存しています…"; m.style.color = "#607D8B"; q("save").disabled = true;
        try{
          const j = await api({ action:"sasaeaiSave", url:v }, true);
          if(j && j.ok){ cache.sasaeai = j.url; draw(); const m2 = q("smsg"); m2.textContent = "✅ 保存しました"; m2.style.color = "#2E7D32"; if(opt.onSaved) opt.onSaved(); return; }
          m.textContent = j && j.error === "badurl" ? "⚠️ URLの形がちがうようです" : errText(j).replace("読み込めませんでした", "保存できませんでした"); m.style.color = "#C62828";
        }catch(e){ m.textContent = "通信できませんでした。電波のよいところでお試しください"; m.style.color = "#C62828"; }
        q("save").disabled = false;
      };
    };
    draw();
  }

  /* ---------- LINK-BASE ----------
     v1.2.089：えらんでいる事業（タイトル・URL・QRコード、右にごみ箱の四角いボタン）を上に。
       その下に、掲載した事業の上から3つ。↕ を押したまま上下に動かすと、並びを変えられます（上の3つの中で）。
       4つ以上あるときは「すべて表示」で、全部の一覧のページ（そこでも並べかえられます） */
  const keyOf = x => x.at + "\t" + x.url;
  function sortable(ul, onDone){
    ul.querySelectorAll(".skl-h").forEach(h => h.addEventListener("pointerdown", e => {
      if(e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      const it = h.closest(".skl-it"), before0 = [...ul.querySelectorAll(".skl-it")].map(x => x.dataset.key).join("\n");
      it.classList.add("drag");
      const pid = e.pointerId;   /* 並べかえると要素が動くので、動きは window で受けます */
      const sc = ul.closest(".skl-allbody") || ul.closest(".pop") || ul.closest("#taskBody") || null;
      const move = ev => {
        if(ev.pointerId !== pid) return;
        ev.preventDefault();
        const y = ev.clientY;
        const sibs = [...ul.querySelectorAll(".skl-it")].filter(x => x !== it);
        let tgt = null;
        for(const s of sibs){ const r = s.getBoundingClientRect(); if(y < r.top + r.height / 2){ tgt = s; break; } }
        if(tgt){ if(tgt !== it.nextSibling) ul.insertBefore(it, tgt); } else if(ul.lastElementChild !== it) ul.appendChild(it);
        /* 画面のはしに近づいたら、少しずつ送ります */
        if(sc){ const r = sc.getBoundingClientRect(); if(y < r.top + 40) sc.scrollTop -= 12; else if(y > r.bottom - 40) sc.scrollTop += 12; }
      };
      const up = ev => {
        if(ev && ev.pointerId !== pid) return;
        removeEventListener("pointermove", move); removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
        it.classList.remove("drag");
        const keys = [...ul.querySelectorAll(".skl-it")].map(x => x.dataset.key);
        if(keys.join("\n") !== before0) onDone(keys);
      };
      addEventListener("pointermove", move, { passive:false }); addEventListener("pointerup", up); addEventListener("pointercancel", up);
    }));
  }
  function itemsHtml(list, selKey){
    return list.map(x => '<div class="skl-it' + (keyOf(x) === selKey ? " on" : "") + '" data-key="' + esc(keyOf(x)) + '">' +
      '<span class="skl-pick"><input type="radio" tabindex="-1"' + (keyOf(x) === selKey ? " checked" : "") + '><span><span class="t">' + (x.cat ? '<span class="c">' + esc(x.cat) + '</span>' : '') + esc(x.title) + '</span><br><span class="d">' + esc(x.at) + '</span></span></span>' +
      '<span class="skl-h" aria-label="押したまま上下に動かすと、並びを変えられます">↕</span></div>').join("");
  }
  async function linkbase(box, opt){
    opt = opt || {}; addCss();
    if(!me()) return needLogin(box);
    box.innerHTML = '<div class="skl"><p class="skl-empty">読み込んでいます…</p></div>';
    let d = null; try{ d = await load(); }catch(e){}
    if(!d || !d.ok){ box.innerHTML = '<div class="skl"><p class="skl-empty">' + errText(d) + '</p></div>'; return; }
    let selKey = "", flash = "";
    const list = () => cache.linkbase || [];
    const curOf = () => { const l = list(); return l.find(x => keyOf(x) === selKey) || l[0] || null; };
    /* 並びを保存します（先に画面を変えて、うしろで保存） */
    async function saveOrder(keys, msgEl){
      const old = list().slice(), byKey = {};
      old.forEach(x => byKey[keyOf(x)] = x);
      const rest = old.filter(x => keys.indexOf(keyOf(x)) < 0);
      cache.linkbase = keys.map(k => byKey[k]).filter(Boolean).concat(rest);
      flash = "↕ 並びを変えました";
      draw(); if(allOpen) drawAll();
      try{
        const j = await api({ action:"linkbaseOrder", keys:JSON.stringify(cache.linkbase.map(keyOf)) }, true);
        if(j && j.ok) return;
        cache.linkbase = old; flash = "⚠️ 並びを保存できませんでした。少しおいてお試しください";
      }catch(e){ cache.linkbase = old; flash = "⚠️ 通信できませんでした。電波のよいところでお試しください"; }
      draw(); if(allOpen) drawAll();
    }
    const draw = (saved) => {
      const l = list(), cur = curOf();
      if(cur) selKey = keyOf(cur);
      const top = l.slice(0, 3);
      box.innerHTML = '<div class="skl">' +
        '<label class="skl-lab">🏷️ カテゴリ</label><input type="text" data-k="cat" placeholder="例：美容・健康">' +
        '<label class="skl-lab">🏰 事業のタイトル</label><input type="text" data-k="title" placeholder="例：はじめてのヨガ教室">' +
        '<label class="skl-lab">🔗 LINK-BASEの事業のURL</label><input type="url" data-k="url" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="https://…">' +
        '<button type="button" class="skl-btn" data-k="save">✅ できた（保存する）</button><p class="skl-msg" data-k="smsg"></p>' +
        (cur ? '<div class="skl-cur"><p class="skl-curt">' + (cur.cat ? '<span class="c">' + esc(cur.cat) + '</span>' : '') + esc(cur.title) + '</p><div class="skl-url">' + esc(cur.url) + '</div>' +
          '<div class="skl-qrrow"><img class="skl-qr" alt="' + esc(cur.title) + 'のQRコード" src="' + qrSrc(cur.url) + '"><button type="button" class="skl-trash" data-k="del" aria-label="この掲載URLを削除する">🗑</button></div>' +
          '<button type="button" class="skl-btn sub" data-k="copy">📋 URLをコピーする</button><p class="skl-msg" data-k="cmsg"></p></div>' : '') +
        '<p class="skl-sec">📚 あなたの掲載した事業' + (l.length ? '（' + l.length + '件）' : '') + '</p>' +
        (l.length ? (l.length > 1 ? '<p class="skl-hint">タップでえらぶと、上にQRコードが出ます。<b>↕</b> を押したまま上下に動かすと、並びを変えられます。</p>' : '') +
            '<div class="skl-list" data-k="list">' + itemsHtml(top, selKey) + '</div>' +
            (l.length > 3 ? '<button type="button" class="skl-more" data-k="all">📋 すべて表示（全部で' + l.length + '件）</button>' : '') +
            '<p class="skl-msg" data-k="omsg"></p>'
          : '<p class="skl-empty">まだありません。上で入れて「できた（保存する）」を押すと、ここに出ます。</p>') +
        (opt.view ? '<a class="skl-go" href="https://link-base.jp/" target="_blank" rel="noopener">LINK-BASEサイトにアクセスする ›</a>' : '') +
        '</div>';
      const q = k => box.querySelector('[data-k="' + k + '"]');
      if(saved){ const m = q("smsg"); m.textContent = "✅ 保存しました"; m.style.color = "#2E7D32"; }
      if(flash && q("omsg")){ q("omsg").textContent = flash; q("omsg").style.color = /⚠️/.test(flash) ? "#C62828" : "#2E7D32"; flash = ""; }
      if(q("list")){
        q("list").querySelectorAll(".skl-pick").forEach(p => p.onclick = () => { selKey = p.closest(".skl-it").dataset.key; draw(); });
        sortable(q("list"), keys => saveOrder(keys.concat(list().slice(3).map(keyOf))));
      }
      if(q("all")) q("all").onclick = openAll;
      if(cur){
        copyBtn(q("copy"), q("cmsg"), cur.url, "📋 URLをコピーする");
        q("del").onclick = () => sklConfirm("こちらの掲載URLを削除しますか？", async () => {
          const m = q("cmsg"); m.textContent = "削除しています…"; m.style.color = "#607D8B"; q("del").disabled = true;
          try{
            const j = await api({ action:"linkbaseDel", at:cur.at, url:cur.url }, true);
            if(j && j.ok){ cache = j; selKey = ""; flash = "🗑 削除しました"; draw(); if(allOpen) drawAll(); return; }
            m.textContent = j && j.error === "notfound" ? "見つかりませんでした。ページを開きなおしてください" : errText(j).replace("読み込めませんでした", "削除できませんでした"); m.style.color = "#C62828";
          }catch(e){ m.textContent = "通信できませんでした。電波のよいところでお試しください"; m.style.color = "#C62828"; }
          q("del").disabled = false;
        });
      }
      q("save").onclick = async () => {
        const cat = q("cat").value.trim(), title = q("title").value.trim(), url = q("url").value.trim(), m = q("smsg");
        if(!title){ m.textContent = "⚠️ 事業のタイトルを入れてください"; m.style.color = "#C62828"; return; }
        if(!/^https?:\/\/\S+$/i.test(url)){ m.textContent = "⚠️ https:// から始まるURLを貼りつけてください"; m.style.color = "#C62828"; return; }
        m.textContent = "☁️ 保存しています…"; m.style.color = "#607D8B"; q("save").disabled = true;
        try{
          const j = await api({ action:"linkbaseAdd", cat:cat, title:title, url:url }, true);
          if(j && j.ok){ cache = j; selKey = ""; draw(true); if(opt.onSaved) opt.onSaved(); return; }
          m.textContent = j && j.error === "badurl" ? "⚠️ URLの形がちがうようです" : errText(j).replace("読み込めませんでした", "保存できませんでした"); m.style.color = "#C62828";
        }catch(e){ m.textContent = "通信できませんでした。電波のよいところでお試しください"; m.style.color = "#C62828"; }
        q("save").disabled = false;
      };
    };
    /* すべて表示のページ（画面いっぱい） */
    let allOpen = null;
    function openAll(){
      allOpen = document.createElement("div"); allOpen.id = "sklAll";
      allOpen.innerHTML = '<div class="skl-allhead">📚 掲載した事業（すべて）</div><div class="skl-allbody"><div class="skl"></div></div><div class="skl-allfoot"><button type="button">もどる</button></div>';
      document.body.appendChild(allOpen);
      allOpen.querySelector(".skl-allfoot button").onclick = () => { allOpen.remove(); allOpen = null; draw(); };
      drawAll();
    }
    function drawAll(){
      const l = list(), body = allOpen.querySelector(".skl");
      body.innerHTML = '<p class="skl-hint">タップでえらぶと、もどったときにその事業のQRコードが出ます。<b>↕</b> を押したまま上下に動かすと、並びを変えられます。</p>' +
        '<div class="skl-list">' + itemsHtml(l, selKey) + '</div><p class="skl-msg" data-k="aomsg"></p>';
      const ul = body.querySelector(".skl-list");
      ul.querySelectorAll(".skl-pick").forEach(p => p.onclick = () => { selKey = p.closest(".skl-it").dataset.key; drawAll(); });
      sortable(ul, keys => saveOrder(keys));
    }
    draw();
  }

  window.skyLinks = { sasaeai: sasaeai, linkbase: linkbase, load: load };
})();
