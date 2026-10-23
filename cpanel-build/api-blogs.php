<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$storeFile = __DIR__ . '/blogs-data.json';
$sitemapFile = __DIR__ . '/sitemap.xml';
$authFile = __DIR__ . '/.tradebd-admin-hash.php';

// Default initial admin password (can be changed anytime by Admin from the Blog panel)
$defaultPasswordPlain = 'Tradebd@2026';

function getStoredPasswordHash($authFile, $defaultPasswordPlain) {
  if (file_exists($authFile)) {
    $raw = @file_get_contents($authFile);
    if ($raw) {
      $lines = explode("\n", trim($raw));
      if (count($lines) >= 2 && !empty(trim($lines[1]))) {
        return trim($lines[1]);
      }
    }
  }
  return password_hash($defaultPasswordPlain, PASSWORD_DEFAULT);
}

function saveNewPasswordHash($authFile, $newPasswordPlain) {
  $hash = password_hash($newPasswordPlain, PASSWORD_DEFAULT);
  $content = "<?php http_response_code(403); exit('Forbidden'); ?>\n" . $hash . "\n";
  return @file_put_contents($authFile, $content, LOCK_EX) !== false;
}

function isAuthorizedAdmin($providedKey, $authFile, $defaultPasswordPlain) {
  if (!is_string($providedKey) || trim($providedKey) === '') {
    return false;
  }
  $hash = getStoredPasswordHash($authFile, $defaultPasswordPlain);
  return password_verify($providedKey, $hash);
}

function loadArticles($file) {
  if (!file_exists($file)) {
    return [];
  }
  $raw = @file_get_contents($file);
  if (!$raw) {
    return [];
  }
  $decoded = json_decode($raw, true);
  return is_array($decoded) ? $decoded : [];
}

function saveArticles($file, $articles) {
  @file_put_contents(
    $file,
    json_encode(array_values($articles), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
    LOCK_EX
  );
}

function translateTextServer($text, $sourceLang, $targetLang) {
  if (!is_string($text) || trim($text) === '') {
    return $text;
  }
  $url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl='
    . urlencode($sourceLang)
    . '&tl=' . urlencode($targetLang)
    . '&dt=t';
  $postBody = 'q=' . urlencode($text);

  $response = false;
  if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postBody);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
      'Content-Type: application/x-www-form-urlencoded;charset=UTF-8',
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0');
    $response = curl_exec($ch);
    curl_close($ch);
  }
  if ($response === false) {
    $ctx = stream_context_create([
      'http' => [
        'method' => 'POST',
        'timeout' => 10,
        'header' => "Content-Type: application/x-www-form-urlencoded;charset=UTF-8\r\nUser-Agent: Mozilla/5.0\r\n",
        'content' => $postBody,
      ],
    ]);
    $response = @file_get_contents($url, false, $ctx);
  }
  if (!$response) {
    return $text;
  }
  $decoded = json_decode($response, true);
  if (!is_array($decoded) || !isset($decoded[0]) || !is_array($decoded[0])) {
    return $text;
  }
  $out = '';
  foreach ($decoded[0] as $segment) {
    if (is_array($segment) && isset($segment[0])) {
      $out .= $segment[0];
    }
  }
  return trim($out) !== '' ? $out : $text;
}

