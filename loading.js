/* ================================================================
   読み込み中のご案内
   ----------------------------------------------------------------
   skyLoading("ログインしています")  … 表示します
   skyLoadingDone()                  … 消します
   skyLoadingError("…")              … うまくいかなかったとき

   ・1秒たっても終わらないときに出ます(すぐ終わる処理では出ません)
   ・8秒、20秒と経つにつれて、ご案内の言葉が変わります
================================================================ */
(function () {
  var box = null, showTimer = null, tick = null, sec = 0, showing = false;

  function build() {
    if (box) return;

    var css = document.createElement("style");
    css.textContent = ''
      + '#skyLoad{display:none;position:fixed;inset:0;z-index:100000;'
      + 'background:rgba(42,36,56,.62);backdrop-filter:blur(3px);'
      + 'align-items:center;justify-content:center;padding:22px;}'
      + '#skyLoad.show{display:flex;animation:sklFade .2s ease;}'
      + '@keyframes sklFade{from{opacity:0}to{opacity:1}}'
      + '.skl-card{background:#fff;border-radius:22px;padding:32px 28px;text-align:center;'
      + 'box-shadow:0 14px 44px rgba(0,0,0,.3);max-width:320px;width:100%;'
      + 'animation:sklPop .28s cubic-bezier(.34,1.4,.64,1);}'
      + '@keyframes sklPop{from{transform:scale(.88);opacity:0}to{transform:scale(1);opacity:1}}'
      + '.skl-ring{width:54px;height:54px;margin:0 auto 18px;border-radius:50%;'
      + 'border:5px solid #EDEAF9;border-top-color:#6E5FB5;animation:sklSpin .85s linear infinite;}'
      + '@keyframes sklSpin{to{transform:rotate(360deg)}}'
      + '.skl-msg{font-family:"Zen Maru Gothic","Noto Sans JP",sans-serif;'
      + 'font-size:16px;font-weight:700;color:#3E3A50;line-height:1.7;}'
      + '.skl-dots{display:inline-block;width:1.6em;text-align:left;}'
      + '.skl-sub{font-size:12.5px;color:#8B889E;line-height:1.9;margin-top:11px;}'
      + '.skl-bar{height:4px;background:#EDEAF9;border-radius:99px;margin-top:16px;overflow:hidden;}'
      + '.skl-bar i{display:block;height:100%;width:35%;border-radius:99px;'
      + 'background:linear-gradient(90deg,#9A86E0,#5E8FD8);animation:sklSlide 1.4s ease-in-out infinite;}'
      + '@keyframes sklSlide{0%{transform:translateX(-110%)}100%{transform:translateX(320%)}}'
      + '.skl-card.err .skl-ring{animation:none;border-top-color:#E8788A;border-color:#F8DDE2;}'
      + '.skl-card.err .skl-bar{display:none;}'
      + '.skl-btn{margin-top:18px;padding:13px 26px;border-radius:12px;border:none;cursor:pointer;'
      + 'background:#6E5FB5;color:#fff;font-size:14px;font-weight:700;display:none;'
      + 'font-family:inherit;}'
      + '.skl-btn.show{display:inline-block;}';
    document.head.appendChild(css);

    box = document.createElement("div");
    box.id = "skyLoad";
    box.innerHTML = ''
      + '<div class="skl-card" id="sklCard">'
      +   '<div class="skl-ring"></div>'
      +   '<p class="skl-msg"><span id="sklMsg">読み込んでいます</span>'
      +     '<span class="skl-dots" id="sklDots">…</span></p>'
      +   '<p class="skl-sub" id="sklSub">しばらくお待ちください</p>'
      +   '<div class="skl-bar"><i></i></div>'
      +   '<button class="skl-btn" id="sklBtn">とじる</button>'
      + '</div>';
    document.body.appendChild(box);
    document.getElementById("sklBtn").addEventListener("click", window.skyLoadingDone);
  }

  /* 点々を動かします */
  function startTick() {
    var n = 0;
    sec = 0;
    tick = setInterval(function () {
      n = (n + 1) % 4;
      var d = document.getElementById("sklDots");
      if (d) d.textContent = "…".slice(0, 1).repeat(0) + ["", "・", "・・", "・・・"][n];

      sec++;
      var sub = document.getElementById("sklSub");
      if (!sub) return;
      /* 待つ時間が延びたら、ご案内を変えます */
      if (sec === 6)  sub.textContent = "もう少しかかっています。そのままお待ちください🙏";
      if (sec === 14) sub.innerHTML = "アクセスが集中しているようです。<br>画面を閉じずにお待ちください🙏";
      if (sec === 28) sub.innerHTML = "時間がかかっています。<br>電波のよい場所だと、早く終わることがあります。";
    }, 500);
  }

  window.skyLoading = function (message, subMessage) {
    clearTimeout(showTimer);
    clearInterval(tick);
    /* すぐ終わる処理でちらつかないよう、1秒待ってから出します */
    showTimer = setTimeout(function () {
      build();
      showing = true;
      document.getElementById("sklCard").className = "skl-card";
      document.getElementById("sklMsg").textContent = message || "読み込んでいます";
      document.getElementById("sklSub").textContent = subMessage || "しばらくお待ちください";
      document.getElementById("sklDots").textContent = "";
      document.getElementById("sklBtn").className = "skl-btn";
      box.classList.add("show");
      startTick();
    }, 1000);
  };

  /* ページを開くまで、ぐるぐるを出したままにします */
  window.skyGoTo = function (url, label) {
    window.skyLoading(label || "ひらいています", "もうすぐです");
    /* すぐ出す（1秒待たずに） */
    clearTimeout(showTimer);
    build();
    showing = true;
    document.getElementById("sklCard").className = "skl-card";
    document.getElementById("sklMsg").textContent = label || "ひらいています";
    document.getElementById("sklSub").textContent = "もうすぐです";
    document.getElementById("sklBtn").className = "skl-btn";
    box.classList.add("show");
    startTick();
    setTimeout(function () { location.href = url; }, 60);
  };

  window.skyLoadingDone = function () {
    clearTimeout(showTimer);
    clearInterval(tick);
    if (box && showing) { box.classList.remove("show"); showing = false; }
  };

  window.skyLoadingError = function (message, subMessage) {
    clearTimeout(showTimer);
    clearInterval(tick);
    build();
    showing = true;
    document.getElementById("sklCard").className = "skl-card err";
    document.getElementById("sklMsg").textContent = message || "うまくいきませんでした";
    document.getElementById("sklDots").textContent = "";
    document.getElementById("sklSub").textContent =
      subMessage || "少し時間をおいて、もう一度お試しください🙏";
    document.getElementById("sklBtn").className = "skl-btn show";
    box.classList.add("show");
  };
})();
