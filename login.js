/* ================================================================
   どのページでもログインできる共通の部品
   ----------------------------------------------------------------
   ・ログインしていない状態で「保存が必要な操作」をしたときに開きます
   ・skyLoginRequired(あとで実行したい処理) と呼ぶだけで使えます
   ・LINE内ブラウザから外部ブラウザに移った直後でも、ここから入れます
================================================================ */
(function () {
  /* ================================================================
     共通設定（config.js）から受け取ります
     ----------------------------------------------------------------
     読み込みの順番が前後しても困らないよう、
     「使うとき」に受け取る形にしています。
  ================================================================ */
  function gasUrl() {
    return window.SKY_GAS_URL || "";
  }

  /* ================================================================
     v1.2.156：ログインの画面を、トップページと同じ形にそろえました
     ・「はじめての方」（お名前・Googleアカウントかメールアドレス・パスコード4桁・会員番号）
     ・「登録ずみの方」（Google／会員番号／メール のどれか ＋ パスコード）
     ・どのページの「ログインする」からでも、この同じ画面が出ます
     ・登録・ログインが終わったら、そのページのまま続きを出します（トップには飛びません）
  ================================================================ */
  var ov = null, pending = null, mode = "new", tab = "google", gMail = "", gName = "", gFor = "";
  var CLIENT_ID = "315827385958-ikdpkfhkr6nmrgql470aolt4pv27pak3.apps.googleusercontent.com";
  var BASE = (function () {
    try { var s = document.currentScript && document.currentScript.src; if (s) return s.replace(/login\.js(\?.*)?$/, ""); } catch (e) {}
    return "";
  })();
  function $(id) { return document.getElementById(id); }

  function build() {
    if (ov) return;
    var css = document.createElement("style");
    css.textContent = ''
      + '#skyLoginOv{display:none;position:fixed;inset:0;z-index:9999;background:rgba(30,22,52,.45);align-items:center;justify-content:center;padding:16px;}'
      + '#skyLoginOv.show{display:flex;}'
      + '#skyLoginOv *{box-sizing:border-box;font-family:inherit;}'
      + '#skyLoginOv .sl-card{position:relative;background:#fff;border-radius:24px;padding:24px 20px 20px;width:100%;max-width:400px;box-shadow:0 20px 50px rgba(30,22,52,.3);max-height:calc(100vh - 32px);overflow-y:auto;color:#2A2438;}'
      + '#skyLoginOv h3{margin:0 0 4px;font-family:"Zen Maru Gothic",sans-serif;font-weight:900;font-size:20px;text-align:center;color:#2A2438;}'
      + '#skyLoginOv .sl-lead{margin:0 0 18px;text-align:center;font-size:13px;color:#7A7390;}'
      + '#skyLoginOv .sl-x{position:absolute;top:10px;right:12px;width:36px;height:36px;border-radius:50%;border:none;background:#F0EDF9;color:#7A7390;font-size:18px;cursor:pointer;}'
      + '#skyLoginOv .sl-seg{display:flex;gap:4px;background:#F0EDF9;border-radius:12px;padding:4px;margin:0 0 16px;}'
      + '#skyLoginOv .sl-seg button{flex:1;border:none;background:none;border-radius:9px;padding:9px 6px;font-family:"Zen Maru Gothic",sans-serif;font-weight:700;font-size:13px;color:#7A7390;cursor:pointer;}'
      + '#skyLoginOv .sl-seg button.on{background:#fff;color:#6E5FB5;box-shadow:0 2px 8px rgba(60,42,110,.10);}'
      + '#skyLoginOv .sl-seg.small button{font-size:12px;padding:7px 4px;}'
      + '#skyLoginOv .sl-f{margin-bottom:14px;}'
      + '#skyLoginOv .sl-f label{display:block;font-size:12px;font-weight:700;color:#6E5FB5;margin-bottom:6px;}'
      + '#skyLoginOv .sl-f label small{font-weight:500;color:#7A7390;margin-left:4px;}'
      + '#skyLoginOv .sl-f input{width:100%;padding:13px 14px;font-size:16px;border:2px solid #E4E0F0;border-radius:12px;background:#FCFBFF;color:#2A2438;}'
      + '#skyLoginOv .sl-f input:focus{outline:none;border-color:#5FB8E6;}'
      + '#skyLoginOv .sl-f input.pin{text-align:center;font-size:26px;letter-spacing:.5em;padding-left:.5em;font-weight:700;}'
      + '#skyLoginOv .sl-g{width:100%;padding:12px;border-radius:12px;border:2px solid #E4E0F0;background:#fff;color:#2A2438;font-weight:700;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;}'
      + '#skyLoginOv .sl-g.done{border-color:#3FA98A;color:#3FA98A;}'
      + '#skyLoginOv .sl-or{display:flex;align-items:center;gap:10px;margin:10px 0;font-size:11px;color:#7A7390;}'
      + '#skyLoginOv .sl-or::before,#skyLoginOv .sl-or::after{content:"";flex:1;height:1px;background:#E4E0F0;}'
      + '#skyLoginOv .sl-err{display:none;margin:4px 0 12px;padding:10px 12px;border-radius:12px;background:#FFF1F0;border:1.5px solid #F5B5AE;font-size:14px;font-weight:700;line-height:1.7;color:#C62828;text-align:center;}'
      + '#skyLoginOv .sl-err a{color:#6E5FB5;}'
      + '#skyLoginOv .sl-go{width:100%;padding:15px;border:none;border-radius:14px;color:#fff;cursor:pointer;background:linear-gradient(110deg,#F49AC1,#F5A97A,#F5D06A,#8FD9A8,#6FC7D9,#7BA3E8,#A88BE0,#F49AC1);text-shadow:0 1px 3px rgba(40,30,80,.35);font-family:"Zen Maru Gothic",sans-serif;font-weight:900;font-size:16px;}'
      + '#skyLoginOv .sl-go:disabled{opacity:.6;}'
      + '#skyLoginOv .sl-forgot{display:block;text-align:center;margin-top:12px;font-size:12px;color:#7A7390;}'
      + '#skyLoginOv .sl-done{text-align:center;padding:10px 0 4px;}'
      + '#skyLoginOv .sl-done .em{font-size:48px;line-height:1;}'
      + '#skyLoginOv .sl-done p{margin:10px 0 0;font-family:"Zen Maru Gothic",sans-serif;font-weight:900;font-size:18px;}';
    document.head.appendChild(css);

    ov = document.createElement("div");
    ov.id = "skyLoginOv";
    ov.innerHTML = ''
      + '<div class="sl-card" role="dialog" aria-labelledby="slTitle">'
      + '<button type="button" class="sl-x" id="slClose" aria-label="とじる">×</button>'
      + '<div id="slBody">'
      +   '<h3 id="slTitle">登録</h3><p class="sl-lead" id="slLead">これだけで、はじめられます</p>'
      +   '<div class="sl-seg" id="slSeg"><button type="button" data-m="new" class="on">はじめての方</button><button type="button" data-m="login">登録ずみの方</button></div>'
      +   '<p class="sl-err" id="slErr"></p>'
      +   '<form id="slJ" novalidate>'
      +     '<div class="sl-f"><label for="slName">お名前</label><input id="slName" autocomplete="name"></div>'
      +     '<div class="sl-f"><label>Googleアカウント か メールアドレス</label>'
      +       '<button type="button" class="sl-g" id="slJG"><b style="color:#4285F4;">G</b> Googleアカウントでつなぐ</button>'
      +       '<div class="sl-or">または</div><input id="slJMail" type="email" inputmode="email" autocomplete="email" placeholder="メールアドレス"></div>'
      +     '<div class="sl-f"><label for="slJPin">パスコード<small>数字4桁</small></label><input id="slJPin" class="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password"></div>'
      +     '<div class="sl-f"><label for="slJId">会員番号<small>分かれば</small></label><input id="slJId" inputmode="numeric" autocomplete="off"></div>'
      +     '<button type="submit" class="sl-go" id="slJGo">はじめる</button>'
      +   '</form>'
      +   '<form id="slL" novalidate hidden>'
      +     '<div class="sl-seg small" id="slTabs"><button type="button" data-t="google" class="on">Google</button><button type="button" data-t="id">会員番号</button><button type="button" data-t="mail">メール</button></div>'
      +     '<div class="sl-f" id="slPaneG"><button type="button" class="sl-g" id="slLG"><b style="color:#4285F4;">G</b> Googleアカウントをえらぶ</button></div>'
      +     '<div class="sl-f" id="slPaneId" hidden><label for="slId">会員番号</label><input id="slId" inputmode="numeric" autocomplete="username" placeholder="00012345"></div>'
      +     '<div class="sl-f" id="slPaneMail" hidden><label for="slLMail">メールアドレス</label><input id="slLMail" type="email" inputmode="email" autocomplete="email"></div>'
      +     '<div class="sl-f"><label for="slPin">パスコード<small>数字4桁</small></label><input id="slPin" class="pin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password"></div>'
      +     '<button type="submit" class="sl-go" id="slLGo">ログイン</button>'
      +     '<a href="#" class="sl-forgot" id="slForgot">パスコードをお忘れの方</a>'
      +   '</form>'
      + '</div>'
      + '<div class="sl-done" id="slDone" hidden><div class="em">🌱</div><p id="slDoneMsg"></p></div>'
      + '</div>';
    document.body.appendChild(ov);

    $("slClose").addEventListener("click", function () { window.skyLoginClose(); });
    ov.addEventListener("click", function (e) { if (e.target === ov) window.skyLoginClose(); });
    Array.prototype.forEach.call(ov.querySelectorAll("#slSeg button"), function (b) { b.addEventListener("click", function () { setMode(b.dataset.m); }); });
    Array.prototype.forEach.call(ov.querySelectorAll("#slTabs button"), function (b) { b.addEventListener("click", function () { setTab(b.dataset.t); }); });
    ["slJPin", "slPin"].forEach(function (k) { digits($(k), 4); });
    ["slJId", "slId"].forEach(function (k) { digits($(k)); });
    $("slJG").addEventListener("click", function () { startGoogle("new"); });
    $("slLG").addEventListener("click", function () { startGoogle("login"); });
    $("slJMail").addEventListener("input", function (e) {
      if (e.target.value && gMail) { gMail = ""; $("slJG").classList.remove("done"); $("slJG").innerHTML = '<b style="color:#4285F4;">G</b> Googleアカウントでつなぐ'; }
    });
    $("slJ").addEventListener("submit", doJoin);
    $("slL").addEventListener("submit", doLogin);
    $("slForgot").addEventListener("click", function (e) {
      e.preventDefault();
      msg("パスコードは、ご登録ページから決めなおしていただけます。<br><a href='" + BASE + "touroku.html' style='font-weight:700;'>ご登録ページをひらく ›</a>");
    });
  }
  function digits(el, max) {
    el.addEventListener("input", function () {
      el.value = el.value.replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 65248); }).replace(/\D/g, "").slice(0, max || 99);
    });
  }
  function setMode(m) {
    mode = m;
    Array.prototype.forEach.call(ov.querySelectorAll("#slSeg button"), function (b) { b.classList.toggle("on", b.dataset.m === m); });
    $("slJ").hidden = (m !== "new"); $("slL").hidden = (m !== "login");
    $("slTitle").textContent = m === "new" ? "登録" : "ログイン";
    $("slLead").textContent = m === "new" ? "これだけで、はじめられます" : "ご登録のときの内容で入れます";
    msg("");
  }
  function setTab(t) {
    tab = t;
    Array.prototype.forEach.call(ov.querySelectorAll("#slTabs button"), function (b) { b.classList.toggle("on", b.dataset.t === t); });
    $("slPaneG").hidden = (t !== "google"); $("slPaneId").hidden = (t !== "id"); $("slPaneMail").hidden = (t !== "mail");
    msg("");
  }
  function msg(t) {
    var e = $("slErr"); if (!e) return;
    e.innerHTML = t || ""; e.style.display = t ? "block" : "none";
    if (!t) return;
    var btn = $("slL").hidden ? $("slJGo") : $("slLGo");
    if (btn && e.nextElementSibling !== btn) btn.parentNode.insertBefore(e, btn);
    try { e.scrollIntoView({ block: "center" }); } catch (x) {}
  }

  /* ---------- Google（はじめて押したときに読みこみます） ---------- */
  var gReady = false, gLoading = false;
  function loadGoogle(cb) {
    if (gReady && window.google && google.accounts) return cb && cb();
    if (gLoading) return;
    gLoading = true;
    var s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = function () {
      try { google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onGoogle }); gReady = true; } catch (e) {}
      gLoading = false; if (cb) cb();
    };
    s.onerror = function () { gLoading = false; msg("Googleの読み込みができませんでした。メールアドレスか会員番号でお試しください。"); };
    document.head.appendChild(s);
  }
  function startGoogle(forWhat) {
    gFor = forWhat;
    if (!gReady) { msg("Googleを読みこんでいます。少しお待ちください。"); loadGoogle(function () { msg(""); try { google.accounts.id.prompt(); } catch (e) {} }); return; }
    google.accounts.id.prompt();
  }
  function onGoogle(res) {
    try {
      var p = JSON.parse(decodeURIComponent(escape(atob(res.credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))));
      gMail = String(p.email || "").toLowerCase(); gName = p.name || "";
      var label = "✓ " + gMail;
      $("slJG").classList.add("done"); $("slJG").textContent = label;
      $("slLG").classList.add("done"); $("slLG").textContent = label;
      $("slJMail").value = "";
      if (gFor === "new" && !$("slName").value.trim() && gName) $("slName").value = gName;
      msg("");
    } catch (e) { msg("Googleの確認ができませんでした。"); }
  }

  var ERR = {
    busy: "いま混み合っています。少しおいてお試しください。",
    emailtaken: "このメールアドレス（Googleアカウント）は、すでにご登録があります。<br>上の「登録ずみの方」から、ご自分で決めたパスコードで入ってください。",
    exists: "この会員番号は、すでにご登録があります。<br>上の「登録ずみの方」から、ご自分で決めたパスコードで入ってください。",
    proxy: "あなたは、すでにサポートのどなたかから登録をしてもらっています。<br>上の「登録ずみの方」から、会員番号とはじめのパスコード「1111」で入り、そのあと、ご自分で決めた新しいパスコードに変えてください。",
    pin1111: "1111 は使えません。ご自分で決めた数字4桁を入れてください。<br>サポートの方に先に登録してもらった方は、上の「登録ずみの方」から、会員番号と「1111」で入ることもできます。",
    badpin: "パスコードは数字4桁で入れてください。",
    badid: "会員番号は数字だけで入れてください。",
    bademail: "メールアドレスをご確認ください。",
    noname: "お名前を入れてください。",
    nomember: "ご登録が見つかりません。",
    email: "ご登録のGoogleアカウントと異なります。",
    nosave: "この端末では、ログインの記録を残せない設定になっています。<br>ブラウザの「プライベートモード」を解いてお試しください。"
  };

  /* ---------- 端末に残して、そのページの続きへ ---------- */
  function saveMe(j, pin, fallbackId) {
    var m = {
      id: j.id || fallbackId, pin: pin, email: j.email || "",
      name: j.name || "", realName: j.realName || "", area: j.area || "", keiretsu: j.keiretsu || "", role: j.role || "",
      sup: j.sup === true, crie: j.crie === true,
      nick: j.nick || "", keiChat: j.keiChat || "", refUrl: j.refUrl || "", linkJoin: j.linkJoin || "",
      badges: j.badges || [], celebrate: j.celebrate || "", helper: j.helper || "",
      dept: j.dept || "", deptLead: j.deptLead === true, schedIn: j.schedIn === true,
      needPin: j.needPin === true
    };
    localStorage.setItem("skyarc_member", JSON.stringify(m));
    if (!localStorage.getItem("skyarc_member")) throw new Error("nosave");
    try { localStorage.setItem("lsapp_returning", "1"); } catch (e) {}
    return m;
  }
  function finish(m, text) {
    $("slBody").hidden = true; $("slDoneMsg").textContent = text; $("slDone").hidden = false;
    var run = pending;
    setTimeout(function () {
      window.skyLoginClose();
      if (typeof run === "function") { try { run(m); } catch (e) {} }
      else location.reload();
    }, 1100);
  }

  /* ---------- はじめての方：登録 ---------- */
  async function doJoin(e) {
    e.preventDefault();
    var name = $("slName").value.trim();
    var mail = gMail || $("slJMail").value.trim().toLowerCase();
    var pin = $("slJPin").value.trim(), id = $("slJId").value.trim();
    var bad = !name ? ERR.noname
            : !mail ? "Googleアカウントをつなぐか、メールアドレスを入れてください。"
            : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail) ? ERR.bademail
            : !/^\d{4}$/.test(pin) ? ERR.badpin
            : pin === "1111" ? ERR.pin1111 : "";
    if (bad) { msg(bad); return; }
    msg("");
    var btn = $("slJGo"); btn.disabled = true;
    if (typeof skyLoading === "function") skyLoading("登録しています…");
    try {
      var r = await fetch(gasUrl(), { method: "POST", body: new URLSearchParams({ action: "join", name: name, email: mail, pin: pin, id: id, authType: gMail ? "Google" : "メール" }) });
      var j = await r.json();
      if (typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return;
      if (typeof skyLoadingDone === "function") skyLoadingDone();
      if (!j || j.ok !== true) { msg(ERR[j && j.error] || "登録できませんでした。少しおいてお試しください。"); return; }
      var m = saveMe(j, pin, j.id);
      finish(m, name + "さん、ようこそ");
    } catch (err) {
      if (typeof skyLoadingDone === "function") skyLoadingDone();
      msg(err && err.message === "nosave" ? ERR.nosave : "通信できませんでした。電波のよい場所でお試しください。");
    } finally { btn.disabled = false; }
  }

  /* ---------- 登録ずみの方：ログイン ---------- */
  async function doLogin(e) {
    e.preventDefault();
    var pin = $("slPin").value.trim(), id = "", email = "";
    if (tab === "google") { if (!gMail) { msg("先にGoogleアカウントをえらんでください。"); return; } email = gMail; }
    else if (tab === "mail") { email = $("slLMail").value.trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { msg(ERR.bademail); return; } }
    else { id = $("slId").value.trim(); if (!id) { msg("会員番号を入れてください。"); return; } }
    if (!/^\d{4}$/.test(pin)) { msg(ERR.badpin); return; }
    msg("");
    var btn = $("slLGo"); btn.disabled = true;
    if (typeof skyLoading === "function") skyLoading("ログインしています…");
    try {
      if (!id) {
        var r0 = await fetch(gasUrl() + "?action=byEmail&email=" + encodeURIComponent(email));
        var j0 = await r0.json();
        if (typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j0)) return;
        var list = (j0 && j0.members) || [];
        if (!j0.ok || !list.length) {
          if (typeof skyLoadingDone === "function") skyLoadingDone();
          msg("このメールアドレス（Googleアカウント）でのご登録が見つかりません。<br>会員番号でお試しいただくか、「はじめての方」から登録してください。");
          return;
        }
        id = list[0].id;
      }
      var url = gasUrl() + "?action=loginFast&id=" + encodeURIComponent(id) + "&pin=" + encodeURIComponent(pin) + (tab === "google" ? "&email=" + encodeURIComponent(email) : "");
      var r = await fetch(url);
      var j = await r.json();
      if (typeof skyCheckMaintenance === "function" && skyCheckMaintenance(j)) return;
      if (typeof skyLoadingDone === "function") skyLoadingDone();
      if (!j || j.ok !== true) {
        if (j && j.error === "locked") msg("パスコードのお間違いが続いたため、<b>" + (j.wait || 60) + "秒ほど</b>おやすみいただきます。");
        else if (j && j.error === "pin") msg("パスコードが違います。" + (j.rest > 0 ? "<br>あと" + j.rest + "回まちがえると、少しおやすみになります。" : ""));
        else msg(ERR[j && j.error] || "ログインできませんでした。");
        return;
      }
      var m = saveMe(j, pin, id);
      finish(m, (m.name || "") + (m.name ? "さん、おかえりなさい" : "おかえりなさい"));
      /* バッジは、あとから静かに取りに行きます（前と同じ） */
      fetch(gasUrl() + "?action=extra&id=" + encodeURIComponent(m.id) + "&pin=" + encodeURIComponent(pin))
        .then(function (r2) { return r2.json(); })
        .then(function (e2) { if (e2 && e2.ok) { m.badges = e2.badges || []; m.celebrate = e2.celebrate || ""; localStorage.setItem("skyarc_member", JSON.stringify(m)); } })
        .catch(function () {});
    } catch (err) {
      if (typeof skyLoadingDone === "function") skyLoadingDone();
      msg(err && err.message === "nosave" ? ERR.nosave : "通信できませんでした。電波のよい場所でお試しください。");
    } finally { btn.disabled = false; }
  }

  /* ---------- 呼び出し口（いままでどおり skyLoginRequired(あとで実行したい処理) で使えます） ---------- */
  window.skyLoginRequired = function (afterLogin) {
    build();
    pending = afterLogin || null;
    $("slBody").hidden = false; $("slDone").hidden = true;
    var back = false; try { back = localStorage.getItem("lsapp_returning") === "1"; } catch (e) {}
    setMode(back ? "login" : "new");   /* 前にこの端末で入ったことがある方は「登録ずみの方」から */
    ov.classList.add("show");
    loadGoogle();
  };
  window.skyLoginClose = function () { if (ov) ov.classList.remove("show"); pending = null; };

  /* ================================================================
     このページをお使いいただけない方へのご案内
     ----------------------------------------------------------------
     skyNotAllowed("この画面は…") と呼ぶと、
     ご案内をお出ししてから、その方に合う入口へお戻しします。
  ================================================================ */
  window.skyNotAllowed = function (message) {
    var d = document.createElement("div");
    d.id = "skyMoveBox";
    d.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(42,36,56,.62);"
      + "backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:22px;";
    d.innerHTML = '<div style="background:#fff;border-radius:20px;padding:30px 26px;max-width:330px;'
      + 'width:100%;text-align:center;box-shadow:0 14px 44px rgba(0,0,0,.3);">'
      + '<div style="font-size:40px;line-height:1;">🌱</div>'
      + '<p style="font-family:\'Zen Maru Gothic\',\'Noto Sans JP\',sans-serif;font-weight:700;'
      + 'font-size:16px;color:#3E3A50;margin:12px 0 10px;line-height:1.6;">'
      + 'いまの進み具合に合わせた<br>ページを読み込みます</p>'
      + (message
          ? '<p style="font-size:12.5px;color:#8B889E;line-height:1.9;margin-bottom:20px;">'
            + message + '</p>'
          : '<div style="height:8px;"></div>')
      + '<button id="skyMoveOk" style="width:100%;padding:14px;border-radius:13px;border:none;'
      + 'cursor:pointer;background:#6E5FB5;color:#fff;font-size:15px;font-weight:700;'
      + 'font-family:inherit;">OK</button>'
      + '</div>';
    document.body.appendChild(d);
    document.getElementById("skyMoveOk").addEventListener("click", function () {
      /* 押していただいてから、読み込みのご案内を出して移ります */
      var url = window.skyHomeFor();
      if (typeof window.skyGoTo === "function") window.skyGoTo(url, "読み込んでいます");
      else location.replace(url);
    });
  };

  /* ================================================================
     育成プログラムのポータルへ戻ります
     ----------------------------------------------------------------
     玄関（ikusei/index.html）は転送するだけなので、
     その方のポータルへ直接ご案内します。
  ================================================================ */
  window.skyBackToPortal = function () {
    var m = null;
    try {
      var raw = localStorage.getItem("skyarc_member");
      if (raw && raw !== "null") m = JSON.parse(raw);
    } catch (e) {}
    var here = location.pathname;
    var up = (here.indexOf("/ikusei/") >= 0) ? "./"
           : (here.indexOf("/first-support/") >= 0 ? "../ikusei/" : "./ikusei/");
    if (!m || !m.id) return (here.indexOf("/ikusei/") >= 0 ? "../" : "./") + "index.html";
    var role = String(m.role || "");
    if (role || m.crie === true) return up + "portal-creators.html";
    if (m.sup === true) return up + "portal-supporter.html";
    return up + "member.html";
  };

  /* その方に合う入口をお返しします */
  window.skyHomeFor = function (m) {
    if (!m) {
      try {
        var raw = localStorage.getItem("skyarc_member");
        if (raw && raw !== "null") m = JSON.parse(raw);
      } catch (e) {}
    }
    var here = location.pathname;
    var up = (here.indexOf("/ikusei/") >= 0 || here.indexOf("/first-support/") >= 0) ? "../" : "./";
    if (!m || !m.id) return up + "index.html";
    /* 役職をお持ちの方は、クリエーターズのページへ */
    var role = String(m.role || "");
    if (role) return up + "ikusei/portal-creators.html";
    if (m.crie === true) return up + "ikusei/portal-creators.html";
    if (m.sup === true)  return up + "ikusei/portal-supporter.html";
    return up + "index.html";   /* 仮組み：ファーストサポートはトップの丸で進めるので、トップへ */
  };

})();
