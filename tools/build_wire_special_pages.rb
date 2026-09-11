#!/usr/bin/env ruby
require 'json'
require 'cgi'

ROOT = File.expand_path('..', __dir__)
DATA = JSON.parse(File.read(File.join(ROOT, 'content/product-category-drafts/wire-special-pages.json')))

CHAPTERS = {
  'motion'=>[['Define the motion envelope','定义运动包络'],['Build the moving cable system','构建运动线缆系统'],['Validate the installed cycle','验证安装循环']],
  'flame'=>[['Name the fire-test question','明确燃烧试验问题'],['Separate material and fire properties','区分材料与火灾性能'],['Release traceable evidence','放行可追溯证据']],
  'voltage'=>[['Define the electrical system','定义电气系统'],['Coordinate construction and accessories','协同结构与附件'],['Inspect the complete installation boundary','检查完整安装边界']],
  'signal'=>[['Preserve the balanced pair','保持平衡线对'],['Complete the shield path','闭合屏蔽路径'],['Prove the configured channel','证明实际配置通道']],
  'material'=>[['Define the material claim','定义材料声明'],['Separate smoke, flame and mechanics','区分烟、阻燃与机械性能'],['Control the exact construction','控制准确结构']],
  'marine'=>[['Map the vessel route','绘制船舶路径'],['Engineer exposed interfaces','设计暴露接口'],['Release project-specific evidence','放行项目特定证据']],
  'medical'=>[['Place the cable inside the equipment boundary','把线缆放入设备边界'],['Coordinate handling and signal integrity','协同操作与信号完整性'],['Preserve risk-control evidence','保持风险控制证据']],
  'measure'=>[['Define the measurand and source','定义被测量与信号源'],['Control the complete measurement path','控制完整测量路径'],['Calibrate the configured system','校准实际配置系统']],
  'outdoor'=>[['Map the exposure profile','绘制环境暴露谱'],['Engineer route and electrical duty','设计路径与电气工况'],['Verify the installed boundary','验证安装边界']]
}.freeze

def h(value)
  CGI.escapeHTML(value.to_s)
end
def pair(value, tag: 'span', klass: nil)
  cls = klass ? " class=\"#{klass}\"" : ''
  "<#{tag}#{cls} data-copy=\"en\">#{h(value['en'])}</#{tag}><#{tag}#{cls} data-copy=\"zh\">#{h(value['zh'])}</#{tag}>"
end

def topic_card(topic, slug, index)
  caption = {
    'en'=>"Context image for #{topic['title']['en'].downcase}; it does not represent a Super Smile test result or certification.",
    'zh'=>"图片用于说明“#{topic['title']['zh']}”的相关场景，不代表超斯迈尔测试结果或认证。"
  }
  <<~HTML
  <article class="ws-topic" data-reveal>
    <figure class="ws-media"><div class="ws-media-frame"><img src="/assets/images/product-categories/stock/#{h(slug)}/#{h(topic['image'])}" alt="#{h(topic['title']['en'])}" loading="lazy"></div><figcaption>#{pair(caption)}</figcaption></figure>
    <div class="ws-copy">#{pair(topic['title'], tag:'h3')}#{pair(topic['copy'], tag:'p')}</div>
  </article>
  HTML
end

def chapter(page, slug, number, chapter_index, topics)
  names = CHAPTERS.fetch(page['variant'])[chapter_index]
  kicker = {
    'en'=>['SYSTEM DEFINITION','CONSTRUCTION + INSTALLATION','EVIDENCE + RELEASE'][chapter_index],
    'zh'=>['系统定义','结构与安装','证据与放行'][chapter_index]
  }
  cards = topics.each_with_index.map { |topic, idx| topic_card(topic, slug, idx) }.join
  klass = %w[ws-foundation ws-engineering ws-evidence][chapter_index]
  <<~HTML
  <section class="ws-chapter #{klass}" id="ws-chapter-#{number}"><div class="ws-chapter-inner">
    <header class="ws-head"><span>#{number}</span><div>#{pair(kicker, tag:'p')}<h2><span data-copy="en">#{h(names[0])}</span><span data-copy="zh">#{h(names[1])}</span></h2></div></header>
    <div class="ws-topic-grid">#{cards}</div>
#{chapter_index == 2 ? evidence(page) : ''}
  </div></section>
  HTML
end

