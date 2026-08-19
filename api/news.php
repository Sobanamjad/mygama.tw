<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$rssUrl = 'https://chinanewscloud.com/api/v1/rss-news';

$context = stream_context_create([
    'http' => [
        'timeout' => 12,
        'user_agent' => 'YellowstoneAM News Reader/1.0',
        'header' => "Accept: application/rss+xml, application/xml, text/xml\r\n"
    ],
    'ssl' => [
        'verify_peer' => true,
        'verify_peer_name' => true
    ]
]);

$xmlString = @file_get_contents($rssUrl, false, $context);

if ($xmlString === false) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to load RSS feed'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

libxml_use_internal_errors(true);
$xml = simplexml_load_string($xmlString, 'SimpleXMLElement', LIBXML_NOCDATA);

if (!$xml || !isset($xml->channel->item)) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid RSS feed'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function normalizeUrl(string $url): string
{
    $url = trim(html_entity_decode($url, ENT_QUOTES | ENT_HTML5, 'UTF-8'));

    if ($url === '') {
        return '';
    }

    if (str_starts_with($url, '//')) {
        return 'https:' . $url;
    }

    if (str_starts_with($url, '/')) {
        return 'https://chinanewscloud.com' . $url;
    }

    return $url;
}

function makeSlug(string $link, string $title): string
{
    $path = parse_url($link, PHP_URL_PATH);

    if (is_string($path)) {
        $parts = array_values(array_filter(explode('/', trim($path, '/'))));

        if (!empty($parts)) {
            return trim(urldecode((string) end($parts)));
        }
    }

    return trim(preg_replace('/\s+/u', '-', $title));
}

function getItemContent(SimpleXMLElement $item): string
{
    if (isset($item->content)) {
        $value = (string) $item->content;
        if ($value !== '') {
            return $value;
        }
    }

    $namespaces = $item->getNameSpaces(true);

    if (isset($namespaces['content'])) {
        $contentNode = $item->children($namespaces['content']);
        if (isset($contentNode->encoded)) {
            return (string) $contentNode->encoded;
        }
    }

    return '';
}

function extractFirstImage(string $html): string
{
    if ($html === '') {
        return '';
    }

    if (preg_match('/<img[^>]+(?:src|data-src)=["\']([^"\']+)["\']/i', $html, $matches)) {
        return normalizeUrl($matches[1]);
    }

    return '';
}

function getFeedCategory(SimpleXMLElement $item, string $title, string $description): string
{
    // Prefer the RSS <category> value when present.
    if (isset($item->category)) {
        foreach ($item->category as $category) {
            $value = trim((string) $category);
            if ($value !== '') {
                return $value;
            }
        }
    }

    // Restricted fallback for feeds that omit <category>.
    // This deliberately returns only the three categories used by this feed view.
    $text = $title . ' ' . $description;

    if (preg_match('/房產|房市|住宅|租賃|不動產|地產|社宅|房屋|地籍|建案/u', $text)) {
        return '房產新聞';
    }

    if (preg_match('/台股|股票|證券|投資|財報|營收|金融|指數|外資|基金|股市|加權|櫃買|ETF/u', $text)) {
        return '財經新聞';
    }

    return '產經新聞';
}

function sanitizeArticleHtml(string $html): string
{
    if (trim($html) === '') {
        return '';
    }

    $allowedTags = '<p><br><strong><b><em><i><u><ul><ol><li><h2><h3><h4><blockquote><a><img><figure><figcaption>';

    $html = preg_replace('#<(script|style|iframe|object|embed|form)[^>]*>.*?</\1>#is', '', $html);
    $html = strip_tags($html, $allowedTags);

    $html = preg_replace('/\s+on[a-z]+\s*=\s*(["\']).*?\1/iu', '', $html);
    $html = preg_replace('/\s+style\s*=\s*(["\']).*?\1/iu', '', $html);

    $html = preg_replace_callback(
        '/<img\b([^>]*)>/iu',
        function ($matches) {
            $attrs = $matches[1];
            $src = '';

            if (preg_match('/(?:src|data-src)\s*=\s*(["\'])(.*?)\1/iu', $attrs, $m)) {
                $src = normalizeUrl($m[2]);
            }

            if ($src === '') {
                return '';
            }

            return '<img src="' .
                htmlspecialchars($src, ENT_QUOTES | ENT_HTML5, 'UTF-8') .
                '" loading="lazy" alt="">';
        },
        $html
    );

    $html = preg_replace_callback(
        '/<a\b([^>]*)>/iu',
        function ($matches) {
            $attrs = $matches[1];
            $href = '';

            if (preg_match('/href\s*=\s*(["\'])(.*?)\1/iu', $attrs, $m)) {
                $href = trim(html_entity_decode($m[2], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            }

            if ($href === '' || preg_match('#^(javascript|data):#iu', $href)) {
                return '<span>';
            }

            $href = normalizeUrl($href);

            return '<a href="' .
                htmlspecialchars($href, ENT_QUOTES | ENT_HTML5, 'UTF-8') .
                '" target="_blank" rel="noopener noreferrer">';
        },
        $html
    );

    return $html;
}

function buildNewsItem(SimpleXMLElement $item, bool $includeContent = false): array
{
    $title = trim((string) $item->title);
    $link = trim((string) $item->link);
    $content = getItemContent($item);

    $description = trim(
        preg_replace(
            '/\s+/u',
            ' ',
            html_entity_decode(
                strip_tags((string) $item->description),
                ENT_QUOTES | ENT_HTML5,
                'UTF-8'
            )
        )
    );

    $image = extractFirstImage($content);

    if ($image === '' && isset($item->enclosure)) {
        $attrs = $item->enclosure->attributes();
        if (isset($attrs['url'])) {
            $image = normalizeUrl((string) $attrs['url']);
        }
    }

    $namespaces = $item->getNameSpaces(true);

    if ($image === '' && isset($namespaces['media'])) {
        $media = $item->children($namespaces['media']);

        if (isset($media->content)) {
            $attrs = $media->content->attributes();
            if (isset($attrs['url'])) {
                $image = normalizeUrl((string) $attrs['url']);
            }
        }

        if ($image === '' && isset($media->thumbnail)) {
            $attrs = $media->thumbnail->attributes();
            if (isset($attrs['url'])) {
                $image = normalizeUrl((string) $attrs['url']);
            }
        }
    }

    $result = [
        'slug' => makeSlug($link, $title),
        'title' => $title,
        'link' => $link,
        'date' => trim((string) $item->pubDate),
        'description' => $description,
        'image' => $image,
        'category' => getFeedCategory($item, $title, $description)
    ];

    if ($includeContent) {
        $result['content_html'] = sanitizeArticleHtml($content);
    }

    return $result;
}

$requestedSlug = isset($_GET['slug']) ? trim((string) $_GET['slug']) : '';

if ($requestedSlug !== '') {
    foreach ($xml->channel->item as $item) {
        $candidate = buildNewsItem($item);

        if ($candidate['slug'] === $requestedSlug) {
            echo json_encode([
                'success' => true,
                'article' => buildNewsItem($item, true)
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }

    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Article not found'
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$news = [];

foreach ($xml->channel->item as $item) {
    $news[] = buildNewsItem($item);

    if (count($news) >= 30) {
        break;
    }
}

echo json_encode([
    'success' => true,
    'news' => $news
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);