-- ローカル D1 専用の seed (pnpm dev が毎回流す)。本番には流さない
-- id を固定した INSERT OR IGNORE なので、何度流しても重複しない
INSERT OR IGNORE INTO shops (id, name, area, genre, status, map_url, rating, memo, image_url, visited_at, created_by) VALUES
  (1, '架空珈琲 清澄店', '清澄白河', 'カフェ', 'visited', NULL, 5, 'ラテが最高だった', NULL, '2026-09-20', 'miura'),
  (2, 'サンプル食堂', '西荻窪', '定食', 'visited', NULL, 4, '日替わりの唐揚げがおすすめ', NULL, '2026-09-28', 'yuma'),
  (3, 'テスト麺房', '新宿', 'ラーメン', 'want_to_go', NULL, NULL, '味噌が気になる', NULL, NULL, 'miura'),
  (4, '居酒屋 ダミー', '西荻窪', '居酒屋', 'want_to_go', NULL, NULL, NULL, NULL, NULL, 'yuma'),
  (5, 'トラットリア・エセンピオ', '吉祥寺', 'イタリアン', 'visited', NULL, 3, 'パスタは良いが待ち時間が長い', NULL, '2026-08-15', 'miura'),
  (6, '仮名ベーカリー', '清澄白河', 'パン', 'want_to_go', NULL, NULL, '週末限定のクロワッサン', NULL, NULL, 'yuma'),
  (7, 'スパイス研究所 (架空)', '渋谷', 'カレー', 'visited', NULL, 5, 'あいがけが正解', NULL, '2026-10-05', 'yuma'),
  (8, '鮨 れいだい', '中目黒', '寿司', 'want_to_go', NULL, NULL, NULL, NULL, NULL, 'miura'),
  (9, '喫茶 みほん', '吉祥寺', 'カフェ', 'visited', NULL, 2, 'ナポリタンは普通', NULL, '2026-07-30', 'miura'),
  (10, '焼鳥 ためし', '新宿', '焼き鳥', 'want_to_go', NULL, NULL, '予約が必要らしい', NULL, NULL, 'yuma');
