#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_aihot_daily.py — 从 AI HOT 日报 API 原始响应生成单文件 HTML 看板。

用法:
    python scripts/build_aihot_daily.py <raw.json> [output_dir]

raw.json 是 https://aihot.virxact.com/api/v1/dailies/latest
（或 /api/v1/dailies/{YYYY-MM-DD}）的原始 JSON 响应。

产出:
    output/aihot-daily-<date>.html   纯 HTML/CSS/JS 单文件，样式脚本内联，无外部资源
"""
import html
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

BJT = timezone(timedelta(hours=8))
WEEKDAYS = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]

# 五个固定版块：(label, slug, icon, nav短名)，label 需与 API 返回的 section.label 一致
SECTIONS = [
    ("模型发布/更新", "models", "cpu", "模型"),
    ("产品发布/更新", "products", "rocket", "产品"),
    ("行业动态", "industry", "trend", "行业"),
    ("论文研究", "papers", "doc", "论文"),
    ("技巧与观点", "tips", "bulb", "技巧观点"),
]

ICONS = {
    "cpu": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
    "rocket": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    "trend": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    "doc": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
    "bulb": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4.9 11.9c.6.6 1.1 1.4 1.3 2.2l.3 1.9h6.6l.3-1.9c.2-.8.7-1.6 1.3-2.2A7 7 0 0 0 12 2z"/></svg>',
    "ext": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7"/><path d="M9 7h8v8"/></svg>',
    "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    "up": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>',
    "link": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
}

CSS = """
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#FFF9F2;--card:#FFFFFF;--elev:#FFF4E6;
  --ink:#1A1A1A;--ink2:#5C5C5C;--ink3:#8A8A8A;
  --accent:#FF6B35;--accent2:#F7B801;--accent-light:#FFE4D6;
  --grad:linear-gradient(135deg,#FF6B35 0%,#F7B801 100%);
  --grad-soft:linear-gradient(135deg,#FFE4D6 0%,#FFF4D6 100%);
  --border:#F0E4D4;--border-hover:#FFB89A;
  --r:14px;--r-sm:8px;--r-lg:20px;
  --shadow:0 4px 20px rgba(255,107,53,.08);
  --shadow-hover:0 10px 30px rgba(255,107,53,.16);
  --font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue","PingFang SC","Microsoft YaHei",sans-serif;
  --mono:"SF Mono","Fira Code",Menlo,Consolas,monospace;
  --t:.25s cubic-bezier(.4,0,.2,1);
}
html{scroll-behavior:smooth}
body{font-family:var(--font);background:var(--bg);color:var(--ink);line-height:1.65;overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.wrap{max-width:1100px;margin:0 auto;padding:0 24px}

/* ---- 顶部锚点导航 ---- */
.topnav{position:sticky;top:0;z-index:60;background:rgba(255,249,242,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
.topnav-inner{max-width:1100px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;gap:20px}
.brand{font-weight:800;font-size:.95rem;display:flex;align-items:center;gap:9px;white-space:nowrap;letter-spacing:-.2px}
.brand .dot{width:10px;height:10px;border-radius:50%;background:var(--grad);box-shadow:0 0 0 3px var(--accent-light);animation:pulse 2.4s ease-in-out infinite;flex-shrink:0}
@keyframes pulse{0%,100%{box-shadow:0 0 0 3px var(--accent-light)}50%{box-shadow:0 0 0 7px rgba(255,107,53,.12)}}
.nav-links{display:flex;gap:4px;flex:1;overflow-x:auto;scrollbar-width:none}
.nav-links::-webkit-scrollbar{display:none}
.nav-links a{font-size:.85rem;color:var(--ink2);padding:6px 13px;border-radius:999px;white-space:nowrap;transition:var(--t)}
.nav-links a:hover{background:var(--accent-light);color:var(--accent)}
.nav-links a.active{background:var(--accent-light);color:var(--accent);font-weight:600}
.nav-date{font-size:.78rem;color:var(--ink3);white-space:nowrap;font-family:var(--mono)}

/* ---- Hero ---- */
.hero{padding:72px 24px 52px;text-align:center;background:var(--grad-soft);position:relative;overflow:hidden}
.hero::before{content:"";position:absolute;top:-110px;right:-110px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(255,107,53,.16) 0%,transparent 70%)}
.hero::after{content:"";position:absolute;bottom:-90px;left:-90px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(247,184,1,.2) 0%,transparent 70%)}
.hero-inner{max-width:920px;margin:0 auto;position:relative;z-index:1}
.date-badge{display:inline-flex;align-items:center;gap:9px;padding:6px 16px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-size:.85rem;color:var(--ink2);margin-bottom:22px;box-shadow:var(--shadow)}
.date-badge .live{width:8px;height:8px;border-radius:50%;background:#22C55E;animation:live 1.8s ease-out infinite}
@keyframes live{0%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}100%{box-shadow:0 0 0 9px rgba(34,197,94,0)}}
.hero h1{font-size:clamp(2.1rem,5.2vw,3.4rem);font-weight:800;letter-spacing:-1px;line-height:1.18;margin-bottom:14px}
.hero h1 .accent{background:var(--grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.hero-tagline{font-size:clamp(.95rem,1.5vw,1.1rem);color:var(--ink2);max-width:640px;margin:0 auto 38px}
.hero-tagline strong{color:var(--accent);font-weight:700}

/* Hero 统计卡 */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(126px,1fr));gap:12px;max-width:820px;margin:0 auto}
.stat{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:16px 10px;text-align:center;box-shadow:var(--shadow);transition:var(--t);display:block}
a.stat:hover{transform:translateY(-3px);box-shadow:var(--shadow-hover);border-color:var(--border-hover)}
.stat-total{background:var(--grad);border-color:transparent;color:#fff}
.stat-total .stat-num{-webkit-text-fill-color:#fff;background:none;font-size:2.3rem}
.stat-total .stat-label{color:rgba(255,255,255,.92)}
.stat-num{font-size:2.1rem;font-weight:800;font-family:var(--mono);line-height:1.1;background:var(--grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.stat-label{font-size:.74rem;color:var(--ink3);margin-top:6px;letter-spacing:.5px}
.coverage{display:inline-flex;align-items:center;gap:8px;margin-top:22px;padding:7px 16px;border-radius:999px;background:rgba(255,255,255,.75);border:1px solid var(--border);font-size:.8rem;color:var(--ink2)}
.coverage svg{width:14px;height:14px;color:var(--accent);flex-shrink:0}

/* ---- 版块 ---- */
.section{padding:56px 0 14px;scroll-margin-top:70px}
.section-head{display:flex;align-items:center;gap:13px;margin-bottom:24px;padding-bottom:14px;border-bottom:2px dashed var(--border)}
.section-head .icon{width:36px;height:36px;border-radius:10px;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 12px rgba(255,107,53,.28)}
.section-head .icon svg{width:18px;height:18px}
.section-head h2{font-size:1.4rem;font-weight:700;letter-spacing:-.3px}
.section-head .count{margin-left:auto;font-size:.78rem;font-family:var(--mono);background:var(--accent-light);color:var(--accent);padding:3px 11px;border-radius:999px;flex-shrink:0}

/* ---- 卡片网格 ---- */
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r-lg);padding:22px;box-shadow:var(--shadow);transition:var(--t);display:flex;flex-direction:column;position:relative;overflow:hidden}
.card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--grad);opacity:0;transition:var(--t)}
.card:hover{transform:translateY(-4px);box-shadow:var(--shadow-hover);border-color:var(--border-hover)}
.card:hover::before{opacity:1}
.card-top{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.card-num{font-family:var(--mono);font-size:1.35rem;font-weight:800;background:var(--grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
.card-source{margin-left:auto;display:inline-flex;align-items:center;gap:6px;max-width:62%;padding:3px 11px;border-radius:999px;background:var(--elev);border:1px solid var(--border);font-size:.72rem;color:var(--ink2)}
.card-source .s-dot{width:6px;height:6px;border-radius:50%;background:var(--grad);flex-shrink:0}
.card-source span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.card-title{font-size:1.02rem;font-weight:700;line-height:1.5;margin-bottom:10px;letter-spacing:-.2px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.card-summary{font-size:.86rem;color:var(--ink2);line-height:1.75;margin-bottom:16px}
.card-link{margin-top:auto;display:inline-flex;align-items:center;gap:6px;font-size:.83rem;font-weight:600;color:var(--accent);transition:var(--t);align-self:flex-start}
.card-link svg{width:13px;height:13px;transition:var(--t)}
.card-link:hover{color:var(--accent);filter:brightness(1.08)}
.card-link:hover svg{transform:translate(2px,-2px)}

/* ---- 页脚 ---- */
footer{margin-top:64px;padding:34px 24px 40px;text-align:center;background:var(--grad-soft);border-top:1px solid var(--border)}
.footer-stats{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;font-size:.88rem;color:var(--ink2)}
.footer-stats strong{color:var(--accent);font-family:var(--mono);font-size:1.05rem}
.footer-stats .sep{color:var(--ink3)}
.footer-source{margin-top:10px;font-size:.8rem;color:var(--ink3)}
.footer-source a{color:var(--accent);font-weight:600;border-bottom:1px dashed var(--border-hover)}
.footer-source a:hover{border-bottom-style:solid}

/* ---- 返回顶部 ---- */
.to-top{position:fixed;right:22px;bottom:22px;z-index:70;width:46px;height:46px;border-radius:50%;border:0;background:var(--grad);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(255,107,53,.35);cursor:pointer;opacity:0;pointer-events:none;transform:translateY(12px);transition:var(--t)}
.to-top.show{opacity:1;pointer-events:auto;transform:none}
.to-top svg{width:18px;height:18px}
.to-top:hover{transform:translateY(-2px)}

/* ---- 渐入动画（仅在 JS 可用时） ---- */
.js-ready .reveal{opacity:0;transform:translateY(16px);transition:opacity .55s ease,transform .55s ease}
.js-ready .reveal.in{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .js-ready .reveal{opacity:1;transform:none;transition:none}
  .brand .dot,.date-badge .live{animation:none}
}
@media (max-width:640px){
  .hero{padding:52px 20px 40px}
  .cards{grid-template-columns:1fr}
  .nav-date{display:none}
  .section-head h2{font-size:1.2rem}
}
"""

JS = """
(function(){
  // 渐入
  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var ro=new IntersectionObserver(function(es){
      es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target);}});
    },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
    reveals.forEach(function(el){ro.observe(el);});

    // 锚点高亮
    var links=document.querySelectorAll('.nav-links a');
    var map={};
    links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
    var so=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          links.forEach(function(a){a.classList.remove('active');});
          var a=map[e.target.id];if(a)a.classList.add('active');
        }
      });
    },{rootMargin:'-25% 0px -65% 0px'});
    document.querySelectorAll('.section').forEach(function(s){so.observe(s);});
  }else{
    reveals.forEach(function(el){el.classList.add('in');});
  }

  // 返回顶部
  var btn=document.getElementById('toTop');
  window.addEventListener('scroll',function(){
    btn.classList.toggle('show',window.scrollY>560);
  },{passive:true});
  btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
})();
"""


def esc(s):
    return html.escape(s or "", quote=True)


def cut_summary(text, limit=60):
    """截断到 ≤60 字：优先在句末收尾，否则硬截断加省略号。"""
    text = (text or "").strip().replace("\n", " ")
    if len(text) <= limit:
        return text
    head = text[:limit]
    for i in range(len(head) - 1, 29, -1):
        if head[i - 1] in "。！？；…":
            return head[:i]
    return head[:58] + "…"


def hm(dt):
    return f"{dt.month}月{dt.day}日 {dt.hour:02d}:{dt.minute:02d}"


def to_bjt(iso):
    if not iso:
        return None
    return datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(BJT)


def build(raw_path, out_dir):
    raw = json.loads(Path(raw_path).read_text(encoding="utf-8"))
    r = raw["report"]
    date = r["date"]
    d0 = datetime.fromisoformat(date)
    weekday = WEEKDAYS[d0.weekday()]

    gen = to_bjt(r.get("generatedAt"))
    ws = to_bjt(r.get("windowStart"))
    we = to_bjt(r.get("windowEnd"))
    daily_url = (r.get("links") or {}).get("aihot") or (r.get("attribution") or {}).get("url")
    attr_name = (r.get("attribution") or {}).get("name") or "AIHOT"

    # 按固定版块顺序整理，全局连续编号
    by_label = {s.get("label"): (s.get("items") or []) for s in r.get("sections") or []}
    sections, no, total = [], 0, 0
    for label, slug, icon, nav_label in SECTIONS:
        items = by_label.get(label, [])
        cards = []
        for it in items:
            no += 1
            link = (it.get("links") or {})
            href = link.get("original") or link.get("aihot") or ""
            cards.append(f"""<article class="card reveal">
      <div class="card-top">
        <span class="card-num">{no:02d}</span>
        <span class="card-source"><span class="s-dot"></span><span title="{esc(it.get('source',{}).get('name'))}">{esc(it.get('source',{}).get('name'))}</span></span>
      </div>
      <h3 class="card-title">{esc(it.get('title'))}</h3>
      <p class="card-summary">{esc(cut_summary(it.get('summary')))}</p>
      <a class="card-link" href="{esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="阅读原文：{esc(it.get('title'))}">阅读原文 {ICONS['ext']}</a>
    </article>""")
        total += len(items)
        sections.append((label, slug, icon, len(items), "\n    ".join(cards)))

    nav = "\n      ".join(
        f'<a href="#{slug}">{esc(nav_label)}</a>'
        for label, slug, _, nav_label in SECTIONS
    )

    def stat_html(label, n, href=None, total_card=False):
        cls = "stat stat-total" if total_card else "stat"
        if href:
            return f'<a class="{cls}" href="{href}"><span class="stat-num">{n}</span><span class="stat-label">{esc(label)}</span></a>'
        return f'<div class="{cls}"><span class="stat-num">{n}</span><span class="stat-label">{esc(label)}</span></div>'

    stats = [stat_html("总条数", total, total_card=True)]
    for label, slug, icon, n, _ in sections:
        stats.append(stat_html(label, n, href=f"#{slug}"))
    stats_html = "\n      ".join(stats)

    sec_html = []
    for label, slug, icon, n, cards in sections:
        sec_html.append(f"""<section class="section wrap" id="{slug}">
    <div class="section-head reveal">
      <span class="icon">{ICONS[icon]}</span>
      <h2>{esc(label)}</h2>
      <span class="count">{n} 条</span>
    </div>
    <div class="cards">
    {cards}
    </div>
  </section>""")
    sections_html = "\n".join(sec_html)

    page = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI HOT 日报 · {d0.year}年{d0.month}月{d0.day}日</title>
<meta name="description" content="AI HOT 日报 · {d0.year}年{d0.month}月{d0.day}日 · 共{total}条精选 AI 快讯，覆盖模型、产品、行业、论文与技巧观点五大版块。">
<script>document.documentElement.classList.add('js-ready');</script>
<style>{CSS}</style>
</head>
<body>

<nav class="topnav">
  <div class="topnav-inner">
    <span class="brand"><span class="dot"></span>AI HOT 日报</span>
    <div class="nav-links">
      {nav}
    </div>
    <span class="nav-date">{d0.month}月{d0.day}日</span>
  </div>
</nav>

<header class="hero">
  <div class="hero-inner">
    <span class="date-badge"><span class="live"></span>{d0.year}年{d0.month}月{d0.day}日 · {weekday}</span>
    <h1>今日 AI 动向<br><span class="accent">五分钟看完</span></h1>
    <p class="hero-tagline">本期精选 <strong>{total} 条</strong>值得关注的变化：模型发布 <strong>{dict((l, n) for l, _, _, n, _ in sections)['模型发布/更新']}</strong> 条、产品更新 <strong>{dict((l, n) for l, _, _, n, _ in sections)['产品发布/更新']}</strong> 条、行业动态 <strong>{dict((l, n) for l, _, _, n, _ in sections)['行业动态']}</strong> 条、论文研究 <strong>{dict((l, n) for l, _, _, n, _ in sections)['论文研究']}</strong> 条、技巧与观点 <strong>{dict((l, n) for l, _, _, n, _ in sections)['技巧与观点']}</strong> 条。</p>
    <div class="stats">
      {stats_html}
    </div>
    <span class="coverage">{ICONS['clock']}覆盖 {hm(ws)} — {hm(we)}（北京时间） · 生成于 {hm(gen)}</span>
  </div>
</header>

<main>
  {sections_html}
</main>

<footer>
  <div class="footer-stats">
    <span>共 <strong>{total}</strong> 条</span><span class="sep">·</span>
    <span>5 大版块</span><span class="sep">·</span>
    <span>{d0.year}年{d0.month}月{d0.day}日（北京时间）</span>
  </div>
  <div class="footer-source">数据来自 {esc(attr_name)} · <a href="{esc(daily_url)}" target="_blank" rel="noopener noreferrer">aihot.virxact.com/daily/{date}</a>，原文版权归各来源作者所有</div>
</footer>

<button class="to-top" id="toTop" aria-label="返回顶部">{ICONS['up']}</button>
<script>{JS}</script>
</body>
</html>
"""

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"aihot-daily-{date}.html"
    out.write_text(page, encoding="utf-8")
    print(f"OK: {out}  total={total}  sections=" + ",".join(f"{slug}:{n}" for _, slug, _, n, _ in sections))
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    raw_path = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "output"
    build(raw_path, out_dir)
