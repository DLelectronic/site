(function () {
  var cfg = window.DL_CONFIG || {};
  var itens = window.DL_PRODUTOS || [];
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  var grid = document.getElementById("grid");
  var home = document.querySelectorAll("[data-home]");
  var det = document.getElementById("detalhe");

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
    var fig = el("div", "card-img");
    var img = el("img"); img.src = p.img; img.alt = p.nome; img.loading = "lazy"; img.width = 400; img.height = 400;
    fig.appendChild(img);
    var body = el("div", "card-body");
    body.append(
      el("span", "tag", p.marca + " · " + p.cat),
      el("h3", null, p.nome),
      el("p", "resumo", p.resumo)
    );
    var preco = el("p", "preco", brl.format(p.preco));
    preco.appendChild(el("span", "preco-tag", " no Mercado Livre"));
    body.appendChild(preco);
    if (p.precoDireto) {
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

    var fig = el("div", "det-img");
    var img = el("img"); img.src = p.img; img.alt = p.nome; img.width = 800; img.height = 800;
    fig.appendChild(img);

    var info = el("div", "det-info");
    info.append(el("span", "tag", p.marca + " · " + p.cat), el("h1", "det-title", p.nome), el("p", "det-resumo", p.resumo));

    var buy = el("div", "buy");
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

    grid2.append(fig, info);
    wrap.append(back, grid2);

    var tec = el("div", "det-tec");
    if (p.aplicacao) {
      var ap = el("section", "det-bloco");
      ap.append(el("h2", "det-h", "Aplicação"), el("p", "det-aplic", p.aplicacao));
      tec.appendChild(ap);
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
      fs.appendChild(el("p", "note", "Dados conforme a documentação do fabricante. Confirme o código do modelo antes de comprar."));
      if (p.datasheet) {
        var ds = el("a", "btn btn-ghost btn-ds", "Baixar datasheet (PDF)");
        ds.href = p.datasheet; ds.target = "_blank"; ds.rel = "noopener"; ds.setAttribute("download", "");
        fs.appendChild(ds);
      }
      tec.appendChild(fs);
    }
    wrap.appendChild(tec);
    det.appendChild(wrap);
    document.title = p.nome + " | DL Electronic";
  }

  function route() {
    var h = location.hash.replace("#", "");
    var p = h.indexOf("p-") === 0 && itens.find(function (x) { return "p-" + x.id === h; });
    if (p) {
      renderDetalhe(p);
      home.forEach(function (s) { s.hidden = true; });
      det.hidden = false;
      window.scrollTo(0, 0);
    } else {
      det.hidden = true;
      home.forEach(function (s) { s.hidden = false; });
      document.title = "DL Electronic | IHMs, CLPs e hardware de automação";
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
