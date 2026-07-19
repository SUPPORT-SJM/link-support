/* クリエイターズ育成マイページ 最小サービスワーカー
   (ホーム画面追加を可能にするためのもの。キャッシュはしない=常に最新を表示) */
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ self.clients.claim(); });
self.addEventListener('fetch', function(e){ /* ネットワークそのまま(何もしない) */ });
