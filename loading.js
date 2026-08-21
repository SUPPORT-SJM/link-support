/* ================================================================
   読み込み中のご案内(くるくる)
   ----------------------------------------------------------------
   skyLoading("ログインしています…")  … 表示します
   skyLoadingDone()                    … 消します
   skyLoadingError("…")                … うまくいかなかったとき
   ・0.4秒以内に終わる処理では表示しません(ちらつき防止)
   ・8秒たっても終わらないときは「混み合っています」とお伝えします
================================================================ */
(function () {
  var box = null, timer = null, slowTimer = null, showing = false;

  function build() {
    if (box) return;
    var css = document.createElement("style");
    css.textContent = ''
      + '#skyLoad{display:none;position:fixed;inset:0;z-index:10000;background:rgba(40,28,70,.42);'
      + 'backdrop-filter:blur(2px);align-items:center;justify-content:center;padding:20px;}'
      + '#skyLoad.show{display:flex;}'
      + '.skl-card{background:#fff;border-radius:18px;padding:26px 28px;text-align:center;'
      + 'box-shadow:0 10px 34px rgba(0,0,0,.24);max-width:300px;width:100%;}'
      + '.skl-ring{width:44px;height:44px;margin:0 auto 14px;border-radius:50%;'
      + 'border:4px solid #EDEAF9;border-top-color:#6E5FB5;animation:sklSpin .8s linear infinite;}'
      + '@keyframes sklSpin{to{transform:rotate(360deg);}}'
      + '.skl-msg{font-size:13.5px;font-weight:700;color:#4A4560;line-height:1.7;}'
      + '.skl-sub{font-size:11.5px;color:#8B889E;line-height:1.8;margin-top:8px;display:none;}'
      + '.skl-sub.show{display:block;}'
      + '.skl-card.err .skl-ring{animation:none;border-top-color:#E8788A;border-color:#F8DDE2;}'
      + '.skl-btn{margin-top:14px;padding:11px 20px;border-radius:10px;border:none;cursor:pointer;'
      + 'background:#6E5FB5;color:#fff;font-size:13px;font-weight:700;display:none;}'
      + '.skl-btn.show{display:inline-block;}';
    document.head.appendChild(css);

    box = document.createElement("div");
    box.id = "skyLoad";
    box.innerHTML = ''
      + '<div class="skl-card" id="sklCard">'
      +   '<div class="skl-ring"></div>'
      +   '<p class="skl-msg" id="sklMsg">読み込んでいます…</p>'
      +   '<p class="skl-sub" id="sklSub"></p>'
      +   '<button class="skl-btn" id="sklBtn">とじる</button>'
      + '</div>';
    document.body.appendChild(box);
    document.getElementById("sklBtn").addEventListener("click", window.skyLoadingDone);
  }

  window.skyLoading = function (message) {
    clearTimeout(timer); clearTimeout(slowTimer);
    /* すぐ終わる処理でちらつかないよう、少し待ってから出します */
    timer = setTimeout(function () {
      build();
      showing = true;
      document.getElementById("sklCard").className = "skl-card";
      document.getElementById("sklMsg").textContent = message || "読み込んでいます…";
      document.getElementById("sklSub").className = "skl-sub";
      document.getElementById("sklBtn").className = "skl-btn";
      box.classList.add("show");

      /* 長引いたら、待っていただくご案内を添えます */
      slowTimer = setTimeout(function () {
        var sub = document.getElementById("sklSub");
        if (!sub) return;
        sub.textContent = "アクセスが集中しています。もう少しお待ちください🙏";
        sub.className = "skl-sub show";
      }, 8000);
    }, 400);
  };

  window.skyLoadingDone = function () {
    clearTimeout(timer); clearTimeout(slowTimer);
    if (box && showing) { box.classList.remove("show"); showing = false; }
  };

  window.skyLoadingError = function (message, subMessage) {
    clearTimeout(timer); clearTimeout(slowTimer);
    build();
    showing = true;
    document.getElementById("sklCard").className = "skl-card err";
    document.getElementById("sklMsg").textContent = message || "うまくいきませんでした";
    var sub = document.getElementById("sklSub");
    sub.textContent = subMessage || "少し時間をおいて、もう一度お試しください🙏";
    sub.className = "skl-sub show";
    document.getElementById("sklBtn").className = "skl-btn show";
    box.classList.add("show");
  };
})();