def evidence(page)
  inputs = page['inputs'].each_with_index.map { |input, idx| "<li><b>#{format('%02d',idx+1)}</b><span>#{pair(input)}</span></li>" }.join
  faqs = page['faq'].map { |item| "<details><summary>#{pair(item['q'])}</summary>#{pair(item['a'],tag:'p')}</details>" }.join
  <<~HTML
  <div class="ws-data"><div><h3><span data-copy="en">Engineering inputs</span><span data-copy="zh">工程输入资料</span></h3><ol class="ws-inputs">#{inputs}</ol></div><div class="ws-faq"><h3><span data-copy="en">Common questions</span><span data-copy="zh">常见问题</span></h3>#{faqs}</div></div>
  HTML
end

def render_page(slug, page)
  topics = page['topics']
  groups = topics.length == 4 ? [topics[0,2], topics[2,1], topics[3,1]] : [topics[0,2], topics[2,2], topics[4,1]]
  chapters = groups.each_with_index.map { |group, idx| chapter(page, slug, format('%02d',idx+1), idx, group) }.join
  chapter_names = CHAPTERS.fetch(page['variant'])
  index = chapter_names.each_with_index.map { |names, idx| "<a href=\"#ws-chapter-#{format('%02d',idx+1)}\"><b>#{format('%02d',idx+1)}</b><span data-copy=\"en\">#{h(names[0])}</span><span data-copy=\"zh\">#{h(names[1])}</span></a>" }.join
  desc_en = "Custom #{page['title']['en'].downcase} engineering covering construction, materials, interfaces, installation, inspection and project-specific validation."
  desc_zh = "#{page['title']['zh']}定制技术说明，覆盖结构、材料、接口、安装、检验与项目特定验证。"
  structured = {'@context'=>'https://schema.org','@type'=>'WebPage','name'=>"Custom #{page['title']['en']}",'url'=>"https://supersmile-tech.com/products/#{slug}",'about'=>page['keywords'].split(', ').first(8).map{|x|{'@type'=>'Thing','name'=>x}}}
  <<~HTML
  <!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Custom #{h(page['title']['en'])} | Technical Cable Guide | Super Smile</title><meta name="description" content="#{h(desc_en)}">
  <link rel="stylesheet" href="/assets/css/style.css?v=20260825v3"><link rel="stylesheet" href="/assets/css/industrial-v2.css?v=20260902v57"><link rel="stylesheet" href="/assets/css/wire-special-editorial.css?v=20260912-1"><link rel="icon" href="/favicon.ico" sizes="any"><meta name="theme-color" content="#080b0c"><link rel="canonical" href="https://supersmile-tech.com/products/#{slug}">
  <meta property="og:type" content="website"><meta property="og:url" content="https://supersmile-tech.com/products/#{slug}"><meta property="og:title" content="Custom #{h(page['title']['en'])} | Super Smile"><meta property="og:description" content="#{h(page['subtitle']['en'])}"><meta property="og:image" content="https://supersmile-tech.com/assets/images/product-categories/stock/#{slug}/#{h(page['hero'])}">
  <link rel="alternate" hreflang="en" href="https://supersmile-tech.com/products/#{slug}?lang=en"><link rel="alternate" hreflang="zh-CN" href="https://supersmile-tech.com/products/#{slug}?lang=zh"><link rel="alternate" hreflang="x-default" href="https://supersmile-tech.com/products/#{slug}?lang=en">
  <script type="application/ld+json">#{JSON.generate(structured)}</script><script>window.SS_PRODUCT_CATEGORY=#{JSON.generate({'key'=>page['key'],'image'=>"/assets/images/product-categories/stock/#{slug}/#{page['hero']}"})};</script></head>
  <body class="page-product-category pcc-rich-page wire-special" data-variant="#{h(page['variant'])}" data-key="#{h(page['key'])}" data-title-en="#{h(page['title']['en'])}" data-title-zh="#{h(page['title']['zh'])}" data-desc-en="#{h(desc_en)}" data-desc-zh="#{h(desc_zh)}"><header class="header"><div class="container"><a class="logo" href="/"><img class="logo-img" src="/assets/images/ss-logo223.png" alt="Super Smile"><span class="logo-text"><span class="logo-name">Super<span>Smile</span></span><small class="logo-sub" id="logo-company"></small></span></a><nav class="nav" id="nav-links"></nav><div id="lang-box" style="display:flex;gap:4px"></div><button class="nav-toggle" id="nav-toggle" type="button" aria-label="Open navigation menu" aria-expanded="false"><span class="menu-icon"><span></span><span></span></span></button></div></header>
  <main class="pcc-main"><section class="ws-hero"><img class="ws-hero-image" src="/assets/images/product-categories/stock/#{slug}/#{h(page['hero'])}" alt="#{h(page['title']['en'])}" width="1800" height="1200" fetchpriority="high" style="object-position:#{h(page['heroPosition'])}"><nav class="breadcrumb ws-breadcrumb"><a href="/"><span data-copy="en">Home</span><span data-copy="zh">首页</span></a><span class="crumb-sep"></span><a href="/products"><span data-copy="en">Products</span><span data-copy="zh">产品中心</span></a><span class="crumb-sep"></span><span data-copy="en">Wire &amp; Cable</span><span data-copy="zh">电线电缆</span></nav><div class="ws-hero-copy"><span class="ws-kicker"><span data-copy="en">PRODUCT CATEGORY · TECHNICAL CABLE</span><span data-copy="zh">产品小类 · 技术电缆</span></span><h1>#{pair(page['title'])}</h1><div class="ws-subtitle">#{pair(page['subtitle'])}</div><div class="ws-lead">#{pair(page['lead'])}</div><div class="ws-actions"><a class="btn btn-primary" data-contact-link href="/contact?category=#{h(page['key'])}"><span data-copy="en">Ask About This Product Type</span><span data-copy="zh">咨询这一类产品</span></a><a class="ws-back" href="/products"><span data-copy="en">Back to Products</span><span data-copy="zh">返回产品中心</span></a></div></div></section>
  <div class="ws-page"><section class="ws-opening"><div><span class="ws-opening-label"><span data-copy="en">ENGINEERING OVERVIEW</span><span data-copy="zh">工程概览</span></span><h2>#{pair(page['subtitle'])}</h2></div><div>#{pair(page['intro'],tag:'p')}</div></section><nav class="ws-index">#{index}</nav>#{chapters}<details class="ws-credits"><summary><span data-copy="en">Images and technical scope</span><span data-copy="zh">图片与技术范围说明</span></summary><p><span data-copy="en">Context images explain the material, process, environment or application. They do not represent Super Smile test results or third-party certification.</span><span data-copy="zh">场景图片用于解释材料、工艺、环境或应用，不代表超斯迈尔测试结果或第三方认证。</span></p><a href="/assets/images/product-categories/stock/#{slug}/SOURCES.md"><span data-copy="en">View image source notes</span><span data-copy="zh">查看图片来源说明</span></a></details></div>
  <section class="pcc-closing ws-closing"><div><span><span data-copy="en">WIRE &amp; CABLE</span><span data-copy="zh">电线电缆</span></span><h2><span data-copy="en">Define the duty before releasing the cable.</span><span data-copy="zh">先定义工况，再放行线缆。</span></h2></div><a class="btn btn-primary" data-contact-link href="/contact?category=#{h(page['key'])}"><span data-copy="en">Send Your Requirements</span><span data-copy="zh">发送项目要求</span></a></section></main>
  <footer class="footer"><div class="container"><div><h5>SuperSmile</h5><p id="footer-about"></p></div><div><h5>Contact</h5><div id="f-contact" class="footer-contact"></div></div><div><h5>Links</h5><a href="/">Home</a><a href="/custom">Custom Wiring Harness</a><a href="/products">Products</a><a href="/about">About</a><a href="/contact">Contact</a></div></div><p class="seo-keywords">#{h(page['keywords'])}</p><div class="container bot">© <span id="f-year"></span> <span id="f-company"></span> · All Rights Reserved</div></footer>
  <div class="fab" id="fab"><button class="fab-main" id="fab-main" type="button" aria-label="Contact"><span class="fab-icon"></span><span class="fab-label">Contact</span></button><div class="fab-menu" id="fab-menu"><a class="fab-item email" id="fab-email" href="mailto:sales@supersmile-tech.com">Email</a><button class="fab-item online" id="fab-online" type="button">Online Message</button><a class="fab-item wa" id="fab-wa" href="https://wa.me/447516289817" target="_blank" rel="noopener">WhatsApp</a></div></div><div class="contact-modal" id="contact-modal"><div class="contact-modal-overlay" data-close></div><div class="contact-modal-box" role="dialog" aria-modal="true"><button class="modal-close" type="button" data-close>×</button><h3 id="modal-title">Send Us a Message</h3><form id="modal-form"><div class="field"><label id="modal-label-name">Name</label><input id="modal-name" required></div><div class="field"><label id="modal-label-email">Email</label><input id="modal-email" type="email" required></div><div class="field"><label id="modal-label-message">Message</label><textarea id="modal-message" required></textarea></div><button class="btn btn-primary" type="submit" id="modal-submit">Send Message</button></form></div></div><div class="toast" id="toast"></div><script src="/assets/js/main.js?v=20260911-us-1"></script><script src="/assets/js/wire-special-editorial.js?v=20260912-1"></script></body></html>
  HTML
end

DATA.each { |slug, page| File.write(File.join(ROOT, 'products', "#{slug}.html"), render_page(slug, page)) }
puts "Built #{DATA.length} wire and cable category pages."
