/* ================================================================
   どのページでもログインできる共通の部品
   ----------------------------------------------------------------
   ・ログインしていない状態で「保存が必要な操作」をしたときに開きます
   ・skyLoginRequired(あとで実行したい処理) と呼ぶだけで使えます
   ・LINE内ブラウザから外部ブラウザに移った直後でも、ここから入れます
================================================================ */
(function () {
  var GAS = "https://script.google.com/macros/s/AKfycbzY2l20zwGULjnKRUqvRpbH79fPkl5e-sWNVoXEIgBrDpqhjDAx2zLvJuqO3sZxAfHj/exec";

  var ov = null, pending = null;

  /* ---------- 画面の部品を用意します(最初に呼ばれたときだけ) ---------- */
  function build() {
    if (ov) return;
  /* ---------- 見た目 ---------- */
  var css = document.createElement("style");
  css.textContent = ''
    + '#skyLoginOv{display:none;position:fixed;inset:0;z-index:9999;background:rgba(40,28,70,.62);align-items:center;justify-content:center;padding:18px;}'
    + '#skyLoginOv.show{display:flex;}'
    + '#skyLoginOv *{box-sizing:border-box;font-family:inherit;}'
    + '.sl-card{background:#fff;border-radius:20px;padding:26px 22px;width:100%;max-width:370px;box-shadow:0 14px 46px rgba(0,0,0,.32);max-height:88vh;overflow-y:auto;}'
    + '.sl-card h3{font-size:17px;font-weight:900;color:#6E5FB5;text-align:center;margin:0 0 4px;}'
    + '.sl-card .sl-lead{font-size:12.5px;color:#7A8A80;text-align:center;line-height:1.8;margin:0 0 16px;}'
    + '.sl-f{margin-bottom:12px;}'
    + '.sl-f label{display:block;font-size:12px;font-weight:700;color:#6E5FB5;margin-bottom:5px;}'
    + '.sl-f input{width:100%;padding:12px 13px;font-size:16px;border:2px solid #EDEAF9;border-radius:10px;background:#FBF8FE;color:#22322A;}'
    + '.sl-f input:focus{outline:none;border-color:#4FB08C;}'
    + '.sl-btn{width:100%;padding:14px;border-radius:12px;background:#4FB08C;color:#fff;font-size:15px;font-weight:700;border:none;cursor:pointer;}'
    + '.sl-btn:disabled{opacity:.6;}'
    + '.sl-sub{display:block;text-align:center;font-size:11.5px;color:#8A9A90;margin-top:12px;text-decoration:none;}'
    + '.sl-msg{display:none;border-radius:9px;padding:9px 12px;font-size:12px;margin-bottom:12px;line-height:1.7;}'
    + '.sl-msg.err{display:block;background:#FDEBEB;color:#B33;}'
    + '.sl-msg.ok{display:block;background:#EAF7F0;color:#2F7A5C;}';
  document.head.appendChild(css);

  ov = document.createElement("div");
  ov.id = "skyLoginOv";
  ov.innerHTML = ''
    + '<div class="sl-card">'
    +   '<h3>🌱 ログイン</h3>'
    +   '<p class="sl-lead">記録を残すために、会員番号とパスコードを入れてください。<br>'
    +   'どの端末からでも、同じ内容が見られるようになります。</p>'
    +   '<div class="sl-msg" id="slMsg"></div>'
    +   '<div class="sl-f"><label>会員番号</label>'
    +     '<input type="text" id="slId" name="member-id" autocomplete="username" inputmode="numeric" placeholder="00012345"></div>'
    +   '<div class="sl-f"><label>パスコード(4桁)</label>'
    +     '<input type="password" id="slPin" name="pin" autocomplete="current-password" inputmode="numeric" maxlength="4" placeholder="数字4桁"></div>'
    +   '<button class="sl-btn" id="slBtn">ログイン</button>'
    +   '<a class="sl-sub" href="#" id="slClose">あとにする</a>'
    + '</div>';
  document.body.appendChild(ov);

  document.getElementById("slClose").addEventListener("click", function (e) {
    e.preventDefault(); window.skyLoginClose();
  });
  ov.addEventListener("click", function (e) { if (e.target === ov) window.skyLoginClose(); });
  document.getElementById("slBtn").addEventListener("click", doLogin);
  ["slId", "slPin"].forEach(function (k) {
    document.getElementById(k).addEventListener("keydown", function (e) {
      if (e.key === "Enter") doLogin();
    });
  });
  }

  function msg(t, cls) {
    var el = document.getElementById("slMsg");
    el.textContent = t; el.className = "sl-msg " + cls;
  }

  /* ---------- 呼び出し口 ---------- */
  window.skyLoginRequired = function (afterLogin) {
    build();
    pending = afterLogin || null;
    document.getElementById("slMsg").className = "sl-msg";
    ov.classList.add("show");
    setTimeout(function () { document.getElementById("slId").focus(); }, 100);
  };
  window.skyLoginClose = function () { if (ov) ov.classList.remove("show"); pending = null; };

  /* ---------- ログイン処理 ---------- */
  async function doLogin() {
    var id = document.getElementById("slId").value.trim();
    var pin = document.getElementById("slPin").value.trim();
    var btn = document.getElementById("slBtn");
    if (!id) { msg("会員番号を入れてください", "err"); return; }
    if (!/^\d{4}$/.test(pin)) { msg("パスコードは4桁の数字で入れてください", "err"); return; }

    btn.disabled = true; btn.textContent = "確認中…";
    msg("確認しています…", "ok");
    if (typeof skyLoading === "function") skyLoading("ログインしています…");
    try {
      var url = GAS + "?action=login&id=" + encodeURIComponent(id) + "&pin=" + encodeURIComponent(pin);
      var res = await fetch(url);
      var j = await res.json();
      if (typeof skyLoadingDone === "function") skyLoadingDone();
      if (j.ok === false) {
        msg({
          busy: "いま混み合っています。少しおいてお試しください",
          pin: "パスコードが違います",
          nomember: "その会員番号は登録されていません",
          emailtaken: "このメールは別の会員番号で登録されています",
          email: "登録されている連絡先と異なります"
        }[j.error] || "ログインできませんでした", "err");
        return;
      }
      /* 保存して、この端末で使えるようにします */
      var m = {
        id: id, pin: pin,
        name: j.name || "", realName: j.realName || "", area: j.area || "", keiretsu: j.keiretsu || "",
        role: j.role || "", sup: j.sup === true, crie: j.crie === true,
        nick: j.nick || "", keiChat: j.keiChat || "", refUrl: j.refUrl || "",
        badges: j.badges || [], celebrate: j.celebrate || "",
        email: j.email || ""
      };
      /* 保存できたかを確かめます(ブラウザの設定で保存できない場合があります) */
      try {
        localStorage.setItem("skyarc_member", JSON.stringify(m));
        var check = localStorage.getItem("skyarc_member");
        if (!check) throw new Error("saved but empty");
      } catch (se) {
        msg("この端末では、ログインの記録を残せない設定になっています。\n" +
            "ブラウザの「プライベートモード」を解いてお試しください。", "err");
        return;
      }
      msg("✅ ログインしました", "ok");

      /* バッジは、あとから静かに取りに行きます */
      fetch(GAS + "?action=extra&id=" + encodeURIComponent(id) + "&pin=" + encodeURIComponent(pin))
        .then(function (r) { return r.json(); })
        .then(function (e2) {
          if (e2 && e2.ok) {
            m.badges = e2.badges || []; m.celebrate = e2.celebrate || "";
            localStorage.setItem("skyarc_member", JSON.stringify(m));
          }
        }).catch(function () {});

      var run = pending;
      setTimeout(function () {
        window.skyLoginClose();
        if (typeof run === "function") { try { run(m); } catch (e) {} }
        else location.reload();
      }, 700);
    } catch (e) {
      if (typeof skyLoadingDone === "function") skyLoadingDone();
      msg("通信できませんでした。電波のよい場所でお試しください。", "err");
    } finally {
      btn.disabled = false; btn.textContent = "ログイン";
    }
  }


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
    if (m.crie === true) return up + "ikusei/portal-creators.html";
    if (m.sup === true)  return up + "ikusei/portal-supporter.html";
    return up + "first-support/";
  };

})();
