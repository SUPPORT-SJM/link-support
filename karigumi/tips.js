/* ================================================================
   LINKの豆知識（Tips）の短い動画
   ----------------------------------------------------------------
   ・音は出ません。絵と字幕だけで、場面が自動で切りかわります
   ・読み込みを待つ間（loading.js）と、Tips一覧（tips.html）で使います
   ・中身を足すときは、下の SKY_TIPS に1つ足すだけです
     { id, t:題名, scenes:[ { art:絵(HTML), cap:字幕, sec:秒 } ] }

   skyTips.mount(場所, { ids:[…], loop:true, random:true, controls:false })
     … 場所の中で動画を流します。stop() で止まります
================================================================ */
(function () {
  /* 絵のための小さな部品 */
  function big(e, cls) { return '<div class="tp-big ' + (cls || "") + '">' + e + '</div>'; }
  function chip(t, cls) { return '<span class="tp-chip ' + (cls || "") + '">' + t + '</span>'; }
  function keiEmojis() {
    var re = /\p{Extended_Pictographic}/u, out = [];
    (window.SKY_KEIRETSU || []).forEach(function (k) { var m = String(k).match(re); if (m && out.indexOf(m[0]) < 0) out.push(m[0]); });
    if (out.length < 4) out = ["🦸", "☁️", "🌸", "🔥", "🌊", "⭐", "🍀", "🦋"];
    return out.slice(0, 8);
  }
  /* 1週間のカレンダーの図（告知のルール用） */
  function week(rows) {
    var days = ["月", "火", "水", "木", "金", "土", "日"];
    var h = '<div class="tp-week"><div class="tp-wr tp-wh"><span class="tp-wn"></span>' + days.map(function (d) { return '<span>' + d + '</span>'; }).join("") + '</div>';
    rows.forEach(function (r) {
      h += '<div class="tp-wr"><span class="tp-wn">' + r.n + '</span>';
      for (var i = 0; i < 7; i++) {
        var c = r.c[i];
        h += '<span class="tp-wc">' + (c ? '<i class="tp-post ' + (c.ng ? "ng" : "ok") + '" style="animation-delay:' + (c.d || 0) + 's">' + c.t + (c.ng ? '<b>✕</b>' : '<b>◯</b>') + '</i>' : "") + '</span>';
      }
      h += '</div>';
    });
    return h + '</div>';
  }

  var TIPS = window.SKY_TIPS = [
    { id: "base-only", t: "告知ができるのは、だれ？", scenes: [
      { art: big("📣", "tp-pop"), cap: "オープンチャットで、事業の告知（PR）ができるのは…", sec: 4 },
      { art: '<div class="tp-row">' + big("🏢", "tp-pop") + '<div class="tp-tag">LINK-BASE<br>掲載ずみ</div></div>', cap: "LINK-BASEに、事業を掲載している人だけです", sec: 4.5 },
      { art: big("✅", "tp-pop"), cap: "告知をしたいときは、まずLINK-BASEに掲載しましょう", sec: 4 }
    ] },
    { id: "entrance", t: "あなたの集客の入り口", scenes: [
      { art: big("🚪", "tp-pop"), cap: "集客をスタートさせるために、準備するものがあります", sec: 4 },
      { art: '<div class="tp-col">' + big("🤝", "tp-pop") + chip("① SASAEAI プロフィール作成") + '</div>', cap: "1つめは、SASAEAI（ささえあい）のプロフィール作成", sec: 4 },
      { art: '<div class="tp-col">' + big("🏢", "tp-pop") + chip("② LINK-BASE 事業掲載") + '</div>', cap: "2つめは、LINK-BASEへの事業掲載", sec: 4 },
      { art: '<div class="tp-row tp-eq">' + big("🤝", "tp-sm tp-pop") + '<span class="tp-op">＋</span>' + big("🏢", "tp-sm tp-pop") + '<span class="tp-op">＝</span>' + big("🚪", "tp-sm tp-glow") + '</div>', cap: "この2つが必須です。ここが、あなたの集客の入り口になります", sec: 5 }
    ] },
    { id: "pr-rule", t: "告知は1週間に1回", scenes: [
      { art: '<div class="tp-once tp-pop">📣 1週間に<b>1回</b></div>', cap: "オープンチャットでの事業の告知は、1週間に1回だけです", sec: 4.5 },
      { art: week([{ n: "チャットA", c: { 0: { t: "案件1" }, 3: { t: "案件1", ng: true, d: 1.2 } } }]),
        cap: "同じオープンチャットでは、あなたができる告知は1週間に1回です", sec: 6 },
      { art: week([{ n: "チャットA", c: { 0: { t: "案件1" } } }, { n: "チャットB", c: { 2: { t: "案件2", d: 1 } } }]),
        cap: "複数の案件がある人は、別の日に、別の案件を流すことはできます", sec: 6 },
      { art: week([{ n: "チャットA", c: { 1: { t: "案件1" } } }, { n: "チャットB", c: { 1: { t: "案件1", ng: true, d: 1 } } }]),
        cap: "同じ日に、同じ案件を2つ以上のオープンチャットに送ることはできません", sec: 6.5 }
    ] },
    { id: "teams", t: "LINKの公式チームとSkyarc", scenes: [
      { art: '<div class="tp-col">' + big("🌐", "tp-pop") + '<div class="tp-teams"><i>チーム</i><i>チーム</i><i class="sky">チーム</i><i>チーム</i></div></div>', cap: "LINKには、「公式チーム」がいくつかあります", sec: 4.5 },
      { art: '<div class="tp-col">' + big("🌈", "tp-pop tp-glow") + chip("Skyarc（スカイアーク）", "sky") + '</div>', cap: "私たちは、その公式チームの中の「Skyarc」というチームの仲間です", sec: 5 },
      { art: function () { return '<div class="tp-kei">' + keiEmojis().map(function (e, i) { return '<i style="animation-delay:' + (i * 0.15) + 's">' + e + '</i>'; }).join("") + '</div>'; },
        cap: "Skyarcの中にも、たくさんの「系列」があります", sec: 4.5 },
      { art: '<div class="tp-row">' + big("💬", "tp-pop") + big("👥", "tp-pop tp-d1") + '</div>', cap: "系列ごとに、仲間が集まるオープンチャットがあります", sec: 4.5 },
      { art: big("🎪", "tp-pop tp-glow"), cap: "Skyarc全体でも、交流会などが開かれています", sec: 4.5 }
    ] },
    { id: "profile", t: "自分の情報を設定しよう", scenes: [
      { art: big("📝", "tp-pop"), cap: "このサイトで、自分の情報を細かく設定しておくと…", sec: 4 },
      { art: '<div class="tp-row">' + big("👤", "tp-sm tp-pop") + '<span class="tp-op">←</span>' + big("🤝", "tp-sm tp-pop tp-d1") + '</div>', cap: "サポーターやアップラインの人から、フォローを受けやすくなります", sec: 5 },
      { art: '<div class="tp-form"><p><b>紹介してくれた人</b><span>名前・会員番号</span></p><p><b>説明をしてくれた人</b><span>名前・会員番号</span></p></div>',
        cap: "紹介してくれた人や、説明をしてくれた人の名前・会員番号も、記入しておきましょう", sec: 6 },
      { art: big("🙌", "tp-pop tp-glow"), cap: "いろいろなサポートや、フォローが受けやすくなります", sec: 4 }
    ] },
    { id: "progress", t: "進み具合が、お互いに分かる", scenes: [
      { art: '<div class="tp-row"><i class="tp-ball">👋</i><i class="tp-ball me">🔎</i><i class="tp-ball">🚀</i></div>', cap: "あなたの作業の進み具合は、サポーターやアップラインの人にも分かります", sec: 5 },
      { art: '<div class="tp-row"><i class="tp-ball ok">👋</i><i class="tp-ball me">🔎</i><i class="tp-ball">🚀</i></div>', cap: "チェックしてもらえると、丸が虹色に光ります", sec: 4.5 },
      { art: '<div class="tp-row">' + big("👤", "tp-sm tp-pop") + '<span class="tp-op">⇄</span>' + big("🤝", "tp-sm tp-pop tp-d1") + '</div>', cap: "サポートの状態がお互いに分かりやすくなり、進み具合もよく分かります", sec: 5 }
    ] }
  ];

  var css = ''
    + '.tp-box{position:relative;width:100%;font-family:"Zen Maru Gothic","Zen Kaku Gothic New","Noto Sans JP",sans-serif;}'
    + '.tp-head{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#6E5FB5;margin-bottom:6px;text-align:left;}'
    + '.tp-head .tp-lbl{background:#6E5FB5;color:#fff;border-radius:999px;padding:1px 8px;font-size:11px;}'
    + '.tp-stage{position:relative;width:100%;aspect-ratio:16/11;border-radius:16px;overflow:hidden;'
    + 'background:radial-gradient(ellipse at 50% 35%,#FFFFFF 0%,#F3F0FF 60%,#E9F4FF 100%);border:1px solid #E4E0F0;}'
    + '.tp-art{position:absolute;left:0;right:0;top:0;bottom:30%;display:flex;align-items:center;justify-content:center;padding:6px;animation:tpIn .45s ease both;}'
    + '.tp-cap{position:absolute;left:8px;right:8px;bottom:8px;min-height:26%;display:flex;align-items:center;justify-content:center;'
    + 'background:rgba(42,36,56,.82);color:#fff;border-radius:10px;padding:6px 10px;font-size:13.5px;font-weight:700;line-height:1.55;text-align:center;animation:tpCap .5s ease both;}'
    + '.tp-bar{display:flex;gap:3px;margin-top:6px;}.tp-bar i{flex:1;height:3px;border-radius:9px;background:#E4E0F0;overflow:hidden;}'
    + '.tp-bar i b{display:block;height:100%;width:0;background:#6E5FB5;}.tp-bar i.done b{width:100%;}'
    + '.tp-ctl{display:flex;gap:8px;justify-content:center;margin-top:8px;}'
    + '.tp-ctl button{border:none;border-radius:999px;padding:7px 14px;font-family:inherit;font-weight:700;font-size:13px;background:#EDEAF9;color:#5A4BA3;cursor:pointer;}'
    + '@keyframes tpIn{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}'
    + '@keyframes tpCap{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'
    + '.tp-big{font-size:58px;line-height:1;}.tp-big.tp-sm{font-size:40px;}'
    + '.tp-pop{animation:tpPop .6s cubic-bezier(.34,1.5,.64,1) both;}.tp-d1{animation-delay:.35s;}'
    + '@keyframes tpPop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}'
    + '.tp-glow{filter:drop-shadow(0 0 10px rgba(255,200,60,.9));animation:tpPop .6s cubic-bezier(.34,1.5,.64,1) both,tpFloat 2.4s ease-in-out .6s infinite;}'
    + '@keyframes tpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}'
    + '.tp-row{display:flex;align-items:center;justify-content:center;gap:12px;}'
    + '.tp-col{display:flex;flex-direction:column;align-items:center;gap:8px;}'
    + '.tp-once{background:#fff;border:3px solid #8A7DD0;border-radius:18px;padding:12px 18px;font-size:22px;font-weight:900;color:#4A3D8F;}.tp-once b{font-size:40px;color:#E8788A;margin-left:2px;}'
    + '.tp-op{font-size:24px;font-weight:900;color:#8A7DD0;}'
    + '.tp-chip{background:#fff;border:2px solid #8A7DD0;color:#4A3D8F;border-radius:999px;padding:4px 12px;font-size:13px;font-weight:900;animation:tpIn .5s .3s ease both;}'
    + '.tp-chip.sky{border-color:#F49AC1;background:linear-gradient(90deg,#FFF0F6,#FFF8E1,#EAF8EE,#EAF2FF);}'
    + '.tp-tag{background:#1E96D2;color:#fff;border-radius:12px;padding:8px 12px;font-size:14px;font-weight:900;line-height:1.4;animation:tpIn .5s .4s ease both;}'
    + '.tp-teams{display:flex;gap:6px;}.tp-teams i{font-style:normal;font-size:11px;font-weight:700;background:#fff;border:1.5px solid #CFC8E6;border-radius:8px;padding:4px 6px;color:#7A7390;animation:tpIn .4s ease both;}'
    + '.tp-teams i:nth-child(2){animation-delay:.15s}.tp-teams i:nth-child(3){animation-delay:.3s}.tp-teams i:nth-child(4){animation-delay:.45s}'
    + '.tp-kei{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 14px;}.tp-kei i{font-style:normal;font-size:30px;animation:tpPop .5s cubic-bezier(.34,1.5,.64,1) both;}'
    + '.tp-week{background:#fff;border-radius:10px;padding:6px;border:1px solid #E4E0F0;font-size:10px;}'
    + '.tp-wr{display:grid;grid-template-columns:52px repeat(7,1fr);gap:2px;align-items:center;min-height:28px;}'
    + '.tp-wh span{font-weight:900;color:#7A7390;text-align:center;}.tp-wn{font-weight:900;color:#4A3D8F;font-size:10px;}'
    + '.tp-wc{height:26px;border-radius:5px;background:#F6F4FC;display:flex;align-items:center;justify-content:center;}'
    + '.tp-post{position:relative;font-style:normal;font-size:9.5px;font-weight:900;color:#fff;border-radius:5px;padding:3px 2px;background:#3FA98A;animation:tpPop .5s cubic-bezier(.34,1.5,.64,1) both;white-space:nowrap;}'
    + '.tp-post.ng{background:#E8788A;}.tp-post b{position:absolute;top:-9px;right:-6px;font-size:11px;color:#3FA98A;background:#fff;border-radius:50%;width:14px;height:14px;line-height:14px;text-align:center;}'
    + '.tp-post.ng b{color:#D84315;}'
    + '.tp-form{background:#fff;border-radius:12px;border:1.5px solid #CFC8E6;padding:8px 12px;width:82%;}'
    + '.tp-form p{display:flex;flex-direction:column;gap:2px;margin:4px 0;font-size:12px;color:#4A3D8F;text-align:left;animation:tpIn .5s ease both;}'
    + '.tp-form p:nth-child(2){animation-delay:.5s}.tp-form span{border:1.5px dashed #B8AEE0;border-radius:6px;padding:3px 6px;color:#9A93B0;font-size:11px;}'
    + '.tp-ball{font-style:normal;width:50px;height:50px;border-radius:50%;background:#fff;border:3px solid #9A93B0;display:grid;place-items:center;font-size:24px;}'
    + '.tp-ball.me{border-color:#29B6F6;box-shadow:0 0 0 4px rgba(41,182,246,.3),0 0 16px rgba(41,182,246,.6);}'
    + '.tp-ball.ok{border:3px solid transparent;background:linear-gradient(#fff,#fff) padding-box,conic-gradient(#F49AC1,#F5A97A,#F5D06A,#8FD9A8,#6FC7D9,#7BA3E8,#A88BE0,#F49AC1) border-box;animation:tpPop .6s both;}';

  function addCss() {
    if (document.getElementById("tpCss")) return;
    var s = document.createElement("style"); s.id = "tpCss"; s.textContent = css; document.head.appendChild(s);
  }

  function mount(el, opt) {
    opt = opt || {};
    addCss();
    var list = (opt.ids ? opt.ids.map(function (id) { return TIPS.filter(function (t) { return t.id === id; })[0]; }).filter(Boolean) : TIPS.slice());
    if (opt.random) list.sort(function () { return Math.random() - 0.5; });
    var ti = 0, si = 0, timer = null, stopped = false;
    el.innerHTML = '<div class="tp-box"><div class="tp-head"><span class="tp-lbl">💡 Tips</span><span class="tp-t"></span></div>'
      + '<div class="tp-stage"><div class="tp-art"></div><div class="tp-cap"></div></div><div class="tp-bar"></div>'
      + (opt.controls ? '<div class="tp-ctl"><button type="button" class="tp-re">↺ はじめから</button></div>' : "") + '</div>';
    var tEl = el.querySelector(".tp-t"), stage = el.querySelector(".tp-stage"), bar = el.querySelector(".tp-bar");
    function show() {
      if (stopped) return;
      var tip = list[ti], sc = tip.scenes[si];
      tEl.textContent = tip.t;
      if (si === 0) bar.innerHTML = tip.scenes.map(function () { return "<i><b></b></i>"; }).join("");
      var art = typeof sc.art === "function" ? sc.art() : sc.art;
      stage.innerHTML = '<div class="tp-art">' + art + '</div><div class="tp-cap">' + sc.cap + '</div>';
      var segs = bar.querySelectorAll("i");
      for (var k = 0; k < segs.length; k++) { segs[k].className = k < si ? "done" : ""; segs[k].firstChild.style.cssText = ""; }
      var b = segs[si].firstChild; b.style.transition = "none"; b.style.width = "0";
      void b.offsetWidth; b.style.transition = "width " + sc.sec + "s linear"; b.style.width = "100%";
      timer = setTimeout(next, sc.sec * 1000);
    }
    function next() {
      si++;
      if (si >= list[ti].scenes.length) {
        si = 0; ti++;
        if (ti >= list.length) { if (!opt.loop) { var segs = bar.querySelectorAll("i"); for (var k = 0; k < segs.length; k++) segs[k].className = "done"; return; } ti = 0; }
      }
      show();
    }
    var re = el.querySelector(".tp-re");
    if (re) re.addEventListener("click", function () { clearTimeout(timer); ti = 0; si = 0; show(); });
    show();
    return { stop: function () { stopped = true; clearTimeout(timer); } };
  }

  window.skyTips = { list: TIPS, mount: mount };
})();
