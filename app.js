(function () {
  var cfg = window.DL_CONFIG || {};
  var itens = window.DL_PRODUTOS || [];
  var brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  var grid = document.getElementById("grid");

  function waLink(texto) {
    return "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(texto);
  }

  function card(p) {
    var el = document.createElement("article");
    el.className = "card";
    el.dataset.cat = p.cat;

    var fig = document.createElement("div");
    fig.className = "card-img";
    var img = document.createElement("img");
    img.src = p.img; img.alt = p.nome; img.loading = "lazy"; img.width = 400; img.height = 400;
    fig.appendChild(img);

    var body = document.createElement("div");
    body.className = "card-body";
    var tag = document.createElement("span"); tag.className = "tag"; tag.textContent = p.marca + " · " + p.cat;
    var h = document.createElement("h3"); h.textContent = p.nome;
    var r = document.createElement("p"); r.className = "resumo"; r.textContent = p.resumo;
    var preco = document.createElement("p"); preco.className = "preco";
    preco.textContent = brl.format(p.preco);
    var parc = document.createElement("span"); parc.textContent = " no Mercado Livre"; preco.appendChild(parc);

    var acts = document.createElement("div"); acts.className = "card-acts";
    var buy = document.createElement("a"); buy.className = "btn btn-sm";
    buy.href = p.link || cfg.loja; buy.target = "_blank"; buy.rel = "noopener"; buy.textContent = "Comprar";
    acts.appendChild(buy);
    if (cfg.whatsapp) {
      var ask = document.createElement("a"); ask.className = "btn btn-sm btn-ghost";
      ask.href = waLink("Olá! Tenho interesse no produto " + p.nome + "."); ask.target = "_blank"; ask.rel = "noopener"; ask.textContent = "Perguntar";
      acts.appendChild(ask);
    }
    body.append(tag, h, r, preco, acts);
    el.append(fig, body);
    return el;
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

  if (cfg.whatsapp) {
    document.querySelectorAll(".js-wa").forEach(function (a) {
      a.href = waLink("Olá! Vim pelo site da DL Electronic."); a.hidden = false;
    });
    document.querySelectorAll(".js-wa-foot").forEach(function (s) { s.hidden = false; });
  }
})();
