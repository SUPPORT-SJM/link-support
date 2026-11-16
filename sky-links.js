/* ================================================================
   集客の環境（v1.2.086）
   ・SASAEAI のプロフィールURL：入れる →「できた（保存する）」→ URLをコピー・QRコード
   ・LINK-BASE の事業URL：カテゴリ・タイトル・URLを入れて「できた（保存する）」で足していきます（いくつでも）
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

  /* ---------- LINK-BASE ---------- */
  async function linkbase(box, opt){
    opt = opt || {}; addCss();
    if(!me()) return needLogin(box);
    box.innerHTML = '<div class="skl"><p class="skl-empty">読み込んでいます…</p></div>';
    let d = null; try{ d = await load(); }catch(e){}
    if(!d || !d.ok){ box.innerHTML = '<div class="skl"><p class="skl-empty">' + errText(d) + '</p></div>'; return; }
    let sel = 0, all = false;
    const draw = (saved) => {
      const list = cache.linkbase || [];
      if(sel >= list.length) sel = 0;
      const shown = all ? list : list.slice(0, 3);
      if(sel >= shown.length) sel = 0;
      const cur = list[sel];
      box.innerHTML = '<div class="skl">' +
        '<label class="skl-lab">🏷️ カテゴリ</label><input type="text" data-k="cat" placeholder="例：美容・健康">' +
        '<label class="skl-lab">🏰 事業のタイトル</label><input type="text" data-k="title" placeholder="例：はじめてのヨガ教室">' +
        '<label class="skl-lab">🔗 LINK-BASEの事業のURL</label><input type="url" data-k="url" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="https://…">' +
        '<button type="button" class="skl-btn" data-k="save">✅ できた（保存する）</button><p class="skl-msg" data-k="smsg"></p>' +
        '<p class="skl-sec">📚 あなたの掲載した事業' + (list.length ? '（' + list.length + '件）' : '') + '</p>' +
        (list.length ? shown.map((x, i) => '<label class="skl-it' + (i === sel ? " on" : "") + '"><input type="radio" name="sklLb" value="' + i + '"' + (i === sel ? " checked" : "") + '><span><span class="t">' + (x.cat ? '<span class="c">' + esc(x.cat) + '</span>' : '') + esc(x.title) + '</span><br><span class="d">' + esc(x.at) + '</span></span></label>').join("") +
          (list.length > 3 ? '<button type="button" class="skl-more" data-k="more">' + (all ? "▲ 新しい3つだけにする" : "▼ もっと見る（全部で" + list.length + "件）") + '</button>' : '')
          : '<p class="skl-empty">まだありません。上で入れて「できた（保存する）」を押すと、ここに出ます。</p>') +
        (cur ? '<p class="skl-qrt" style="margin-top:10px;">' + esc(cur.title) + '</p><div class="skl-url">' + esc(cur.url) + '</div>' +
          '<button type="button" class="skl-btn sub" data-k="copy">📋 URLをコピーする</button><p class="skl-msg" data-k="cmsg"></p>' +
          '<img class="skl-qr" alt="' + esc(cur.title) + 'のQRコード" src="' + qrSrc(cur.url) + '"><p class="skl-qrt">スマホのカメラで読みとれます</p>' : '') +
        (opt.view ? '<a class="skl-go" href="https://link-base.jp/" target="_blank" rel="noopener">LINK-BASEサイトにアクセスする ›</a>' : '') +
        '</div>';
      const q = k => box.querySelector('[data-k="' + k + '"]');
      if(saved){ const m = q("smsg"); m.textContent = "✅ 保存しました（下のいちばん上に出ています）"; m.style.color = "#2E7D32"; }
      box.querySelectorAll('input[name=sklLb]').forEach(r => r.onchange = () => { sel = +r.value; draw(); });
      if(q("more")) q("more").onclick = () => { all = !all; draw(); };
      if(cur) copyBtn(q("copy"), q("cmsg"), cur.url, "📋 URLをコピーする");
      q("save").onclick = async () => {
        const cat = q("cat").value.trim(), title = q("title").value.trim(), url = q("url").value.trim(), m = q("smsg");
        if(!title){ m.textContent = "⚠️ 事業のタイトルを入れてください"; m.style.color = "#C62828"; return; }
        if(!/^https?:\/\/\S+$/i.test(url)){ m.textContent = "⚠️ https:// から始まるURLを貼りつけてください"; m.style.color = "#C62828"; return; }
        m.textContent = "☁️ 保存しています…"; m.style.color = "#607D8B"; q("save").disabled = true;
        try{
          const j = await api({ action:"linkbaseAdd", cat:cat, title:title, url:url }, true);
          if(j && j.ok){ cache = j; sel = 0; draw(true); if(opt.onSaved) opt.onSaved(); return; }
          m.textContent = j && j.error === "badurl" ? "⚠️ URLの形がちがうようです" : errText(j).replace("読み込めませんでした", "保存できませんでした"); m.style.color = "#C62828";
        }catch(e){ m.textContent = "通信できませんでした。電波のよいところでお試しください"; m.style.color = "#C62828"; }
        q("save").disabled = false;
      };
    };
    draw();
  }

  window.skyLinks = { sasaeai: sasaeai, linkbase: linkbase, load: load };
})();
