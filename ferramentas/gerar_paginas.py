#!/usr/bin/env python3
"""Gera páginas próprias (/produto/<id>/index.html) para os produtos marcados com
`pagina: true` em produtos.js, e atualiza o sitemap.xml.

Uso (na raiz do repositório):  python3 ferramentas/gerar_paginas.py
Requer node (para ler produtos.js)."""
import html, json, os, re, subprocess, sys, datetime, urllib.parse

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://dlelectronic.com.br"

dados = json.loads(subprocess.check_output(
    ["node", "-e", "global.window={};require(process.argv[1]);"
     "console.log(JSON.stringify({cfg:window.DL_CONFIG,itens:window.DL_PRODUTOS}))",
     os.path.join(RAIZ, "produtos.js")]))
cfg, itens = dados["cfg"], dados["itens"]

idx = open(os.path.join(RAIZ, "index.html"), encoding="utf-8").read()
ver = re.search(r"style\.css\?v=([\w]+)", idx).group(1)

e = lambda s: html.escape(str(s), quote=True)


def brl(v):
    return "R$ " + f"{v:,.0f}".replace(",", ".")


def wa(texto):
    return "https://wa.me/" + cfg["whatsapp"] + "?text=" + urllib.parse.quote(texto)


def pagina(p):
    url = f"{SITE}/produto/{p['id']}/"
    imgs = p.get("imgs") or [p["img"]]
    img_abs = [f"{SITE}/{i}" for i in imgs]
    desc = f"{p['nome']} novo e lacrado. {p['resumo']} Compre pelo Mercado Livre ou direto pelo WhatsApp, com envio para todo o Brasil."
    preco_oferta = p.get("precoDireto") or p.get("preco")

    ld = {
        "@context": "https://schema.org", "@type": "Product",
        "name": p["nome"], "image": img_abs, "description": p.get("aplicacao") or p["resumo"],
        "sku": p["id"].upper(), "mpn": p["id"].upper(),
        "brand": {"@type": "Brand", "name": p["marca"]},
        "offers": {
            "@type": "Offer", "url": url, "priceCurrency": "BRL", "price": f"{preco_oferta:.2f}",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {"@type": "Organization", "name": "DL Electronic Solutions LTDA"},
        },
    }
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Produtos", "item": f"{SITE}/#produtos"},
        {"@type": "ListItem", "position": 2, "name": p["nome"], "item": url}]}

    # galeria
    thumbs = ""
    if len(imgs) > 1:
        thumbs = '<div class="det-thumbs">' + "".join(
            f'<button type="button" class="det-thumb{" is-on" if i == 0 else ""}" aria-label="Foto {i+1}" data-src="/{e(s)}"><img src="/{e(s)}" alt="" loading="lazy"></button>'
            for i, s in enumerate(imgs)) + "</div>"
    nota_foto = f'<p class="note foto-nota">{e(p["fotoNota"])}</p>' if p.get("fotoNota") else ""

    # compra
    if p.get("soDireto"):
        buy = f'''<div class="buy-opt buy-direct"><span class="buy-lbl">Venda direta DL Electronic</span><strong class="buy-price">{brl(p["precoDireto"])}</strong><span class="buy-sub">Pix ou transferência · frete e prazo sob consulta</span>
          <a class="btn btn-wa" href="{e(wa(p.get("waMsg") or f"Olá! Tenho interesse no {p['nome']}."))}" target="_blank" rel="noopener">Solicitar orçamento pelo WhatsApp</a></div>'''
    else:
        buy = f'''<div class="buy-opt"><span class="buy-lbl">No Mercado Livre</span><strong class="buy-price">{brl(p["preco"])}</strong><span class="buy-sub">Em até 12x · compra garantida</span>
          <a class="btn" href="{e(p.get("link") or cfg["loja"])}" target="_blank" rel="noopener">Comprar no Mercado Livre</a></div>
        <div class="buy-opt buy-direct"><span class="buy-lbl">Direto com a DL Electronic</span><strong class="buy-price">{brl(p["precoDireto"])}</strong><span class="buy-sub">Pagamento via Pix · frete a combinar</span>
          <a class="btn btn-wa" href="{e(wa(f"Olá! Quero comprar o produto {p['nome']} por {brl(p['precoDireto'])} (compra direta)."))}" target="_blank" rel="noopener">Comprar pelo WhatsApp</a></div>'''

    tec = ""
    if p.get("aplicacao"):
        tec += f'<section class="det-bloco"><h2 class="det-h">Aplicação</h2><p class="det-aplic">{e(p["aplicacao"])}</p></section>'
    if p.get("ficha"):
        linhas = "".join(f'<tr><th scope="row">{e(a)}</th><td>{e(b)}</td></tr>' for a, b in p["ficha"])
        ds = f'<a class="btn btn-ghost btn-ds" href="/{e(p["datasheet"])}" target="_blank" rel="noopener" download>Baixar datasheet (PDF)</a>' if p.get("datasheet") else ""
        tec += (f'<section class="det-bloco"><h2 class="det-h">Ficha técnica</h2><div class="ficha-wrap"><table class="ficha"><tbody>{linhas}</tbody></table></div>'
                f'<p class="note">{e(p.get("fichaNota") or "Dados conforme a documentação do fabricante. Confirme o código do modelo antes de comprar.")}</p>{ds}</section>')
    nota = f'<div class="det-nota"><h2 class="det-h">Programação</h2><p>{e(p["nota"])}</p></div>' if p.get("nota") else ""

    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(p["nome"])} | DL Electronic</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<link rel="icon" href="/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<meta name="theme-color" content="#ffffff">
