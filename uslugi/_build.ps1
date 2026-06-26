# Генератор страниц изделий из uslugi/_data.json
$ErrorActionPreference = 'Stop'
$dir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$data = Get-Content (Join-Path $dir '_data.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$faq  = Get-Content (Join-Path $dir '_faq.json')  -Raw -Encoding UTF8 | ConvertFrom-Json
$imgs = Get-Content (Join-Path $dir '_images.json') -Raw -Encoding UTF8 | ConvertFrom-Json

function Pexels([string]$id, [int]$w, [int]$h) {
  # Локальные сток-картинки (avif) лежат в ../images. $w/$h оставлены для совместимости вызовов.
  if (-not $id) { return $null }
  if ($id -eq '28288788') { $id = '4705932' }  # фото 28288788 удалено с pexels (404) — заглушка-текстура
  return "../images/pexels-photo-$id.avif"
}

# Реальные фото работ по тематике: slug -> (префикс файлов, кол-во, заголовок галереи, alt)
$realWork = @{
  'stoleshnicy-kuhonnye' = @{ pre='kuhnya';  n=15; h='Кухонные столешницы<br>в&nbsp;<em>интерьерах</em> Иркутска';   alt='Кухонная столешница из искусственного камня, Иркутск' }
  'stoleshnicy-v-vannoy' = @{ pre='vannaya'; n=13; h='Столешницы в&nbsp;ванную<br><em>из камня</em> · Иркутск';      alt='Столешница в ванную из искусственного камня, Иркутск' }
  'ofisnye-stoly'        = @{ pre='stol';    n=16; h='Столы и&nbsp;столешницы<br><em>из камня</em> · Иркутск';        alt='Стол из искусственного камня, Иркутск' }
  'barnye-stoyki'        = @{ pre='ostrov';  n=11; h='Барные стойки и&nbsp;<em>острова</em><br>из камня · Иркутск';  alt='Барная стойка и остров из искусственного камня, Иркутск' }
}
# Картинка плитки в каталоге для тематических товаров (реальное фото вместо стока)
$catTileImg = @{
  'stoleshnicy-kuhonnye' = '../images/work-kuhnya-3.webp'
  'stoleshnicy-v-vannoy' = '../images/work-vannaya-4.webp'
  'barnye-stoyki'        = '../images/work-ostrov-4.webp'
  'ofisnye-stoly'        = '../images/work-stol-6.webp'
}
function GallerySection($slug) {
  if (-not $realWork.ContainsKey($slug)) { return '' }
  $g = $realWork[$slug]
  $tiles = ''
  for ($i = 1; $i -le $g.n; $i++) {
    $img = "../images/work-$($g.pre)-$i.webp"
    $tiles += "        <a class=`"g-tile glightbox`" data-gallery=`"$($g.pre)`" data-type=`"image`" href=`"$img`"><img src=`"$img`" alt=`"$($g.alt) — работа $i`" loading=`"lazy`"></a>`n"
  }
  return "<section class=`"section section--tight gallery`">`n  <div class=`"container`">`n    <div class=`"section-head section-head--center`" data-reveal>`n      <span class=`"eyebrow eyebrow--center`">Наши работы</span>`n      <h2>$($g.h)</h2>`n    </div>`n  </div>`n  <div class=`"container`">`n    <div class=`"gallery-grid`" data-reveal>`n$tiles    </div>`n  </div>`n</section>`n`n"
}
function PropVal($obj, $name) {
  $p = $obj.PSObject.Properties[$name]; if ($p) { return $p.Value } else { return $null }
}

$cats = [ordered]@{
  home  = 'В доме и квартире'
  comm  = 'В коммерческих помещениях'
  decor = 'Декор и нестандартные изделия'
  rare  = 'Нестандартные решения'
}
$favicon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23c4cad2'/%3E%3Ctext x='50' y='71' font-size='58' text-anchor='middle' fill='%2316181c' font-family='Georgia'%3EК%3C/text%3E%3C/svg%3E"

$head = @'
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css">
<script>
window.imgFB = function (img) {
  if (img.dataset.fbStage === '2') return;
  if (!img.dataset.fbStage) { img.dataset.fbStage = '1';
    img.src = 'https://loremflickr.com/' + (img.dataset.w||1200) + '/' + (img.dataset.h||800) + '/' + (img.dataset.kw||'kitchen,marble');
  } else { img.dataset.fbStage = '2'; if (img.parentElement) img.parentElement.classList.add('media-fallback'); }
};
</script>
<link rel="stylesheet" href="../assets/css/style.css">
<link rel="icon" href="__FAV__">
<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110157989', 'ym');

    ym(110157989, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/110157989" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
'@
$head = $head.Replace('__FAV__', $favicon)

$header = @'
<header class="header">
  <div class="container header__inner">
    <a href="../index.html" class="logo"><span class="logo__mark">К</span><span>КАМЕНЪ</span></a>
    <nav class="nav">
      <a href="../index.html#materials">Материалы</a>
      <a href="index.html">Изделия</a>
      <a href="../index.html#works">Работы</a>
      <a href="../index.html#faq">Вопросы</a>
    </nav>
    <div class="header__cta">
      <button class="btn btn--gold" data-modal>Оставить заявку</button>
      <button class="theme-toggle" aria-label="Сменить тему">☀</button>
      <button class="burger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
'@

$footerAndScripts = @'
<footer class="footer">
  <div class="container">
    <div class="footer__bottom" style="border:0">
      <span>© <span id="year">2026</span> КАМЕНЪ — столешницы из искусственного камня в Иркутске</span>
      <a href="../index.html" style="display:inline">На главную</a>
    </div>
  </div>
</footer>

<button class="fab" data-modal aria-label="Оставить заявку">✎</button>

<div class="modal" id="modal">
  <div class="modal__overlay"></div>
  <div class="modal__box">
    <button class="modal__close" aria-label="Закрыть">×</button>
    <h3>Оставить заявку</h3>
    <p>Перезвоним за 15 минут, рассчитаем стоимость и запишем на бесплатный замер.</p>
    <form data-lead>
      <input type="hidden" name="access_key" value="">
      <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">
      <div class="field"><input type="text" name="name" placeholder="Ваше имя" required></div>
      <div class="field"><input type="tel" name="phone" placeholder="Телефон" required></div>
      <div class="field"><textarea name="comment" rows="3" placeholder="Что нужно сделать? (необязательно)"></textarea></div>
      <button type="submit" class="btn btn--gold btn--block btn--lg">Отправить заявку</button>
      <div class="form-msg"></div>
    </form>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js"></script>
<script src="../assets/js/main.js"></script>
</body>
</html>
'@

# ---- Шаблон страницы изделия ----
$tpl = @'
<!DOCTYPE html>
<html lang="ru">
<head>
__HEAD__
<title>__TITLE__</title>
<meta name="description" content="__DESC__">
<link rel="canonical" href="https://lithos-irk.ru/uslugi/__SLUG__.html">
<meta name="geo.region" content="RU-IRK"><meta name="geo.placename" content="Иркутск">
<meta property="og:type" content="website">
<meta property="og:site_name" content="КАМЕНЪ — изделия из искусственного камня, Иркутск">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="__TITLE__">
<meta property="og:description" content="__DESC__">
<meta property="og:url" content="https://lithos-irk.ru/uslugi/__SLUG__.html">
<meta property="og:image" content="https://lithos-irk.ru/images/og/og-__SLUG__.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="__H1__">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Product","name":"__H1__","description":"__DESC__","brand":{"@type":"Brand","name":"КАМЕНЪ"},"offers":{"@type":"Offer","priceCurrency":"RUB","availability":"https://schema.org/InStock","areaServed":"Иркутск"}}
</script>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Главная","item":"https://lithos-irk.ru/"},{"@type":"ListItem","position":2,"name":"Изделия","item":"https://lithos-irk.ru/uslugi/"},{"@type":"ListItem","position":3,"name":"__H1__"}]}
</script>
</head>
<body>
__HEADER__
<section class="page-hero">
  <div class="page-hero__bg"><img src="__HEROSRC__" alt="__H1__ в Иркутске" onerror="imgFB(this)" data-kw="__KW__" data-w="1600" data-h="900"></div>
  <div class="container">
    <div class="crumbs"><a href="../index.html">Главная</a> / <a href="index.html">Изделия</a> / __CATLABEL__</div>
    <h1>__H1__</h1>
    <p>__LEAD__</p>
  </div>
</section>

<section class="section">
  <div class="container article-grid">
    <div class="prose">
      <p class="lead">__P1__</p>
      <p>__P2__</p>
      <h2>Преимущества и что входит</h2>
      <ul>
__BULLETS__
      </ul>
      <h2>Какой камень выбрать</h2>
      <p>__BEST__ Поможем определиться на бесплатной консультации и привезём образцы на замер.</p>
      <p><a href="index.html">← Все изделия из камня</a></p>
    </div>
    <aside class="aside-cta">
      <h3>Рассчитать изделие</h3>
      <p>Пришлём расчёт и образцы. Перезвоним за 15 минут.</p>
      <form data-lead>
        <input type="hidden" name="access_key" value="">
        <input type="checkbox" name="botcheck" style="display:none" tabindex="-1" autocomplete="off">
        <input type="hidden" name="product" value="__H1__">
        <div class="field"><input type="text" name="name" placeholder="Имя" required></div>
        <div class="field"><input type="tel" name="phone" placeholder="Телефон" required></div>
        <button type="submit" class="btn btn--gold btn--block btn--lg">Получить расчёт</button>
        <div class="form-msg"></div>
      </form>
    </aside>
  </div>
</section>

__GALLERY__
__FAQSECTION__
__FOOTER__
'@

$count = 0
foreach ($it in $data) {
  $bullets = ($it.bullets | ForEach-Object { "        <li>$_</li>" }) -join "`n"

  # фото Pexels (с фолбэком на loremflickr через imgFB)
  $heroId  = PropVal $imgs $it.slug
  $herosrc = if ($heroId) { Pexels $heroId 1600 900 } else { "https://loremflickr.com/1600/900/$($it.kw)" }

  # мини-FAQ
  $faqItems = PropVal $faq $it.slug
  $faqSection = ''
  if ($faqItems) {
    $rows = ''
    $ld = @()
    foreach ($pair in $faqItems) {
      $q = $pair[0]; $a = $pair[1]
      $rows += "      <div class=`"faq__item`"><button class=`"faq__q`">$q</button><div class=`"faq__a`"><p>$a</p></div></div>`n"
      $ld  += '{"@type":"Question","name":"' + $q + '","acceptedAnswer":{"@type":"Answer","text":"' + $a + '"}}'
    }
    $faqSection = "<section class=`"section section--tight`" id=`"faq`">`n  <div class=`"container`">`n    <div class=`"section-head section-head--center`" data-reveal>`n      <span class=`"eyebrow eyebrow--center`">Вопросы об изделии</span>`n      <h2>Частые <em>вопросы</em></h2>`n    </div>`n    <div class=`"faq`" data-reveal>`n$rows    </div>`n  </div>`n</section>`n`n"
    $faqSection += '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[' + ($ld -join ',') + ']}</script>'
  }

  $html = $tpl
  $html = $html.Replace('__HEAD__',   $head)
  $html = $html.Replace('__HEADER__', $header)
  $html = $html.Replace('__FOOTER__', $footerAndScripts)
  $html = $html.Replace('__TITLE__',  $it.title)
  $html = $html.Replace('__DESC__',   $it.desc)
  $html = $html.Replace('__SLUG__',   $it.slug)
  $html = $html.Replace('__H1__',     $it.h1)
  $html = $html.Replace('__KW__',     $it.kw)
  $html = $html.Replace('__CATLABEL__', $cats[$it.cat])
  $html = $html.Replace('__LEAD__',   $it.lead)
  $html = $html.Replace('__P1__',     $it.p1)
  $html = $html.Replace('__P2__',     $it.p2)
  $html = $html.Replace('__BULLETS__', $bullets)
  $html = $html.Replace('__BEST__',   $it.best)
  $html = $html.Replace('__HEROSRC__', $herosrc)
  $html = $html.Replace('__GALLERY__', (GallerySection $it.slug))
  $html = $html.Replace('__FAQSECTION__', $faqSection)
  Set-Content (Join-Path $dir ($it.slug + '.html')) -Value $html -Encoding UTF8 -NoNewline
  $count++
}

# ---- Каталог (uslugi/index.html) ----
$catCards = ''
foreach ($key in $cats.Keys) {
  $items = $data | Where-Object { $_.cat -eq $key }
  if (-not $items) { continue }
  $catCards += "    <div class=`"section-head section-head--center`" data-reveal>`n      <span class=`"eyebrow eyebrow--center`">$($cats[$key])</span>`n    </div>`n    <div class=`"gallery-grid`" data-reveal style=`"margin-bottom:60px`">`n"
  foreach ($it in $items) {
    if ($catTileImg.ContainsKey($it.slug)) {
      # реальное фото работы — без onerror-фолбэка
      $catCards += "      <a class=`"g-tile`" href=`"$($it.slug).html`"><img src=`"$($catTileImg[$it.slug])`" alt=`"$($it.h1)`" loading=`"lazy`"><span class=`"g-tile__cap`"><b>$($it.h1)</b></span></a>`n"
    } else {
      $cid = PropVal $imgs $it.slug
      $csrc = if ($cid) { Pexels $cid 800 600 } else { "https://loremflickr.com/800/600/$($it.kw)" }
      $catCards += "      <a class=`"g-tile`" href=`"$($it.slug).html`"><img src=`"$csrc`" alt=`"$($it.h1)`" onerror=`"imgFB(this)`" data-kw=`"$($it.kw)`" data-w=`"800`" data-h=`"600`"><span class=`"g-tile__cap`"><b>$($it.h1)</b></span></a>`n"
    }
  }
  $catCards += "    </div>`n"
}

$catalog = @'
<!DOCTYPE html>
<html lang="ru">
<head>
__HEAD__
<title>Изделия из искусственного камня в Иркутске — каталог | КАМЕНЪ</title>
<meta name="description" content="Каталог изделий из искусственного камня в Иркутске: столешницы, подоконники, барные стойки, мойки, душевые поддоны, ресепшн, фартуки и другое. На заказ от производителя.">
<link rel="canonical" href="https://lithos-irk.ru/uslugi/">
<meta name="geo.region" content="RU-IRK"><meta name="geo.placename" content="Иркутск">
<meta property="og:type" content="website">
<meta property="og:site_name" content="КАМЕНЪ — изделия из искусственного камня, Иркутск">
<meta property="og:locale" content="ru_RU">
<meta property="og:title" content="Изделия из искусственного камня в Иркутске — каталог | КАМЕНЪ">
<meta property="og:description" content="Каталог изделий из искусственного камня в Иркутске: столешницы, подоконники, барные стойки, мойки, душевые поддоны, ресепшн, фартуки и другое. На заказ от производителя.">
<meta property="og:url" content="https://lithos-irk.ru/uslugi/">
<meta property="og:image" content="https://lithos-irk.ru/images/og/og-uslugi.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Изделия из искусственного камня в Иркутске">
<meta name="twitter:card" content="summary_large_image">
</head>
<body>
__HEADER__
<section class="page-hero">
  <div class="page-hero__bg"><img src="../images/pexels-photo-10099318.avif" alt="Изделия из искусственного камня" onerror="imgFB(this)" data-kw="kitchen,marble,interior" data-w="1600" data-h="900"></div>
  <div class="container">
    <div class="crumbs"><a href="../index.html">Главная</a> / Изделия</div>
    <h1>Изделия из искусственного камня</h1>
    <p>Делаем не только кухонные столешницы. Из акрила, кварца и литьевого мрамора изготавливаем десятки изделий для дома, бизнеса и декора — на заказ в Иркутске.</p>
  </div>
</section>

<section class="section">
  <div class="container">
__CATCARDS__
  </div>
</section>

__FOOTER__
'@
$catalog = $catalog.Replace('__HEAD__', $head).Replace('__HEADER__', $header).Replace('__FOOTER__', $footerAndScripts).Replace('__CATCARDS__', $catCards)
# на странице каталога ссылка "Изделия" ведёт на саму себя — заменим на главную якорь
Set-Content (Join-Path $dir 'index.html') -Value $catalog -Encoding UTF8 -NoNewline

# ---- Sitemap ----
$root = Split-Path -Parent $dir
$urls = @('https://lithos-irk.ru/','https://lithos-irk.ru/uslugi/',
  'https://lithos-irk.ru/materialy/kvarcevyj-aglomerat.html',
  'https://lithos-irk.ru/materialy/akrilovyj-kamen.html',
  'https://lithos-irk.ru/materialy/litevoj-mramor.html')
foreach ($it in $data) { $urls += "https://lithos-irk.ru/uslugi/$($it.slug).html" }
$sm = "<?xml version=`"1.0`" encoding=`"UTF-8`"?>`n<urlset xmlns=`"http://www.sitemaps.org/schemas/sitemap/0.9`">`n"
foreach ($u in $urls) {
  $pr = if ($u -eq 'https://lithos-irk.ru/') { '1.0' } elseif ($u -like '*uslugi/') { '0.9' } else { '0.7' }
  $sm += "  <url><loc>$u</loc><changefreq>monthly</changefreq><priority>$pr</priority></url>`n"
}
$sm += "</urlset>`n"
Set-Content (Join-Path $root 'sitemap.xml') -Value $sm -Encoding UTF8 -NoNewline

"Сгенерировано страниц изделий: $count + каталог + sitemap ($($urls.Count) URL)"
