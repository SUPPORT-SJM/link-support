/* クリエイターズ育成 サービスワーカー v1.1
   ----------------------------------------------------------------
   キャッシュは一切しません。常に最新のページを取りに行きます。
   (古い版が表示され続ける問題を防ぐため)
*/
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.map(function(n){ return caches.delete(n); }));
    }).then(function(){ return self.clients.claim(); })
  );
});
/* fetchは何もしない=常にネットワークから取得 */
