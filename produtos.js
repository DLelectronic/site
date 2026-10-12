/* Catálogo — edite aqui para adicionar, remover ou mudar preços.
   preco: valor no Mercado Livre · precoDireto: valor para compra direta (WhatsApp)
   link: URL do anúncio no Mercado Livre (se vazio, vai para a loja). */
window.DL_CONFIG = {
  whatsapp: "5514998714561",          // ex.: "5514999999999" — vazio desativa a compra pelo WhatsApp
  loja: "https://www.mercadolivre.com.br/pagina/dlelectronic"
};

window.DL_PRODUTOS = [
  { id: "dop-107bv", nome: "IHM Delta DOP-107BV", cat: "IHM", marca: "Delta",
    resumo: 'Tela touch 7" TFT 800×480, 3 portas seriais, USB.',
    specs: ['Tela 7" TFT colorida, 800 × 480 pixels, touch resistivo', "3 portas seriais: RS-232, RS-232/485 e RS-422/485", "USB host e USB slave", "Alimentação 24 V CC", "Programação no DOPSoft (Delta)"],
    preco: 1300, precoDireto: 1120, img: "img/dop-107bv.jpg",
    link: "https://www.mercadolivre.com.br/ihm-delta-dop-107bv-7-polegadas-novo-e-lacrado-com-nf/p/MLB2104500154?pdp_filters=item_id%3AMLB5369072993" },
  { id: "ktp700-basic", nome: "IHM Siemens KTP700 Basic", cat: "IHM", marca: "Siemens",
    resumo: 'Painel SIMATIC 7" com 8 teclas e PROFINET.',
    specs: ["Código 6AV2123-2GB03-0AX0", 'Tela 7" widescreen TFT, 800 × 480, touch + 8 teclas de função', "Interface PROFINET (Ethernet)", "Alimentação 24 V CC", "Configuração no TIA Portal (WinCC Basic)"],
    preco: 3500, precoDireto: 3056, img: "img/ktp700-basic.jpg",
    link: "https://www.mercadolivre.com.br/ihm-7-siemens-ktp700-basic-simatic/up/MLBU3929099882?pdp_filters=item_id%3AMLB6831114516" },
  { id: "smart-700-ie-v4", nome: "IHM Siemens Smart 700 IE V4", cat: "IHM", marca: "Siemens",
    resumo: 'SMART LINE 7" com Ethernet e serial.',
    specs: ["Código 6AV6648-0DC11-3AX0", 'Tela 7" widescreen, 800 × 480, touch', "Ethernet e RS-422/485", "Ideal com CLP S7-200 SMART", "Configuração no WinCC flexible SMART"],
    preco: 1880, precoDireto: 1630, img: "img/smart-700-ie-v4.jpg",
    link: "https://www.mercadolivre.com.br/ihm-siemens-smart-700-ie-v4/up/MLBU3559259807?pdp_filters=item_id%3AMLB4695663787" },
  { id: "kinco-gl070e", nome: "IHM Kinco GL070E", cat: "IHM", marca: "Kinco",
    resumo: 'Green Series 7" touch com Ethernet e RS-485.',
    specs: ['Tela 7" TFT, 800 × 480, touch', "Ethernet, RS-232, RS-422 e RS-485", "USB host para pen drive", "Alimentação 24 V CC", "Programação no Kinco DTools"],
    preco: 1190, precoDireto: 1023, img: "img/kinco-gl070e.jpg",
    link: "https://www.mercadolivre.com.br/ihm-kinco-gl070e-7-touch-ethernet-rs485-industrial/up/MLBU4561390179?pdp_filters=item_id%3AMLB7328002370" },
  { id: "s7-200-smart", nome: "CLP Siemens S7-200 SMART", cat: "CLP", marca: "Siemens",
    resumo: "CPU SR40: 24 entradas, 16 saídas a relé, Ethernet.",
    specs: ["Código 6ES7288-1SR40-0AA0", "24 entradas digitais e 16 saídas a relé", "Porta Ethernet integrada e RS-485", "Alimentação 100–240 V CA", "Programação no STEP 7-Micro/WIN SMART"],
    preco: 2690, precoDireto: 2343, img: "img/s7-200-smart.jpg",
    link: "https://www.mercadolivre.com.br/clp-siemens-simatic-s7-200-smart-novolacrado-com-nt/p/MLB2095778199?pdp_filters=item_id%3AMLB4994098395" },
  { id: "dtk-delta", nome: "Controlador de temperatura Delta DTK", cat: "Controle", marca: "Delta",
    resumo: "PID 48×48 mm, 2 saídas a relé, 100–240 V.",
    specs: ["Modelo DTK4848R01", "Formato 48 × 48 mm (1/16 DIN) para painel", "Controle PID e ON/OFF", "Entrada para termopar e PT100", "2 saídas a relé · alimentação 100–240 V CA"],
    preco: 340, precoDireto: 278, img: "img/dtk4848.jpg",
    link: "https://www.mercadolivre.com.br/controlador-de-temperatura-dtk-delta/up/MLBU3805211573?pdp_filters=item_id%3AMLB4484937175" },
  { id: "hikrobot-mv-cs016", nome: "Câmera industrial Hikrobot MV-CS016-10UC", cat: "Visão", marca: "Hikrobot",
    resumo: "1,6 MP colorida, USB 3.0, para visão de máquina.",
    specs: ["Sensor 1,6 MP colorido, global shutter", "Interface USB 3.0", "Encaixe de lente C-mount", "Compatível com o software MVS (Hikrobot)", "Para inspeção, leitura e visão de máquina"],
    preco: 2500, precoDireto: 2201, img: "img/hikrobot-mv-cs016.jpg",
    link: "https://www.mercadolivre.com.br/camera-industrial-hikrobot-mvcs01610uc-usb-30-16mp/up/MLBU4473594818?pdp_filters=item_id%3AMLB7267176056" },
  { id: "topping-dx5-ii", nome: "TOPPING DX5 II", cat: "Áudio", marca: "TOPPING",
    resumo: "DAC e amplificador de fone com dois ES9039Q2M.",
    specs: ["Dois chips DAC ES9039Q2M", "Amplificador de fone: saídas 6,35 mm, 4,4 mm balanceada e XLR 4 pinos", "Entradas USB, óptica, coaxial e Bluetooth", "Saídas de linha RCA e XLR", "Cor preta, lacrado"],
    preco: 2900, precoDireto: 2557, img: "img/topping-dx5-ii.jpg",
    link: "https://www.mercadolivre.com.br/topping-dx5-2-dac-usb-e-amp-de-fones-lacradopronta-entrega/up/MLBU3825472001?pdp_filters=item_id%3AMLB6664772030" }
];