<meta property="og:type" content="product">
<meta property="og:title" content="{e(p["nome"])} | DL Electronic">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{img_abs[0]}">
<link rel="stylesheet" href="/style.css?v={ver}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
<script type="application/ld+json">{json.dumps(crumbs, ensure_ascii=False)}</script>
</head>
<body>
<header class="top">
  <div class="wrap top-in">
    <a class="brand" href="/" aria-label="DL Electronic — início"><img src="/img/logo-escuro.png" alt="DL Electronic Hardwares" width="859" height="548"></a>
    <nav class="nav" aria-label="Seções">
      <a href="/#produtos">Produtos</a>
      <a href="/#servicos">Serviços</a>
      <a href="/#como-comprar">Como comprar</a>
      <a href="/#sobre">Sobre</a>
      <a class="btn btn-sm" href="{e(cfg["loja"])}" target="_blank" rel="noopener">Loja no Mercado Livre</a>
    </nav>
  </div>
</header>

<main>
  <section id="detalhe" class="section det" data-pagina="{e(p["id"])}">
    <div class="wrap">
      <a class="back" href="/#produtos">← Todos os produtos</a>
      <div class="det-grid">
        <div class="det-media">
          <div class="det-img{" is-photo" if p.get("imgs") else ""}"><img id="foto" src="/{e(imgs[0])}" alt="{e(p["nome"])}" width="800" height="800"></div>
          {thumbs}{nota_foto}
        </div>
        <div class="det-info">
          <span class="tag">{e(p["marca"])} · {e(p["cat"])}</span>
          <h1 class="det-title">{e(p["nome"])}</h1>
          <p class="det-resumo">{e(p["resumo"])}</p>
          <div class="buy">{buy}</div>
        </div>
      </div>
      <div class="det-tec">{tec}</div>
      {nota}
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-in">
    <img src="/img/logo-escuro.png" alt="DL Electronic" width="859" height="548" class="foot-logo">
    <div>
      <p>DL Electronic Solutions LTDA · CNPJ 66.814.414/0001-62</p>
      <p><a href="{e(cfg["loja"])}" target="_blank" rel="noopener">Loja oficial no Mercado Livre</a><span class="js-wa-foot" hidden> · <a class="js-wa" href="#" target="_blank" rel="noopener">WhatsApp</a></span></p>
    </div>
  </div>
</footer>

<a class="wa-fab js-wa" href="#" target="_blank" rel="noopener" aria-label="Falar no WhatsApp" data-wa-msg="{e("Olá! Vi o " + p["nome"] + " no site da DL Electronic.")}" hidden>
  <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-3.9-.5-5.6-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.6.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.5 4.9 2 .9 2.8.9 3.8.8.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.7-.4z"/></svg>
</a>
<script>document.querySelectorAll(".det-thumb").forEach(function(b){{b.addEventListener("click",function(){{document.getElementById("foto").src=b.dataset.src;document.querySelectorAll(".det-thumb").forEach(function(x){{x.classList.toggle("is-on",x===b)}})}})}});</script>
<script src="/produtos.js?v={ver}"></script>
<script src="/app.js?v={ver}"></script>
</body>
</html>
'''


hoje = datetime.date.today().isoformat()
urls = [(SITE + "/", hoje)]
for p in itens:
    if not p.get("pagina"):
        continue
    d = os.path.join(RAIZ, "produto", p["id"])
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(pagina(p))
    urls.append((f"{SITE}/produto/{p['id']}/", hoje))
    print("página:", f"/produto/{p['id']}/")

sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "".join(
    f"<url><loc>{u}</loc><lastmod>{m}</lastmod></url>" for u, m in urls) + "</urlset>\n"
open(os.path.join(RAIZ, "sitemap.xml"), "w", encoding="utf-8").write(sm)
print("sitemap:", len(urls), "URLs")
