(function () {
  var cfg = window.DL_CONFIG || {};
  var itens = window.DL_PRODUTOS || [];
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  var grid = document.getElementById("grid");
  var home = document.querySelectorAll("[data-home]");
  var det = document.getElementById("detalhe");

  /* ---------- contador de visitas (GoatCounter, sem cookies) ---------- */
  var gcFila = [];
  function conta(path, title, evento) {
    if (!cfg.goatcounter) return;
    var d = { path: path, title: title || path, event: !!evento };
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count(d);
    else gcFila.push(d);
  }
  if (cfg.goatcounter) {
    window.goatcounter = { no_onload: true };
    var gs = document.createElement("script");
    gs.async = true; gs.src = "https://gc.zgo.at/count.js";
    gs.setAttribute("data-goatcounter", "https://" + cfg.goatcounter + ".goatcounter.com/count");
    gs.onload = function () { gcFila.splice(0).forEach(function (d) { window.goatcounter.count(d); }); };
    document.head.appendChild(gs);
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a"); if (!a) return;
      var pid = det.hidden ? "" : (det.dataset.pid || "");
      if (/wa\.me/.test(a.href)) conta("clique-whatsapp/" + (pid || "geral"), "WhatsApp" + (pid ? " – " + pid : ""), true);
      else if (/mercadolivre/.test(a.href)) conta("clique-ml/" + (pid || "loja"), "Mercado Livre" + (pid ? " – " + pid : ""), true);
    });
  }

  function waLink(texto) {
    return "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(texto);
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  /* ---------- lista ---------- */
  function card(p) {
    var a = el("a", "card");
    a.href = "#p-" + p.id;
    a.dataset.cat = p.cat;
    var fig = el("div", "card-img" + (p.imgs ? " is-photo" : ""));
    var img = el("img"); img.src = p.img; img.alt = p.nome; img.loading = "lazy"; img.width = 400; img.height = 400;
    fig.appendChild(img);
    var body = el("div", "card-body");
    body.append(
      el("span", "tag", p.marca + " · " + p.cat),
      el("h3", null, p.nome),
      el("p", "resumo", p.resumo)
    );
    if (p.soDireto) {
      var pd = el("p", "preco", brl.format(p.precoDireto));
      pd.appendChild(el("span", "preco-tag", " venda direta"));
      body.appendChild(pd);
      body.appendChild(el("p", "preco-wa", "Orçamento e pagamento pelo WhatsApp"));
    } else {
    var preco = el("p", "preco", brl.format(p.preco));
    preco.appendChild(el("span", "preco-tag", " no Mercado Livre"));
    body.appendChild(preco);
    }
    if (p.precoDireto && !p.soDireto) {
      var dir = el("p", "preco-wa");
      dir.append(el("strong", null, brl.format(p.precoDireto)), el("span", null, " no WhatsApp · Pix"));
      body.appendChild(dir);
    }
    body.appendChild(el("span", "card-link", "Ver detalhes →"));
    a.append(fig, body);
    return a;
  }
  itens.forEach(function (p) { grid.appendChild(card(p)); });

  document.querySelectorAll(".chip").forEach(function (b) {
    b.addEventListener("click", function () {
      var cat = b.dataset.cat;
      document.querySelectorAll(".chip").forEach(function (c) {
        var on = c === b; c.classList.toggle("is-on", on); c.setAttribute("aria-selected", String(on));
      });
      grid.querySelectorAll(".card").forEach(function (c) {
        c.hidden = !(cat === "todos" || c.dataset.cat === cat);
      });
    });
  });

  /* ---------- detalhe ---------- */
  function renderDetalhe(p) {
    det.replaceChildren();
    var wrap = el("div", "wrap");
    var back = el("a", "back", "← Todos os produtos"); back.href = "#produtos";
    var grid2 = el("div", "det-grid");

    var fig = el("div", "det-media");
    var frame = el("div", "det-img" + (p.imgs ? " is-photo" : ""));
    var img = el("img"); img.src = p.img; img.alt = p.nome; img.width = 800; img.height = 800;
    frame.appendChild(img); fig.appendChild(frame);
    if (p.imgs && p.imgs.length > 1) {
      var th = el("div", "det-thumbs");
      p.imgs.forEach(function (src, i) {
        var b = el("button", "det-thumb" + (i === 0 ? " is-on" : ""));
        b.type = "button"; b.setAttribute("aria-label", "Foto " + (i + 1));
        var ti = el("img"); ti.src = src; ti.alt = ""; ti.loading = "lazy"; b.appendChild(ti);
        b.addEventListener("click", function () {
          img.src = src; th.querySelectorAll(".det-thumb").forEach(function (x) { x.classList.toggle("is-on", x === b); });
        });
        th.appendChild(b);
      });
      fig.appendChild(th);
    }
    if (p.fotoNota) fig.appendChild(el("p", "note foto-nota", p.fotoNota));

    var info = el("div", "det-info");
    info.append(el("span", "tag", p.marca + " · " + p.cat), el("h1", "det-title", p.nome), el("p", "det-resumo", p.resumo));

    var buy = el("div", "buy");
    if (p.soDireto) {
      var so = el("div", "buy-opt buy-direct");
      so.append(el("span", "buy-lbl", "Venda direta DL Electronic"), el("strong", "buy-price", brl.format(p.precoDireto)),
        el("span", "buy-sub", "Pix ou transferência · frete e prazo sob consulta"));
      var w2 = el("a", "btn btn-wa", "Solicitar orçamento pelo WhatsApp");
      w2.href = waLink(p.waMsg || ("Olá! Tenho interesse no " + p.nome + "."));
      w2.target = "_blank"; w2.rel = "noopener"; so.appendChild(w2);
      buy.appendChild(so); info.appendChild(buy);
    } else {
    // Mercado Livre
    var ml = el("div", "buy-opt");
    ml.append(el("span", "buy-lbl", "No Mercado Livre"), el("strong", "buy-price", brl.format(p.preco)),
      el("span", "buy-sub", "Em até 12x · compra garantida"));
    var mlBtn = el("a", "btn", "Comprar no Mercado Livre");
    mlBtn.href = p.link || cfg.loja; mlBtn.target = "_blank"; mlBtn.rel = "noopener";
    ml.appendChild(mlBtn);
    // Direto
    var dir = el("div", "buy-opt buy-direct");
    dir.append(el("span", "buy-lbl", "Direto com a DL Electronic"), el("strong", "buy-price", brl.format(p.precoDireto)),
      el("span", "buy-sub", "Pagamento via Pix · frete a combinar"));
    if (cfg.whatsapp) {
      var wa = el("a", "btn btn-wa", "Comprar pelo WhatsApp");
      wa.href = waLink("Olá! Quero comprar o produto " + p.nome + " por " + brl.format(p.precoDireto) + " (compra direta).");
      wa.target = "_blank"; wa.rel = "noopener";
      dir.appendChild(wa);
    } else {
      var off = el("span", "btn btn-off", "WhatsApp em breve");
      off.setAttribute("aria-disabled", "true");
      dir.appendChild(off);
    }
    buy.append(ml, dir);
    info.appendChild(buy);
    }

    if (p.software) {
      var sw = p.software, sb = el("div", "soft-box");
      var top = el("div", "soft-top");
      top.append(el("span", "soft-marca", sw.marca), el("span", "soft-sep", "·"), el("span", "soft-lbl", "Software de configuração"));
      var nm = el("p", "soft-nome"); nm.append(el("strong", null, sw.nome), el("span", "soft-free", sw.tag || "gratuito"));
      sb.append(top, nm, el("p", "soft-desc", sw.desc));
      var sl = el("a", "btn btn-ghost soft-btn", "Baixar o " + sw.nome + " no site da " + sw.fab + " →");
      sl.href = sw.link; sl.target = "_blank"; sl.rel = "noopener";
      sb.appendChild(sl);
      if (sw.dica) sb.appendChild(el("p", "note soft-dica", sw.dica));
      info.appendChild(sb);
    }

    grid2.append(fig, info);
    wrap.append(back, grid2);

    var tec = el("div", "det-tec");
    if (p.aplicacao) {
      var ap = el("section", "det-bloco");
      ap.append(el("h2", "det-h", "Aplicação"), el("p", "det-aplic", p.aplicacao));
      tec.appendChild(ap);
    }
    if (p.componentes) {
      var cp = el("section", "det-bloco det-comp");
      cp.appendChild(el("h2", "det-h", "Componentes"));
      p.componentes.forEach(function (g) {
        var gr = el("div", "comp-grupo");
        gr.appendChild(el("h3", "comp-h", g[0]));
        var ul = el("ul", "comp-lista");
        g[1].forEach(function (t) { ul.appendChild(el("li", null, t)); });
        gr.appendChild(ul); cp.appendChild(gr);
      });
      tec.appendChild(cp);
    }
    if (p.ficha && p.ficha.length) {
      var fs = el("section", "det-bloco");
      fs.appendChild(el("h2", "det-h", "Ficha técnica"));
      var sc = el("div", "ficha-wrap");
      var tb = el("table", "ficha");
      var tbody = el("tbody");
      p.ficha.forEach(function (r) {
        var tr = el("tr");
        tr.append(el("th", null, r[0]), el("td", null, r[1]));
        tr.firstChild.scope = "row";
        tbody.appendChild(tr);
      });
      tb.appendChild(tbody); sc.appendChild(tb); fs.appendChild(sc);
      fs.appendChild(el("p", "note", p.fichaNota || "Dados conforme a documentação do fabricante. Confirme o código do modelo antes de comprar."));
      if (p.datasheet) {
        var ds = el("a", "btn btn-ghost btn-ds", "Baixar datasheet (PDF)");
        ds.href = p.datasheet; ds.target = "_blank"; ds.rel = "noopener"; ds.setAttribute("download", "");
        fs.appendChild(ds);
      }
      tec.appendChild(fs);
    }
    wrap.appendChild(tec);
    if (p.nota) {
      var nt = el("div", "det-nota");
      nt.append(el("h2", "det-h", "Programação"), el("p", null, p.nota));
      wrap.appendChild(nt);
    }
    det.appendChild(wrap);
    document.title = p.nome + " | DL Electronic";
  }

  function route() {
    var h = location.hash.replace("#", "");
    var p = h.indexOf("p-") === 0 && itens.find(function (x) { return "p-" + x.id === h; });
    if (p) {
      renderDetalhe(p);
      det.dataset.pid = p.id;
      conta("/produto/" + p.id, p.nome);
      home.forEach(function (s) { s.hidden = true; });
      det.hidden = false;
      window.scrollTo(0, 0);
    } else {
      det.hidden = true;
      home.forEach(function (s) { s.hidden = false; });
      document.title = "DL Electronic | IHMs, CLPs e hardware de automação";
      conta("/", "Início");
      if (h) { var t = document.getElementById(h); if (t) t.scrollIntoView(); }
    }
  }
  window.addEventListener("hashchange", route);
  route();

  /* ---------- WhatsApp geral ---------- */
  if (cfg.whatsapp) {
    document.querySelectorAll(".js-wa").forEach(function (a) {
      a.href = waLink(a.dataset.waMsg || "Olá! Vim pelo site da DL Electronic."); a.hidden = false;
    });
    document.querySelectorAll(".js-wa-foot").forEach(function (s) { s.hidden = false; });
  }
})();
