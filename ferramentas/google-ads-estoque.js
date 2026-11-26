/**
 * Script do Google Ads — DL Electronic
 * Pausa o grupo de anúncios de um produto quando ele esgota no Mercado Livre e
 * reativa quando volta ao estoque. Lê https://dlelectronic.com.br/ml-status.json,
 * que o site atualiza a cada 2 horas a partir dos anúncios do ML.
 *
 * Como instalar: Google Ads → Ferramentas → Ações em massa → Scripts → "+" →
 * cole este código → Autorizar → Visualizar (teste) → Salvar → Frequência: a cada hora.
 *
 * GRUPOS: nome do grupo de anúncios no Google Ads → id do produto no site.
 * Só os grupos listados aqui são controlados pelo script; os outros ficam como estão.
 * Atenção: um grupo listado é reativado sempre que o produto tiver estoque, mesmo que
 * você o tenha pausado à mão. Para controlar um grupo à mão, tire-o desta lista.
 */
var GRUPOS = {
  "DOP-107BV": "dop-107bv",
  "TOPPING DX5 II": "topping-dx5-ii",
  "Hikrobot MV-CS016": "hikrobot-mv-cs016"
};
var STATUS_URL = "https://dlelectronic.com.br/ml-status.json";

function main() {
  var resp = UrlFetchApp.fetch(STATUS_URL + "?t=" + Date.now(), { muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) {
    Logger.log("Não consegui ler " + STATUS_URL + " (HTTP " + resp.getResponseCode() + "). Nada alterado.");
    return;
  }
  var dados = JSON.parse(resp.getContentText());
  var itens = dados.itens || {};

  var it = AdsApp.adGroups().get();
  while (it.hasNext()) {
    var g = it.next();
    var pid = GRUPOS[g.getName()];
    if (!pid) continue;
    var st = itens[pid];
    if (!st) { Logger.log(g.getName() + ": produto sem status no site, mantido."); continue; }
    if (st.disponivel && g.isPaused()) {
      g.enable();
      Logger.log(g.getName() + ": voltou ao estoque → grupo reativado.");
    } else if (!st.disponivel && g.isEnabled()) {
      g.pause();
      Logger.log(g.getName() + ": esgotado no Mercado Livre → grupo pausado.");
    } else {
      Logger.log(g.getName() + ": sem mudança (" + (st.disponivel ? "com estoque" : "esgotado") + ").");
    }
  }
}
