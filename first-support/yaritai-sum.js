/* ================================================================
   やりたいことを見つける：まとめの表示（v1.2.073）
   ----------------------------------------------------------------
   yaritai.html（本人のまとめ）と、メンバーマネジメントルーム（担当の方が見る画面）の
   両方で同じ見え方になるように、ここにまとめています。
   yaritaiSum(答え) … 書いてあるところだけの HTML を返します（何もなければ ""）
================================================================ */
(function(){
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  window.yaritaiSum = function(a){
    a = a || {};
    const row = (l, v) => { v = Array.isArray(v) ? v.filter(Boolean).join("\n") : v; return v && String(v).trim() ? '<dt>' + esc(l) + '</dt><dd>' + esc(v) + '</dd>' : ""; };
    const sec = (cls, t, body) => body ? '<h3 class="' + cls + '">' + t + '</h3><dl>' + body + '</dl>' : "";
    return sec("why", "💗 ビッグWHY", row("幸せ", a["why.happy"]) + row("楽しい", a["why.fun"]) + row("嬉しい", a["why.glad"]) + row("なりたくない状態", a["why.dislike"])) +
      sec("dream", "🌟 夢", row("ベストなライフスタイル", a["dream.life"]) + row("送りたい人生", a["dream.route"]) + row("なりたい人", a["dream.person"])) +
      sec("vision", "🌱 ビジョン", row("叶っていると言える状態", a["vision.done"]) + row("なぜ、叶ったと言えるのか", a["vision.why"]) +
      row("いつまでに叶ったら最高か", a["vision.when"] ? [a["vision.when"][0] && "すべてそろっていたら：" + a["vision.when"][0], a["vision.when"][1] && "このくらいあればできそう：" + a["vision.when"][1]] : "") +
      row("プラスしたら叶いそうなもの", a["vision.plus"]) + row("いま一番最初にすること", a["vision.first"]));
  };
})();
