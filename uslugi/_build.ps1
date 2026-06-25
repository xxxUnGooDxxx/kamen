# Генератор страниц изделий из uslugi/_data.json
$ErrorActionPreference = 'Stop'
$dir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$data = Get-Content (Join-Path $dir '_data.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$faq  = Get-Content (Join-Path $dir '_faq.json')  -Raw -Encoding UTF8 | ConvertFrom-Json
$imgs = Get-Content (Join-Path $dir '_images.json') -Raw -Encoding UTF8 | ConvertFrom-Json

function Pexels([string]$id, [int]$w, [int]$h) {
  if (-not $id) { return $null }
  return "https://images.pexels.com/photos/$id/pexels-photo-$id.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=$w&h=$h"
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
<script>(function(){try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();</script>
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
'@
$head = $head.Replace('__FAV__', $favicon)

$header = @'
<header class="header">
  <div class="container header__inner">
    <a href="../index.html" class="logo"><span class="logo__mark">К</span><span>КАМЕНЪ<small>Иркутск</small></span></a>
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
    $cid = PropVal $imgs $it.slug
    $csrc = if ($cid) { Pexels $cid 800 600 } else { "https://loremflickr.com/800/600/$($it.kw)" }
    $catCards += "      <a class=`"g-tile`" href=`"$($it.slug).html`"><img src=`"$csrc`" alt=`"$($it.h1)`" onerror=`"imgFB(this)`" data-kw=`"$($it.kw)`" data-w=`"800`" data-h=`"600`"><span class=`"g-tile__cap`"><b>$($it.h1)</b></span></a>`n"
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
</head>
<body>
__HEADER__
<section class="page-hero">
  <div class="page-hero__bg"><img src="https://images.pexels.com/photos/10099318/pexels-photo-10099318.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1600&h=900" alt="Изделия из искусственного камня" onerror="imgFB(this)" data-kw="kitchen,marble,interior" data-w="1600" data-h="900"></div>
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
