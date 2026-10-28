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

function buildCustomBlogHtml($article) {
  $indexFile = __DIR__ . '/index.html';
  if (!file_exists($indexFile)) {
    return null;
  }
  $baseHtml = @file_get_contents($indexFile);
  if (!$baseHtml) {
    return null;
  }

  $slug = preg_replace('/[^a-zA-Z0-9\-_]/', '', (string)($article['slug'] ?? ''));
  if ($slug === '') {
    return null;
  }

  $canonicalUrl = 'https://tradebd.online/blog/' . $slug;
  $rawTitle = trim((string)($article['titleEn'] ?? $article['titleBn'] ?? 'Trading Guide'));
  $fullTitle = $rawTitle . ' – Tradebd';
  $rawDesc = trim((string)($article['excerptEn'] ?? $article['excerptBn'] ?? $rawTitle));
  $rawLead = trim((string)($article['excerptBn'] ?? $article['excerptEn'] ?? ''));
  $rawContentEn = trim((string)($article['contentEn'] ?? ''));
  $rawContentBn = trim((string)($article['contentBn'] ?? ''));

  $safeTitle = htmlspecialchars($fullTitle, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $safeDesc = htmlspecialchars($rawDesc, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $safeH1 = htmlspecialchars($rawTitle, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  $safeLead = htmlspecialchars($rawLead, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

  $paragraphsHtml = '';
  $combinedText = $rawContentEn !== '' ? $rawContentEn : $rawContentBn;
  foreach (preg_split("/\n\s*\n/", $combinedText) as $para) {
    $trimmed = trim($para);
    if ($trimmed === '') continue;
    $escaped = htmlspecialchars($trimmed, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $escaped = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $escaped);
    if ( strpos($trimmed, '## ') === 0 ) {
      $headingText = htmlspecialchars(substr($trimmed, 3), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $paragraphsHtml .= "<h2 style=\"font-size: 20px; font-weight: 700; margin: 22px 0 10px 0;\">{$headingText}</h2>\n";
    } else {
      $paragraphsHtml .= "<p>{$escaped}</p>\n";
    }
  }

  if ($rawContentBn !== '' && $rawContentEn !== '' && $rawContentBn !== $rawContentEn) {
    $paragraphsHtml .= "<hr style=\"margin: 24px 0; opacity: 0.2;\" />\n";
    foreach (preg_split("/\n\s*\n/", $rawContentBn) as $paraBn) {
      $trimmedBn = trim($paraBn);
      if ($trimmedBn === '') continue;
      $escapedBn = htmlspecialchars($trimmedBn, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
      $escapedBn = preg_replace('/\*\*(.+?)\*\*/s', '<strong>$1</strong>', $escapedBn);
      $paragraphsHtml .= "<p>{$escapedBn}</p>\n";
    }
  }

  $pageHtml = $baseHtml;
  $pageHtml = preg_replace('/<title>[\s\S]*?<\/title>/', "<title>{$safeTitle}</title>", $pageHtml, 1);
  $pageHtml = preg_replace('/<meta\s+name="description"\s+content="[^"]*"\s*\/>/', "<meta name=\"description\" content=\"{$safeDesc}\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/', "<link rel=\"canonical\" href=\"{$canonicalUrl}\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<link\s+rel="alternate"\s+hreflang="en"\s+href="[^"]*"\s*\/>/', "<link rel=\"alternate\" hreflang=\"en\" href=\"{$canonicalUrl}\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<link\s+rel="alternate"\s+hreflang="bn"\s+href="[^"]*"\s*\/>/', "<link rel=\"alternate\" hreflang=\"bn\" href=\"{$canonicalUrl}?lang=bn\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<link\s+rel="alternate"\s+hreflang="x-default"\s+href="[^"]*"\s*\/>/', "<link rel=\"alternate\" hreflang=\"x-default\" href=\"{$canonicalUrl}\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/', '<meta property="og:type" content="article" />', $pageHtml, 1);
  $pageHtml = preg_replace('/<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/', "<meta property=\"og:url\" content=\"{$canonicalUrl}\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/', "<meta property=\"og:title\" content=\"{$safeTitle}\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/', "<meta property=\"og:description\" content=\"{$safeDesc}\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/', "<meta name=\"twitter:title\" content=\"{$safeTitle}\" />", $pageHtml, 1);
  $pageHtml = preg_replace('/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/', "<meta name=\"twitter:description\" content=\"{$safeDesc}\" />", $pageHtml, 1);

  $schemaGraph = [
    '@context' => 'https://schema.org',
    '@graph' => [
      [
        '@type' => 'BreadcrumbList',
        '@id' => $canonicalUrl . '#breadcrumb',
        'itemListElement' => [
          ['@type' => 'ListItem', 'position' => 1, 'name' => 'Tradebd Home', 'item' => 'https://tradebd.online/'],
          ['@type' => 'ListItem', 'position' => 2, 'name' => 'Trading Blog', 'item' => 'https://tradebd.online/blog'],
          ['@type' => 'ListItem', 'position' => 3, 'name' => $rawTitle, 'item' => $canonicalUrl],
        ],
      ],
      [
        '@type' => 'BlogPosting',
        '@id' => $canonicalUrl . '#article',
        'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $canonicalUrl],
        'headline' => $rawTitle,
        'description' => $rawDesc,
        'image' => !empty($article['coverImage']) ? $article['coverImage'] : 'https://tradebd.online/og-banner.png',
        'datePublished' => !empty($article['publishedAt']) ? $article['publishedAt'] : date('Y-m-d'),
        'dateModified' => date('Y-m-d'),
        'author' => [
          '@type' => 'Organization',
          'name' => !empty($article['author']) ? $article['author'] : 'Tradebd Editorial Team',
          'url' => 'https://tradebd.online/',
        ],
        'publisher' => [
          '@type' => 'Organization',
          'name' => 'Tradebd Financial Education Academy',
          'logo' => [
            '@type' => 'ImageObject',
            'url' => 'https://tradebd.online/logo.svg',
          ],
        ],
        'inLanguage' => ['en', 'bn'],
      ],
    ],
  ];

  $jsonLdTag = "\n    <script type=\"application/ld+json\">" . json_encode($schemaGraph, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "</script>\n  </head>";
  $pageHtml = str_replace('</head>', $jsonLdTag, $pageHtml);

  $articleHtml = "<article>\n<h1>{$safeH1}</h1>\n<p><strong>{$safeLead}</strong></p>\n{$paragraphsHtml}\n<p><a href=\"https://tradebd.online/blog\">← Back to Tradebd Educational Blog</a> | <a href=\"https://tradebd.online/simulator\">Practice on Paper Trading Simulator</a></p>\n</article>";
  $pageHtml = preg_replace('/<article>[\s\S]*?<\/article>/', $articleHtml, $pageHtml, 1);

  return $pageHtml;
}

function syncCustomBlogPrerenders($customArticles) {
  $blogPrerenderDir = __DIR__ . '/prerender/blog';
  if (!is_dir($blogPrerenderDir)) {
    @mkdir($blogPrerenderDir, 0755, true);
  }
  if (!is_dir($blogPrerenderDir)) {
    return;
  }
  foreach ($customArticles as $art) {
    $slug = preg_replace('/[^a-zA-Z0-9\-_]/', '', (string)($art['slug'] ?? ''));
    if ($slug === '') continue;
    $html = buildCustomBlogHtml($art);
    if ($html) {
      @file_put_contents($blogPrerenderDir . '/' . $slug . '.html', $html, LOCK_EX);
    }
  }
}

function syncSitemap($sitemapPath, $customArticles) {
  $realYear = (int)date('Y');
  $today = ($realYear > 2025) ? '2025-02-25' : date('Y-m-d');
  $baseUrls = [
    ['loc' => 'https://tradebd.online/', 'freq' => 'daily', 'prio' => '1.0'],
    ['loc' => 'https://tradebd.online/blog', 'freq' => 'daily', 'prio' => '0.95'],
    ['loc' => 'https://tradebd.online/simulator', 'freq' => 'daily', 'prio' => '0.9'],
    ['loc' => 'https://tradebd.online/calendar', 'freq' => 'hourly', 'prio' => '0.9'],
    ['loc' => 'https://tradebd.online/academy', 'freq' => 'weekly', 'prio' => '0.9'],
    ['loc' => 'https://tradebd.online/patterns', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/calculator', 'freq' => 'weekly', 'prio' => '0.85'],
    ['loc' => 'https://tradebd.online/mentor', 'freq' => 'weekly', 'prio' => '0.85'],
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
  syncCustomBlogPrerenders($customArticles);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
  $articles = loadArticles($storeFile);

  // Dynamic SEO Pre-render Responder for Custom Blog URLs (/blog/<slug>)
  if (!empty($_GET['prerender_slug'])) {
    $reqSlug = preg_replace('/[^a-zA-Z0-9\-_]/', '', (string)$_GET['prerender_slug']);
    $staticPrerender = __DIR__ . '/prerender/blog/' . $reqSlug . '.html';
    if (file_exists($staticPrerender)) {
      header('Content-Type: text/html; charset=utf-8');
      header('Cache-Control: public, max-age=300');
      readfile($staticPrerender);
      exit;
    }
    foreach ($articles as $art) {
      if (($art['slug'] ?? '') === $reqSlug) {
        $generatedHtml = buildCustomBlogHtml($art);
        if ($generatedHtml) {
          @file_put_contents($staticPrerender, $generatedHtml, LOCK_EX);
          header('Content-Type: text/html; charset=utf-8');
          header('Cache-Control: public, max-age=300');
          echo $generatedHtml;
          exit;
        }
      }
    }
    // Fallback to index.html if slug not found
    $indexFile = __DIR__ . '/index.html';
    if (file_exists($indexFile)) {
      header('Content-Type: text/html; charset=utf-8');
      readfile($indexFile);
      exit;
    }
  }

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
    $deletedSlug = '';
    $filtered = [];
    foreach ($articles as $existing) {
      if (($existing['id'] ?? '') === $delId) {
        $deletedSlug = preg_replace('/[^a-zA-Z0-9\-_]/', '', (string)($existing['slug'] ?? ''));
      } else {
        $filtered[] = $existing;
      }
    }
    if ($deletedSlug !== '') {
      $oldPrerender = __DIR__ . '/prerender/blog/' . $deletedSlug . '.html';
      if (file_exists($oldPrerender)) {
        @unlink($oldPrerender);
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
