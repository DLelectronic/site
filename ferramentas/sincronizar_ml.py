#!/usr/bin/env python3
"""Sincroniza preço e disponibilidade do site com os anúncios do Mercado Livre.

Para cada produto de produtos.js com link do ML (item_id MLB...), lê o anúncio pela
API oficial do ML e:
  - atualiza `preco` (valor no Mercado Livre);
  - marca `esgotado: true` quando o anúncio está sem estoque, pausado ou encerrado,
    e tira a marca quando volta a ter estoque.
`precoDireto` (venda pelo WhatsApp) continua manual.

Também grava ml-status.json (disponível + preço por produto), lido pelo script do
Google Ads para pausar/reativar os grupos de anúncios.

Se algo mudou, troca a versão (?v=) dos arquivos nas páginas e regenera as páginas
de produto (gerar_paginas.py).

Uso:
  Variáveis ML_CLIENT_ID, ML_CLIENT_SECRET, ML_REFRESH_TOKEN (GitHub Actions).
  O novo refresh token (o ML troca a cada uso) é gravado no arquivo indicado em
  ML_NOVO_TOKEN_ARQ, para o workflow salvar no segredo.
  Teste sem API:  python3 ferramentas/sincronizar_ml.py --dados exemplo.json
    (exemplo.json = lista no formato da resposta de /items?ids=...)
"""
import datetime, json, os, re, subprocess, sys, urllib.parse, urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.mercadolibre.com"
PRODUTOS = os.path.join(RAIZ, "produtos.js")
STATUS = os.path.join(RAIZ, "ml-status.json")
LIMITE_VARIACAO = 0.5  # ignora preço que mude mais de 50% de uma vez (provável erro)


def ler_produtos():
    out = subprocess.check_output(
        ["node", "-e", "global.window={};require(process.argv[1]);"
         "console.log(JSON.stringify(window.DL_PRODUTOS))", PRODUTOS])
    return json.loads(out)


def item_id(link):
    if not link or "mercadolivre" not in link:
        return None
    m = re.search(r"item_id(?:%3A|:)(MLB\d+)", link) or re.search(r"/(MLB)-?(\d+)", link)
    if not m:
        return None
    return m.group(1) if m.lastindex == 1 else m.group(1) + m.group(2)


def pedir(url, dados=None, token=None):
    req = urllib.request.Request(url, data=dados)
    req.add_header("Accept", "application/json")
    if dados is not None:
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def token_acesso():
    corpo = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "client_id": os.environ["ML_CLIENT_ID"].strip(),
        "client_secret": os.environ["ML_CLIENT_SECRET"].strip(),
        "refresh_token": os.environ["ML_REFRESH_TOKEN"].strip(),
    }).encode()
    r = pedir(API + "/oauth/token", corpo)
    novo = r.get("refresh_token")
    arq = os.environ.get("ML_NOVO_TOKEN_ARQ")
    if novo and arq:
        with open(arq, "w") as f:
            f.write(novo)
    return r["access_token"]


def ler_anuncios(ids):
    token = token_acesso()
    res = []
    for i in range(0, len(ids), 20):
        q = urllib.parse.urlencode({"ids": ",".join(ids[i:i + 20]),
                                    "attributes": "id,price,available_quantity,status"})
        res += pedir(f"{API}/items?{q}", token=token)
    return res


def bloco(texto, pid):
    """Início e fim do objeto do produto `pid` dentro de produtos.js."""
    m = re.search(r'\{\s*id:\s*"' + re.escape(pid) + r'"', texto)
    if not m:
        return None
    prox = re.search(r'\n\s*\{\s*id:\s*"', texto[m.end():])
    fim = m.end() + prox.start() if prox else len(texto)
    return m.start(), fim


def aplicar(texto, pid, preco, esgotado):
    b = bloco(texto, pid)
    if not b:
        return texto
    ini, fim = b
    trecho = texto[ini:fim]
    if preco is not None:
        trecho = re.sub(r"(?<![A-Za-z])preco:\s*[\d.]+", f"preco: {preco}", trecho, count=1)
    tem = re.search(r"esgotado:\s*true,\s*", trecho)
    if esgotado and not tem:
        trecho = re.sub(r"(?<![A-Za-z])(preco:)", r"esgotado: true, \1", trecho, count=1)
    elif not esgotado and tem:
        trecho = trecho[:tem.start()] + trecho[tem.end():]
    return texto[:ini] + trecho + texto[fim:]


def trocar_versao():
    ver = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d%H%M")
    for arq in ("index.html", os.path.join("politicas", "index.html")):
        p = os.path.join(RAIZ, arq)
        if os.path.exists(p):
            s = open(p, encoding="utf-8").read()
            s = re.sub(r"(style\.css|app\.js|produtos\.js)\?v=[0-9a-z]+", rf"\1?v={ver}", s)
            open(p, "w", encoding="utf-8").write(s)


def main():
    produtos = ler_produtos()
    alvo = {}
    for p in produtos:
        iid = item_id(p.get("link"))
        if iid and not p.get("soDireto"):
            alvo[iid] = p
    if not alvo:
        print("Nenhum produto com anúncio do ML.")
        return

    if "--dados" in sys.argv:
        anuncios = json.load(open(sys.argv[sys.argv.index("--dados") + 1]))
    else:
        anuncios = ler_anuncios(sorted(alvo))

    texto = open(PRODUTOS, encoding="utf-8").read()
    original = texto
    status = {}
    for a in anuncios:
        corpo = a.get("body") or {}
        iid = corpo.get("id")
        if a.get("code") != 200 or iid not in alvo:
            print(f"aviso: anúncio {iid or '?'} não lido (código {a.get('code')})")
            continue
        p = alvo[iid]
        disp = corpo.get("status") == "active" and (corpo.get("available_quantity") or 0) > 0
        preco = corpo.get("price")
        if preco is not None:
            preco = int(round(preco)) if abs(preco - round(preco)) < 0.005 else round(preco, 2)
            atual = p.get("preco") or 0
            if atual and abs(preco - atual) / atual > LIMITE_VARIACAO:
                print(f"aviso: {p['id']}: preço do ML {preco} muito diferente de {atual}; mantido")
                preco = None
        texto = aplicar(texto, p["id"], preco, not disp)
        status[p["id"]] = {"anuncio": iid, "disponivel": disp,
                           "preco": preco if preco is not None else p.get("preco")}
        mud = []
        if preco is not None and preco != p.get("preco"):
            mud.append(f"preço {p.get('preco')} → {preco}")
        if bool(p.get("esgotado")) != (not disp):
            mud.append("esgotado" if not disp else "voltou ao estoque")
        if mud:
            print(f"{p['id']}: " + ", ".join(mud))

    antigo = {}
    if os.path.exists(STATUS):
        antigo = json.load(open(STATUS, encoding="utf-8")).get("itens", {})
    if status != antigo:
        json.dump({"atualizado": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                   "itens": status}, open(STATUS, "w", encoding="utf-8"),
                  ensure_ascii=False, indent=1)
        open(STATUS, "a").write("\n")

    if texto != original:
        open(PRODUTOS, "w", encoding="utf-8").write(texto)
        trocar_versao()
        subprocess.check_call([sys.executable, os.path.join(RAIZ, "ferramentas", "gerar_paginas.py")])
        print("produtos.js atualizado.")
    else:
        print("Sem mudanças de preço ou estoque.")


if __name__ == "__main__":
    main()
