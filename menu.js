/* ================================================================
   全ページ共通のメニュー
   ----------------------------------------------------------------
   ・右下の丸いボタンから、下がせり上がってきます
   ・その方の段階に合わせて、出す項目を変えます
   ・デザインを新しくするときは、ここだけ直せば全ページに行きわたります
================================================================ */
(function () {
  var here = location.pathname;
  var inIkusei = here.indexOf("/ikusei/") >= 0;
  var inFirst  = here.indexOf("/first-support/") >= 0;
  var up = (inIkusei || inFirst) ? "../" : "./";

  /* 出す項目（段階が足りない方には出しません） */
  var ITEMS = [
    { sec: "アカウント" },
    { ic:"👤", nm:"会員情報の確認・編集", url: up+"ikusei/account.html", need:"" },
    { ic:"🏠", nm:"LINKポータル",
      sub:"LINKのマイページ・各種サービス",
      url:"https://app.link-event-x.com", ext:true, need:"" },

    { sec: "まなぶ" },
    { ic:"👋", nm:"はじめの一歩",        url: up+"first-support/",            need:"" },
    { ic:"📘", nm:"初期サポートガイド",    url: up+"first-support/guide.html",  need:"" },
    { ic:"🚀", nm:"活用の1stステップ",    url: up+"first-support/step1.html",  need:"" },
    { ic:"🐣", nm:"ぴよぴよ脱出クイズ",    url: up+"ikusei/piyo-quiz.html",     need:"sup" },
    { ic:"🌱", nm:"グルコンリーダー育成",  url: up+"ikusei/gcon-roadmap.html",  need:"crie" },

    { sec: "なかま" },
    { ic:"📅", nm:"Skyarcのサポート会・交流会",
      sub:"サポート会・交流会・動画視聴会のお申し込み",
      url: up+"first-support/events.html", need:"" },
    { ic:"🗓", nm:"LINK公式スケジュールサイト",
      sub:"LINK全体の講座・セミナーはこちら",
      url:"https://link-event-x.com/", ext:true, need:"" },
    { ic:"🤝", nm:"サポートメンバー状況",  url: up+"ikusei/myteam.html",        need:"sup" },

    { sec: "チーム運営" },
    { ic:"🔐", nm:"管理ページ",          url: up+"ikusei/kanri-x7k2m9.html",  need:"sup" },
    { ic:"🗺", nm:"クリエマップ",         url: up+"ikusei/creamap-x7k2m9.html", need:"crie" },
  ];

  function member() {
    try {
      var raw = localStorage.getItem("skyarc_member");
      if (raw && raw !== "null" && raw !== "undefined") return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function allowed(need, m) {
    if (!need) return true;
    if (!m) return false;
    if (String(m.role || "")) return true;             // 役職をお持ちの方
    if (need === "sup")  return m.sup === true || m.crie === true;
    if (need === "crie") return m.crie === true;
    return true;
  }

  function build() {
    /* 管理ページとクリエマップでは、上のナビがあるので出しません */
    if (here.indexOf("kanri-x7k2m9") >= 0 || here.indexOf("creamap-x7k2m9") >= 0) return;

    var css = document.createElement("style");
    css.textContent = ''
      + '.skym-btn{position:fixed;right:14px;top:calc(env(safe-area-inset-top) + 12px);'
      + 'width:50px;height:50px;border-radius:16px;background:#6E5FB5;border:none;cursor:pointer;'
      + 'box-shadow:0 5px 18px rgba(110,95,181,.45);z-index:8000;'
      + 'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;'
      + 'animation:skymCall 2.6s ease-in-out 1.2s 3;}'
      /* ときどき、そっと動いてお知らせします */
      + '@keyframes skymCall{'
      +   '0%,100%{transform:scale(1) rotate(0);box-shadow:0 5px 18px rgba(110,95,181,.45);}'
      +   '8%{transform:scale(1.14) rotate(-6deg);box-shadow:0 8px 26px rgba(110,95,181,.62);}'
      +   '16%{transform:scale(1.1) rotate(6deg);}'
      +   '24%{transform:scale(1.14) rotate(-4deg);}'
      +   '32%{transform:scale(1) rotate(0);}}'
      + '.skym-btn::after{content:"メニュー";position:absolute;bottom:-15px;left:50%;'
      + 'transform:translateX(-50%);font-size:9px;font-weight:700;color:#6E5FB5;'
      + 'white-space:nowrap;font-family:"Zen Kaku Gothic New","Noto Sans JP",sans-serif;}'
      + '.skym-btn.open::after{opacity:0;}'
      + '.skym-btn.open{animation:none;}'
      + '.skym-btn i{display:block;width:20px;height:2.6px;background:#fff;border-radius:2px;transition:.25s;}'
      + '@media (prefers-reduced-motion:reduce){.skym-btn{animation:none;}}'
      + '.skym-btn.open i:nth-child(1){transform:translateY(7.6px) rotate(45deg);}'
      + '.skym-btn.open i:nth-child(2){opacity:0;}'
      + '.skym-btn.open i:nth-child(3){transform:translateY(-7.6px) rotate(-45deg);}'
      + '.skym-bg{position:fixed;inset:0;background:rgba(42,36,56,.5);backdrop-filter:blur(3px);'
      + 'opacity:0;pointer-events:none;transition:.28s;z-index:8001;}'
      + '.skym-bg.on{opacity:1;pointer-events:auto;}'
      + '.skym{position:fixed;left:0;right:0;bottom:0;background:#fff;border-radius:22px 22px 0 0;'
      + 'padding:8px 15px calc(env(safe-area-inset-bottom) + 22px);transform:translateY(100%);'
      + 'transition:.32s cubic-bezier(.4,0,.2,1);z-index:8002;max-height:86vh;overflow-y:auto;'
      + 'font-family:"Zen Kaku Gothic New","Noto Sans JP",sans-serif;}'
      + '.skym.on{transform:none;}'
      + '.skym .grip{width:38px;height:4px;background:#E4E0F0;border-radius:99px;margin:8px auto 13px;}'
      + '.skym .me{display:flex;align-items:center;gap:11px;background:#F0EDF9;border-radius:14px;'
      + 'padding:12px 14px;margin-bottom:6px;}'
      + '.skym .me .av{width:40px;height:40px;border-radius:12px;background:#6E5FB5;color:#fff;'
      + 'display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}'
      + '.skym .me .nm{font-family:"Zen Maru Gothic",sans-serif;font-weight:700;font-size:14px;color:#2A2438;}'
      + '.skym .me .sb{font-size:11px;color:#7A7390;}'
      + '.skym .sec{font-size:10.5px;font-weight:700;color:#9A93B0;letter-spacing:.06em;margin:14px 0 6px;}'
      + '.skym a.it{display:flex;align-items:center;gap:11px;padding:12px 13px;border-radius:12px;'
      + 'font-size:14px;font-weight:500;color:#2A2438;text-decoration:none;}'
      + '.skym a.it:active{background:#F0EDF9;}'
      + '.skym a.it .ic{font-size:17px;width:23px;text-align:center;flex-shrink:0;}'
      + '.skym a.it .tx{flex:1;line-height:1.5;}'
      + '.skym a.it .sb{display:block;font-size:10.5px;color:#9A93B0;font-weight:400;}'
      + '.skym a.it .ar{color:#C8C2DC;font-size:12px;flex-shrink:0;}'
      + '.skym a.it.now{background:#F0EDF9;color:#6E5FB5;font-weight:700;}'
      + '.skym a.it.now .ar{display:none;}'
      + '.skym a.it .bd{background:#3FA98A;color:#fff;font-size:9.5px;font-weight:700;'
      + 'border-radius:99px;padding:1px 8px;flex-shrink:0;}'
      + '.skym .out{display:block;width:100%;text-align:center;font-size:12.5px;color:#B3352F;'
      + 'padding:13px;margin-top:10px;background:none;border:none;cursor:pointer;'
      + 'font-family:inherit;}';
    document.head.appendChild(css);

    var btn = document.createElement("button");
    btn.className = "skym-btn";
    btn.setAttribute("aria-label", "メニュー");
    btn.innerHTML = "<i></i><i></i><i></i>";

    var bg = document.createElement("div");
    bg.className = "skym-bg";

    var sheet = document.createElement("div");
    sheet.className = "skym";

    document.body.appendChild(btn);
    document.body.appendChild(bg);
    document.body.appendChild(sheet);

    function fill() {
      var m = member();
      var rank = !m ? "ログインしていません"
               : (String(m.role || "").split(/[,、\s]+/).filter(function(x){return x;})[0]
                  || (m.crie === true ? "クリエイターズ"
                  : (m.sup === true ? "サポーター" : "メンバー")));

      var html = '<div class="grip"></div>'
        + '<div class="me"><span class="av">' + (m ? "🐣" : "🌱") + '</span><div>'
        + '<div class="nm">' + (m && m.name ? m.name + " さん" : "ようこそ") + '</div>'
        + '<div class="sb">' + (m && m.keiretsu ? m.keiretsu + "　" : "") + rank + '</div>'
        + '</div></div>';

      var buf = "", shown = 0;
      ITEMS.forEach(function (it) {
        if (it.sec) {
          if (buf && shown) html += buf;
          buf = '<div class="sec">' + it.sec + '</div>';
          shown = 0;
          return;
        }
        if (!allowed(it.need, m)) return;
        /* いま開いているページかどうかを、ファイル名で見比べます */
        var isNow = false;
        if (!it.ext) {
          var mine = here.replace(/\/$/, "/index.html").split("/").pop();
          var his  = it.url.replace(/\/$/, "/index.html").split("/").pop();
          var myDir  = here.indexOf("/ikusei/") >= 0 ? "ikusei"
                     : (here.indexOf("/first-support/") >= 0 ? "first-support" : "");
          var hisDir = it.url.indexOf("ikusei/") >= 0 ? "ikusei"
                     : (it.url.indexOf("first-support/") >= 0 ? "first-support" : "");
          isNow = (mine === his && myDir === hisDir);
        }
        buf += '<a class="it' + (isNow ? " now" : "") + '" href="' + it.url + '"'
             + (it.ext ? ' target="_blank" rel="noopener"' : "") + '>'
             + '<span class="ic">' + it.ic + '</span>'
             + '<span class="tx">' + it.nm
             + (it.sub ? '<span class="sb">' + it.sub + '</span>' : "")
             + '</span>'
             + (isNow ? '<span class="bd">いま</span>' : '<span class="ar">›</span>')
             + '</a>';
        shown++;
      });
      if (buf && shown) html += buf;

      if (m) {
        html += '<button class="out" id="skymOut">ログアウト</button>';
      } else {
        html += '<a class="it" href="' + up + 'index.html" style="background:#6E5FB5;color:#fff;'
              + 'justify-content:center;margin-top:12px;font-weight:700;">🌱 ログインする</a>';
      }
      sheet.innerHTML = html;

      var out = document.getElementById("skymOut");
      if (out) out.addEventListener("click", function () {
        if (!confirm("ログアウトしますか?")) return;
        try {
          var keys = [];
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && (k.indexOf("skyarc_") === 0 || k.indexOf("piyo_") === 0
                   || k.indexOf("gcon_") === 0 || k.indexOf("hajime_") === 0
                   || k.indexOf("link_done_") === 0 || k.indexOf("step1_") === 0)) keys.push(k);
          }
          keys.forEach(function (k) { localStorage.removeItem(k); });
        } catch (e) {}
        location.href = up + "index.html";
      });
    }

    function toggle() {
      var open = sheet.classList.toggle("on");
      bg.classList.toggle("on", open);
      btn.classList.toggle("open", open);
      if (open) fill();
    }
    btn.addEventListener("click", toggle);
    bg.addEventListener("click", toggle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
