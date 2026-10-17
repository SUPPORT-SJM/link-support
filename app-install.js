/* ================================================================
   「ホーム画面に追加」の案内ページ（共通の部品）
   ----------------------------------------------------------------
   「活動に役立つツールを2つ、ホーム画面に置きましょう」の1枚の画面です。
   ツールごとにアイコンの設定ファイルが別なので、中では2つのアドレスに分かれています。
   見た目は同じ画面で、ツールをえらぶと、えらんでいた端末のまま切りかわります。
     ・app.html               … スカイアーク LINKサポート（アイコンから最初のページ index.html が開きます）
     ・link-portal/index.html … LINKポータル（アイコンから LINKポータル が開きます）

   ページの側で、次のように設定してから、このファイルを読みこみます
     window.SKY_APP = {
       tool:    "support" または "portal",  … いまの画面のツール
       base:    "./" または "../",          … サイトのいちばん上へのもどり方
       name:    "LINKサポート",              … アイコンの名前
       open:    "./index.html",              … アイコンから開くページ（このサイトの中）
       pcUrl:   "./index.html",              … パソコンで「開く」を押したときのページ
       sw:      "./sw.js"                    … ホーム画面に置くための小さな仕組み
     };
     画面は <div id="aiRoot"></div> の中に、この部品が組み立てます。

   端末ごとの動き
     ・Android  … 「ホーム画面に追加する」を押すと、Chromeの「インストールしますか？」が出ます
                   （出ないときは、メニューからの手順をお見せします）
     ・iPhone   … iPhoneには、ボタン1つで追加するしくみがないため、
                   Safariの「共有」→「ホーム画面に追加」の手順を、画面の中でご案内します
     ・パソコン … 開くボタンと、スマホで読みとるQRコード
     ・LINEで開いたとき … 自動でふつうのブラウザ（Safari・Chrome）に切りかえます
     ・アイコンから開いたとき … すぐに目的のページへ移ります
================================================================ */
(function () {
  const C = window.SKY_APP || {};
  const ua = navigator.userAgent || "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isLINE = /\bLine\//i.test(ua);
  const isInApp = isLINE || /Instagram|FBAN|FBAV|FB_IAB|Twitter|KAKAOTALK/i.test(ua);
  const isIOSChrome = isIOS && /CriOS/i.test(ua);
  const isIOSSafari = isIOS && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua) && !isInApp;
  const isStandalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
                    || (window.matchMedia && window.matchMedia("(display-mode: minimal-ui)").matches)
                    || navigator.standalone === true;
  const $ = (id)=>document.getElementById(id);
  const esc = (t)=>String(t == null ? "" : t).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const here = location.href.split("#")[0].replace(/([?&])openExternalBrowser=1&?/, "$1").replace(/[?&]$/, "");

  /* アイコンから開いたときは、すぐ目的のページへ */
  if(isStandalone){ location.replace(C.open); return; }

  /* LINEの中で開いたときは、ふつうのブラウザで開き直します（LINEのしくみ：openExternalBrowser=1） */
  if(isLINE && !/[?&]openExternalBrowser=1/.test(location.search)){
    location.replace(here + (here.indexOf("?") >= 0 ? "&" : "?") + "openExternalBrowser=1");
  }

  /* ホーム画面に置くための小さな仕組み（ページの控えは取りません） */
  if("serviceWorker" in navigator && C.sw){
    navigator.serviceWorker.register(C.sw).catch(()=>{});
  }

  /* Android（とパソコンのChrome）：「インストールしますか？」を出せる状態を受け取ります */
  let deferred = null, installed = false, waited = false;
  window.addEventListener("beforeinstallprompt", (e)=>{ e.preventDefault(); deferred = e; draw(); });
  window.addEventListener("appinstalled", ()=>{ installed = true; deferred = null; draw(); });
  setTimeout(()=>{ waited = true; draw(); }, 3500);

  /* 2つのツール（どちらの画面からも、もう一方へ移れます） */
  const TOOLS = [
    { key:"support", label:"スカイアーク<br>LINKサポート", page:"app.html", icon:"img/app-icon-180.png" },
    { key:"portal",  label:"LINKポータル",                 page:"link-portal/index.html", icon:"img/portal-icon-180.png" }
  ];
  const base = C.base || "./";
  const other = TOOLS.find(t=>t.key !== C.tool) || TOOLS[1];
  const otherName = other.key === "portal" ? "LINKポータル" : "LINKサポート";

  /* はじめにえらぶ端末：もう一方の画面から来たときは、そのときの端末のまま */
  const dParam = (location.search.match(/[?&]d=(android|ios|pc)\b/) || [])[1];
  let tab = dParam || (isIOS ? "ios" : isAndroid ? "android" : "pc");

  function qr(boxId, text){
    const box = $(boxId);
    if(!box) return;
    box.innerHTML = "";
    const go = ()=>{ try{ new QRCode(box, { text: text, width: 112, height: 112, correctLevel: QRCode.CorrectLevel.M }); }catch(e){} };
    if(window.QRCode) return go();
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    s.onload = go;
    document.head.appendChild(s);
  }

  /* iPhone：ホーム画面に置くページを、アイコンから開くページにしておきます
     （iPhoneは「いま開いているページ」をホーム画面に置くため） */
  let iosPrepared = false;
  function iosPrepare(){
    if(iosPrepared || !isIOS || isInApp) return;   /* LINEなどの中では、まずSafariで開き直していただきます */
    iosPrepared = true;
    try{ history.replaceState(null, "", C.open); }catch(e){}
  }

  async function install(){
    if(!deferred) return;
    const d = deferred;
    deferred = null;
    try{
      d.prompt();
      const r = await d.userChoice;
      if(r && r.outcome === "accepted") installed = true;
    }catch(e){}
    draw();
  }

  function stepList(items){
    return '<ol class="ai-steps">' + items.map((t, i)=>`<li><span class="ai-n">${i + 1}</span><span>${t}</span></li>`).join("") + "</ol>";
  }
  const shareIcon = '<span class="ai-ico" aria-label="共有">'
    + '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 11H6v10h12V11h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></span>';
  const plusIcon = '<span class="ai-ico" aria-label="追加"><svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>';
  const qrBlock = (lead)=>`<div class="ai-qr"><div id="aiQr"></div><p>${lead}</p></div>`;

  function panelAndroid(){
    if(!isAndroid){
      return '<p class="ai-lead">Androidのスマホで、このページを開いてください。</p>' + qrBlock("スマホのカメラで読みとると、このページが開きます");
    }
    if(installed){
      return `<div class="ai-done">✅ ホーム画面に「${esc(C.name)}」のアイコンができました</div>`
        + '<p class="ai-lead">これからは、ホーム画面のアイコンを押すだけで開けます。</p>';
    }
    if(deferred){
      return `<button class="ai-big" id="aiInstall">📲 ホーム画面に追加する</button>`
        + '<p class="ai-lead">押すと「インストールしますか？」と出ます。<br>「<b>インストール</b>」を押すと、ホーム画面にアイコンができます。</p>';
    }
    if(!waited){
      return '<button class="ai-big" disabled>準備しています…</button><p class="ai-lead">少しだけお待ちください。</p>';
    }
    return '<p class="ai-lead">右上のメニューから追加できます。</p>'
      + stepList(["右上の <b>︙</b>（点が3つ）を押す",
                  "「<b>ホーム画面に追加</b>」または「<b>アプリをインストール</b>」を押す",
                  "「<b>インストール</b>」（または「追加」）を押す"])
      + '<p class="ai-small">すでに追加ずみのときは、ホーム画面のアイコンから開けます。</p>';
  }

  function panelIOS(){
    if(!isIOS){
      return '<p class="ai-lead">iPhoneのカメラで読みとって、Safariで開いてください。</p>' + qrBlock("iPhoneのカメラで読みとると、このページが開きます");
    }
    iosPrepare();
    if(isInApp){
      return '<p class="ai-lead">いまはアプリの中のブラウザで開いています。<br><b>Safari</b>で開き直してください。</p>'
        + stepList(["右上（または右下）の <b>…</b> や <b>⋯</b> を押す",
                    "「<b>Safariで開く</b>」（または「ブラウザで開く」）を押す"])
        + '<button class="ai-sub" id="aiCopy">このページのアドレスをコピーする</button>';
    }
    if(isIOSChrome){
      return '<p class="ai-lead">iPhoneは、画面のボタンから追加します。</p>'
        + stepList([`アドレスの右の ${shareIcon}（共有）を押す`,
                    `下にずらして「<b>ホーム画面に追加</b>」${plusIcon} を押す`,
                    "右上の「<b>追加</b>」を押す"]);
    }
    return '<p class="ai-lead">iPhoneは、画面の下のボタンから追加します。</p>'
      + stepList([`画面の下の ${shareIcon}（共有）を押す<br><span class="ai-small">見当たらないときは「<b>…</b>」→「<b>共有</b>」</span>`,
                  `下にずらして「<b>ホーム画面に追加</b>」${plusIcon} を押す`,
                  "右上の「<b>追加</b>」を押す"])
      + '<div class="ai-arrow" aria-hidden="true">⬇︎</div>';
  }

  function panelPC(){
    const ext = /^https?:/i.test(C.pcUrl || "");
    return `<a class="ai-big" href="${esc(C.pcUrl || C.open)}"${ext ? ' target="_blank" rel="noopener"' : ""}>🔗 ${esc(C.name)}を開く</a>`
      + (deferred && !isAndroid && !isIOS ? '<button class="ai-sub" id="aiInstall">💻 パソコンにもアプリとして置く</button>' : "")
      + qrBlock("スマホのカメラで読みとると、このページが開きます");
  }

  function draw(){
    document.querySelectorAll(".ai-tab").forEach(b=>{
      b.classList.toggle("on", b.dataset.t === tab);
      b.setAttribute("aria-selected", b.dataset.t === tab ? "true" : "false");
    });
    const p = $("aiPanel");
    if(!p) return;
    p.innerHTML = tab === "android" ? panelAndroid() : tab === "ios" ? panelIOS() : panelPC();
    document.body.classList.toggle("ai-arrow-on", !!p.querySelector(".ai-arrow"));
    const ib = $("aiInstall"); if(ib) ib.addEventListener("click", install);
    const cb = $("aiCopy"); if(cb) cb.addEventListener("click", ()=>{
      const u = here.replace(/[?&]openExternalBrowser=1/, "");   /* この案内ページのアドレス */
      (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(()=>{ cb.textContent = "✅ コピーしました。Safariに貼りつけてください"; })
        .catch(()=>{ cb.textContent = u; });
    });
    if($("aiQr")) qr("aiQr", here.replace(/[?&]openExternalBrowser=1/, ""));
  }

  /* 画面の組み立て */
  function shell(){
    const root = $("aiRoot");
    if(!root) return;
    root.innerHTML = '<h1 class="ai-title">活動に役立つツールを2つ<br>ホーム画面に置きましょう</h1>'
      + '<div class="ai-line" id="aiLineNote" hidden>LINEで開いたときは、ブラウザに切りかえて開きます</div>'
      + '<div class="ai-tools">' + TOOLS.map((t, i)=>{
          const on = t.key === C.tool;
          return `<a class="ai-tool${on ? " on" : ""}" data-k="${t.key}" href="${on ? "#" : base + t.page}"${on ? ' aria-current="page"' : ""}>`
            + `<span class="ai-no">${i + 1}</span><img src="${base + t.icon}" alt=""><span class="ai-tn">${t.label}</span></a>`;
        }).join("") + "</div>"
      + '<p class="ai-q">お使いの端末をえらんでください</p>'
      + '<div class="ai-tabs" role="tablist">'
      + '<button class="ai-tab" data-t="android" role="tab"><span class="ai-e">🤖</span>Android</button>'
      + '<button class="ai-tab" data-t="ios" role="tab"><span class="ai-e">🍎</span>iPhone</button>'
      + '<button class="ai-tab" data-t="pc" role="tab"><span class="ai-e">💻</span>パソコン</button></div>'
      + '<div class="ai-panel" id="aiPanel" role="tabpanel"></div>'
      + `<a class="ai-next" id="aiNext" href="${base + other.page}">${other.key === "portal" ? "次は" : ""}${otherName}も、ホーム画面に置きましょう →</a>`;
    /* もう一方の画面へ移るときは、えらんでいる端末を持っていきます */
    const go = (e)=>{
      const a = e.currentTarget;
      if(a.classList.contains("on")){ e.preventDefault(); return; }
      e.preventDefault();
      location.href = base + other.page + "?d=" + tab;
    };
    root.querySelectorAll(".ai-tool:not(.on)").forEach(a=>a.addEventListener("click", go));
    $("aiNext").addEventListener("click", go);
    root.querySelector(".ai-tool.on").addEventListener("click", e=>e.preventDefault());
  }

  function start(){
    shell();
    /* この端末の印 */
    const mine = isIOS ? "ios" : isAndroid ? "android" : "pc";
    document.querySelectorAll(".ai-tab").forEach(b=>{
      if(b.dataset.t === mine){ const s = document.createElement("span"); s.className = "ai-me"; s.textContent = "この端末"; b.appendChild(s); }
      b.addEventListener("click", ()=>{ tab = b.dataset.t; draw(); });
    });
    if(isLINE) { const n = $("aiLineNote"); if(n) n.hidden = false; }
    draw();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  /* 確かめるとき用 */
  window.skyAppInstall = { state: ()=>({ tab, isIOS, isAndroid, isLINE, isInApp, isIOSSafari, isIOSChrome, deferred: !!deferred, installed, waited }) };
})();