function syncSitemap($sitemapPath, $customArticles) {
  $today = date('Y-m-d');
  $baseUrls = [
    ['loc' => 'https://tradebd.online/', 'freq' => 'daily', 'prio' => '1.0'],
    ['loc' => 'https://tradebd.online/blog', 'freq' => 'daily', 'prio' => '0.95'],
    ['loc' => 'https://tradebd.online/simulator', 'freq' => 'daily', 'prio' => '0.9'],
    ['loc' => 'https://tradebd.online/calendar', 'freq' => 'hourly', 'prio' => '0.9'],
    ['loc' => 'https://tradebd.online/academy', 'freq' => 'weekly', 'prio' => '0.9'],
    ['loc' => 'https://tradebd.online/patterns', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/calculator', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/blog/forex-trading-bangla-complete-guide', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/blog/candlestick-chart-patterns-bangla-guide', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/blog/risk-management-lot-size-stop-loss-formula', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/blog/best-forex-trading-sessions-bangladesh-time-bst', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/blog/support-and-resistance-trading-strategy-bangla', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/blog/rsi-ema-bollinger-bands-indicator-strategy-bangla', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/blog/crypto-paper-trading-simulator-beginner-guide', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/blog/trading-psychology-fomo-revenge-trading-control', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/about', 'freq' => 'monthly', 'prio' => '0.7'],
    ['loc' => 'https://tradebd.online/contact', 'freq' => 'monthly', 'prio' => '0.7'],
    ['loc' => 'https://tradebd.online/privacy', 'freq' => 'monthly', 'prio' => '0.7'],
    ['loc' => 'https://tradebd.online/terms', 'freq' => 'monthly', 'prio' => '0.6'],
    ['loc' => 'https://tradebd.online/disclaimer', 'freq' => 'monthly', 'prio' => '0.6'],
  ];

  $seen = [];
  foreach ($baseUrls as $u) {
    $seen[$u['loc']] = true;
  }

  foreach ($customArticles as $art) {
    if (!empty($art['slug'])) {
      $url = 'https://tradebd.online/blog/' . rawurlencode($art['slug']);
      if (!isset($seen[$url])) {
        $seen[$url] = true;
        $baseUrls[] = [
          'loc' => $url,
          'freq' => 'weekly',
          'prio' => '0.85',
        ];
      }
    }
  }

  $xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  $xml .= "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
  foreach ($baseUrls as $u) {
    $loc = htmlspecialchars($u['loc'], ENT_XML1, 'UTF-8');
    $xml .= "  <url>\n";
    $xml .= "    <loc>{$loc}</loc>\n";
    $xml .= "    <lastmod>{$today}</lastmod>\n";
    $xml .= "    <changefreq>{$u['freq']}</changefreq>\n";
    $xml .= "    <priority>{$u['prio']}</priority>\n";
    $xml .= "  </url>\n";
  }
  $xml .= "</urlset>\n";

  @file_put_contents($sitemapPath, $xml, LOCK_EX);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $articles = loadArticles($storeFile);
  if (!empty($articles) && !empty($articles[0]['slug'])) {
    $firstSlugUrl = 'https://tradebd.online/blog/' . rawurlencode($articles[0]['slug']);
    $sitemapRaw = file_exists($sitemapFile) ? @file_get_contents($sitemapFile) : '';
    if (!$sitemapRaw || strpos($sitemapRaw, $firstSlugUrl) === false) {
      syncSitemap($sitemapFile, $articles);
    }
  }
  echo json_encode([
    'status' => 'success',
    'articles' => $articles,
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

if ($method === 'POST') {
  $input = file_get_contents('php://input');
  $data = json_decode($input, true);
  if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
    exit;
  }

  $action = $data['action'] ?? '';
  $adminKey = isset($data['adminKey']) ? (string)$data['adminKey'] : '';

  // Public or Admin translation helper endpoint
  if ($action === 'translate') {
    $text = isset($data['text']) ? (string)$data['text'] : '';
    $sourceLang = isset($data['sourceLang']) ? (string)$data['sourceLang'] : 'auto';
    $targetLang = isset($data['targetLang']) ? (string)$data['targetLang'] : 'en';
    $translated = translateTextServer($text, $sourceLang, $targetLang);
    echo json_encode([
      'status' => 'success',
      'translatedText' => $translated,
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }

  // Verify Admin Login
  if ($action === 'verify') {
    if (isAuthorizedAdmin($adminKey, $authFile, $defaultPasswordPlain)) {
      echo json_encode(['status' => 'success', 'authenticated' => true]);
    } else {
      http_response_code(401);
      echo json_encode(['status' => 'error', 'authenticated' => false, 'message' => 'Invalid Admin Password']);
    }
    exit;
  }

  // All write/modify actions strictly require valid Admin Password
  if (!isAuthorizedAdmin($adminKey, $authFile, $defaultPasswordPlain)) {
    http_response_code(403);
    echo json_encode([
      'status' => 'error',
      'message' => 'Unauthorized: Valid Admin Password is required to publish, edit, or delete articles.',
    ]);
    exit;
  }

  // Change Admin Password
  if ($action === 'change_password') {
    $newPass = isset($data['newPassword']) ? trim((string)$data['newPassword']) : '';
    if (strlen($newPass) < 6) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'New password must be at least 6 characters.']);
      exit;
    }
    saveNewPasswordHash($authFile, $newPass);
    echo json_encode(['status' => 'success', 'message' => 'Password updated successfully']);
    exit;
  }

  $articles = loadArticles($storeFile);

  if ($action === 'save' && !empty($data['article']) && is_array($data['article'])) {
    $newArt = $data['article'];
    $id = isset($newArt['id']) ? (string)$newArt['id'] : ('custom-' . time());
    $newArt['id'] = $id;

    $filtered = [];
    foreach ($articles as $existing) {
      if (($existing['id'] ?? '') !== $id) {
        $filtered[] = $existing;
      }
    }
    array_unshift($filtered, $newArt);
    saveArticles($storeFile, $filtered);
    syncSitemap($sitemapFile, $filtered);

    echo json_encode([
      'status' => 'success',
      'articles' => $filtered,
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }

  if ($action === 'delete' && !empty($data['id'])) {
    $delId = (string)$data['id'];
    $filtered = [];
    foreach ($articles as $existing) {
      if (($existing['id'] ?? '') !== $delId) {
        $filtered[] = $existing;
      }
    }
    saveArticles($storeFile, $filtered);
    syncSitemap($sitemapFile, $filtered);

    echo json_encode([
      'status' => 'success',
      'articles' => $filtered,
    ], JSON_UNESCAPED_UNICODE);
    exit;
  }

  echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
  exit;
}

echo json_encode(['status' => 'ok']);
