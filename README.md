# Site DL Electronic

Vitrine estática publicada no GitHub Pages em https://dlelectronic.com.br.

- Produtos e preços: `produtos.js`
- WhatsApp: `DL_CONFIG.whatsapp` em `produtos.js`

## Integração com o Mercado Livre e o Google Ads

- `ferramentas/sincronizar_ml.py` lê os anúncios do ML (pelo `item_id` no `link` de cada produto) e atualiza `preco` e `esgotado` em `produtos.js`, além de `ml-status.json`. `precoDireto` continua manual.
- Roda sozinho a cada 2 horas pelo workflow **Sincronizar Mercado Livre** (`.github/workflows/sincronizar-ml.yml`), depois de configurado com o workflow **Conectar Mercado Livre**.
- `esgotado: true` mostra o selo "Esgotado", troca a compra por consulta no WhatsApp e informa `OutOfStock` ao Google (Merchant Center).
- `ferramentas/google-ads-estoque.js` é um script para colar no Google Ads: pausa e reativa os grupos de anúncios conforme o `ml-status.json`.
