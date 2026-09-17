/*
 * O XI do século: motor de cálculo.
 * Sem acesso ao DOM. Funciona no navegador (window.XIEngine) e no Node (require).
 *
 * Formato de cada jogador em DATA.P:
 * [nome, seleção, posição, posições secundárias, Copas, Champions,
 *  continentais, Bola de Ouro, 2º lugar, 3º lugar, melhor do mundo FIFA,
 *  Bola de Ouro da Copa, seleções do ano, passagens por clube]
 * Copas e Champions: "AAAAx" onde x é T (titular), P (parcial) ou E (elenco).
 * Passagens: "CLUBE:aa-aa" com anos de término das temporadas.
 * DATA.S: por liga, campeões (c), força UEFA x1000 (s) e títulos nos 5 anos anteriores (p).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.XIEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DATA = {
  "P": [
    ["Neuer","ALE","GOL","","2014T","2013T,2020T",0,0,0,1,0,0,4,"BAY:12-26"],
    ["Casillas","ESP","GOL","","2010T","2002T,2014T",2,0,0,0,0,0,5,"RMA:01-15"],
    ["Buffon","ITA","GOL","","2006T","",0,0,1,0,0,0,3,"JUV:02-18,PSG:19-19,JUV:20-21"],
    ["Courtois","BEL","GOL","","","2022T,2024E",0,0,0,0,0,0,2,"ATM:12-14,CHE:15-18,RMA:19-26"],
    ["Emiliano Martínez","ARG","GOL","","2022T","",2,0,0,0,0,0,1,""],
    ["Kahn","ALE","GOL","","","2001T",0,0,0,2,0,1,0,"BAY:01-08"],
    ["Ederson","BRA","GOL","","","2023T",1,0,0,0,0,0,1,"MCI:18-25"],
    ["Donnarumma","ITA","GOL","","","2025T",1,0,0,0,0,0,2,"MIL:16-21,PSG:22-25,MCI:26-26"],
    ["Alisson","BRA","GOL","","","2019T",1,0,0,0,0,0,2,"ROM:17-18,LIV:19-26"],
    ["Čech","TCH","GOL","","","2012T",0,0,0,0,0,0,0,"CHE:05-15,ARS:16-19"],
    ["Keylor Navas","CRC","GOL","","","2016T,2017T,2018T",0,0,0,0,0,0,0,"RMA:15-19,PSG:20-22"],
    ["Van der Sar","HOL","GOL","","","2008T",0,0,0,0,0,0,0,"JUV:01-01,MUN:06-11"],
    ["Daniel Alves","BRA","LD","","","2009T,2011T,2015T",2,0,0,0,0,0,8,"BAR:09-16,JUV:17-17,PSG:18-19,BAR:22-22"],
    ["Carvajal","ESP","LD","","","2014T,2016T,2017T,2018T,2022T,2024T",1,0,0,0,0,0,1,"RMA:14-26"],
    ["Lahm","ALE","LD","MC,LE","2014T","2013T",0,0,0,0,0,0,2,"BAY:06-17"],
    ["Hakimi","MAR","LD","","","2018E,2025T,2026T",0,0,0,0,0,0,2,"RMA:18-18,BVB:19-20,INT:21-21,PSG:22-26"],
    ["Cafu","BRA","LD","","2002T","2007T",0,0,0,0,0,0,1,"ROM:01-03,MIL:04-08"],
    ["Alexander-Arnold","ING","LD","","","2019T",0,0,0,0,0,0,1,"LIV:17-25,RMA:26-26"],
    ["Kyle Walker","ING","LD","","","2023T",0,0,0,0,0,0,1,"TOT:12-17,MCI:18-25"],
    ["Zanetti","ARG","LD","LE","","2010T",0,0,0,0,0,0,0,"INT:01-14"],
    ["Maicon","BRA","LD","","","2010T",2,0,0,0,0,0,1,"INT:07-12,MCI:13-13,ROM:14-16"],
    ["Sergio Ramos","ESP","ZAG","LD","2010T","2014T,2016T,2017T,2018T",2,0,0,0,0,0,11,"RMA:06-21,PSG:22-23"],
    ["Piqué","ESP","ZAG","","2010T","2008P,2009T,2011T,2015T",1,0,0,0,0,0,4,"MUN:05-06,MUN:08-08,BAR:09-23"],
    ["Puyol","ESP","ZAG","LD","2010T","2006T,2009T,2011T",1,0,0,0,0,0,3,"BAR:01-14"],
    ["Varane","FRA","ZAG","","2018T","2014T,2016T,2017T,2018T",0,0,0,0,0,0,1,"RMA:12-21,MUN:22-23"],
    ["Boateng","ALE","ZAG","LD","2014T","2013T,2020T",0,0,0,0,0,0,0,"MCI:11-11,BAY:12-21"],
    ["Cannavaro","ITA","ZAG","","2006T","",0,1,0,0,1,0,2,"INT:03-04,JUV:05-06,RMA:07-09,JUV:10-10"],
    ["Nesta","ITA","ZAG","","2006P","2003T,2007T",0,0,0,0,0,0,2,"MIL:03-12"],
    ["Marquinhos","BRA","ZAG","","","2025T,2026T",1,0,0,0,0,0,0,"ROM:13-13,PSG:14-26"],
    ["Pepe","POR","ZAG","","","2014T,2016T,2017T",1,0,0,0,0,0,0,"RMA:08-17"],
    ["Thiago Silva","BRA","ZAG","","","2021T",1,0,0,0,0,0,3,"MIL:10-12,PSG:13-20,CHE:21-24"],
    ["Lúcio","BRA","ZAG","","2002T","2010T",0,0,0,0,0,0,1,"BAY:05-09,INT:10-12"],
    ["Van Dijk","HOL","ZAG","","","2019T",0,0,1,0,0,0,5,"LIV:18-26"],
    ["Terry","ING","ZAG","","","2012T",0,0,0,0,0,0,5,"CHE:01-17"],
    ["Maldini","ITA","ZAG","LE","","2003T,2007T",0,0,0,1,0,0,1,"MIL:01-09"],
    ["Rúben Dias","POR","ZAG","","","2023T",0,0,0,0,0,0,3,"MCI:21-26"],
    ["Vidić","SRV","ZAG","","","2008T",0,0,0,0,0,0,2,"MUN:06-14,INT:15-16"],
    ["Chiellini","ITA","ZAG","","","",1,0,0,0,0,0,0,"JUV:06-22"],
    ["Marcelo","BRA","LE","","","2014T,2016T,2017T,2018T,2022E",0,0,0,0,0,0,6,"RMA:07-22"],
    ["Alaba","AUT","LE","ZAG","","2013T,2020T,2022T,2024P",0,0,0,0,0,0,1,"BAY:10-21,RMA:22-26"],
    ["Roberto Carlos","BRA","LE","","2002T","2002T",0,0,1,0,0,0,0,"RMA:01-07"],
    ["Nuno Mendes","POR","LE","","","2025T,2026T",0,0,0,0,0,0,1,"PSG:22-26"],
    ["Jordi Alba","ESP","LE","","","2015T",1,0,0,0,0,0,0,"VAL:09-12,BAR:13-23"],
    ["Evra","FRA","LE","","","2008T",0,0,0,0,0,0,1,"MUN:06-14,JUV:15-17,OM:17-18"],
    ["Alphonso Davies","CAN","LE","","","2020T",0,0,0,0,0,0,1,"BAY:19-26"],
    ["Iniesta","ESP","MC","MEI,PE","2010T","2006T,2009T,2011T,2015T",2,0,1,1,0,0,9,"BAR:03-18"],
    ["Modrić","CRO","MC","MEI","","2014T,2016T,2017T,2018T,2022T,2024P",0,1,0,0,1,1,6,"TOT:09-12,RMA:13-25,MIL:26-26"],
    ["Xavi","ESP","MC","","2010T","2006P,2009T,2011T,2015P",2,0,0,3,0,0,6,"BAR:01-15"],
    ["Kroos","ALE","MC","","2014T","2013T,2016T,2017T,2018T,2022T,2024T",0,0,0,0,0,0,4,"BAY:08-09,B04:09-10,BAY:11-14,RMA:15-24"],
    ["Busquets","ESP","MC","","2010T","2009T,2011T,2015T",1,0,0,0,0,0,0,"BAR:09-23"],
    ["Rodri","ESP","MC","","2026T","2023T",1,1,0,0,0,1,1,"ATM:19-19,MCI:20-26"],
    ["Xabi Alonso","ESP","MC","","2010T","2005T,2014T",2,0,0,0,0,0,2,"LIV:05-09,RMA:10-14,BAY:15-17"],
    ["Casemiro","BRA","MC","","","2014P,2016T,2017T,2018T,2022T",1,0,0,0,0,0,1,"RMA:13-14,RMA:16-22,MUN:23-26"],
    ["Pirlo","ITA","MC","","2006T","2003T,2007T",0,0,0,0,0,0,1,"INT:01-01,MIL:02-11,JUV:12-15"],
    ["Schweinsteiger","ALE","MC","","2014T","2013T",0,0,0,0,0,0,0,"BAY:03-15,MUN:16-17"],
    ["Kimmich","ALE","MC","LD","","2020T",0,0,0,0,0,0,1,"BAY:16-26"],
    ["Kanté","FRA","MC","","2018T","2021T",0,0,0,0,0,0,2,"LEI:16-16,CHE:17-23"],
    ["Pedri","ESP","MC","MEI","2026T","",1,0,0,0,0,0,1,"BAR:21-26"],
    ["Vitinha","POR","MC","","","2025T,2026T",0,0,0,1,0,0,1,"PSG:23-26"],
    ["Lampard","ING","MC","MEI","","2012T",0,0,1,0,0,0,1,"CHE:02-14,MCI:15-15"],
    ["Gerrard","ING","MC","MEI","","2005T",0,0,0,1,0,0,3,"LIV:01-15"],
    ["Makélélé","FRA","MC","","","2002T",0,0,0,0,0,0,1,"RMA:01-03,CHE:04-08,PSG:09-11"],
    ["Kaká","BRA","MEI","","2002E","2007T",0,1,0,0,1,0,3,"MIL:04-09,RMA:10-13,MIL:14-14"],
    ["Thomas Müller","ALE","MEI","CA","2014T","2013T,2020T",0,0,0,0,0,0,0,"BAY:09-25"],
    ["De Bruyne","BEL","MEI","MC","","2023T",0,0,0,1,0,0,5,"CHE:13-14,WOB:14-15,MCI:16-25,NAP:26-26"],
    ["Zidane","FRA","MEI","MC","","2002T",0,0,0,0,1,1,2,"JUV:01-01,RMA:02-06"],
    ["Bellingham","ING","MEI","MC","","2024T",0,0,0,1,0,0,3,"BVB:21-23,RMA:24-26"],
    ["Sneijder","HOL","MEI","","","2010T",0,0,0,0,0,0,1,"RMA:08-09,INT:10-13"],
    ["Özil","ALE","MEI","","2014T","",0,0,0,0,0,0,0,"WER:08-10,RMA:11-13,ARS:14-21"],
    ["Messi","ARG","PD","CA,MEI","2022T","2006P,2009T,2011T,2015T",2,8,5,1,8,2,17,"BAR:05-21,PSG:22-23"],
    ["Dembélé","FRA","PD","CA","2018P","2025T,2026T",0,1,0,0,1,0,1,"BVB:17-17,BAR:18-23,PSG:24-26"],
    ["Di María","ARG","PD","PE","2022T","2014T",2,0,0,0,0,0,1,"RMA:11-14,MUN:15-15,PSG:16-22,JUV:23-23"],
    ["Bale","GAL","PD","PE","","2014T,2016T,2017P,2018T,2022E",0,0,0,0,0,0,0,"TOT:08-13,RMA:14-20,RMA:22-22"],
    ["Lamine Yamal","ESP","PD","","2026T","",1,0,1,0,0,0,2,"BAR:23-26"],
    ["Robben","HOL","PD","","","2013T",0,0,0,0,0,0,1,"CHE:05-07,RMA:08-09,BAY:10-19"],
    ["Figo","POR","PD","","","2002T",0,0,0,0,1,0,0,"RMA:01-05,INT:06-09"],
    ["Salah","EGI","PD","","","2019T",0,0,0,0,0,0,0,"CHE:14-15,ROM:16-17,LIV:18-26"],
    ["Cristiano Ronaldo","POR","PE","CA","","2008T,2014T,2016T,2017T,2018T",1,5,6,1,5,0,15,"MUN:04-09,RMA:10-18,JUV:19-21,MUN:22-23"],
    ["Ronaldinho","BRA","PE","MEI","2002T","2006T",0,1,0,1,2,0,3,"PSG:02-03,BAR:04-08,MIL:09-11"],
    ["Vinícius Jr","BRA","PE","","","2022T,2024T",0,0,1,0,1,0,2,"RMA:19-26"],
    ["Neymar","BRA","PE","","","2015T",0,0,0,2,0,0,2,"BAR:14-17,PSG:18-23"],
    ["Ribéry","FRA","PE","","","2013T",0,0,0,1,0,0,1,"OM:06-07,BAY:08-19"],
    ["Hazard","BEL","PE","MEI","","2022E",0,0,0,0,0,0,2,"LOSC:08-12,CHE:13-19,RMA:20-23"],
    ["Benzema","FRA","CA","","","2014T,2016T,2017T,2018T,2022T",0,1,0,0,0,0,1,"OL:05-09,RMA:10-23"],
    ["Lewandowski","POL","CA","","","2020T",0,0,1,0,2,0,2,"BVB:11-14,BAY:15-22,BAR:23-26"],
    ["Mbappé","FRA","CA","PE","2018T","",0,0,0,1,0,0,6,"ASM:16-17,PSG:18-24,RMA:25-26"],
    ["Torres","ESP","CA","","2010T","2012T",2,0,0,1,0,0,2,"ATM:03-07,LIV:08-11,CHE:11-14,MIL:15-15,ATM:15-16"],
    ["Ronaldo Fenômeno","BRA","CA","","2002T","",0,1,0,0,1,0,0,"INT:01-02,RMA:03-07,MIL:07-08"],
    ["David Villa","ESP","CA","PE","2010T","2011T",1,0,0,0,0,0,1,"VAL:06-10,BAR:11-13,ATM:14-14"],
    ["Eto'o","CMR","CA","","","2006T,2009T,2010T",0,0,0,0,0,0,2,"BAR:05-09,INT:10-11,CHE:14-14"],
    ["Haaland","NOR","CA","","","2023T",0,0,1,0,0,0,4,"BVB:20-22,MCI:23-26"],
    ["Shevchenko","UCR","CA","","","2003T",0,1,0,0,0,0,1,"MIL:01-06,CHE:07-08,MIL:09-09"],
    ["Henry","FRA","CA","PE","","2009T",0,0,1,1,0,0,1,"ARS:01-07,BAR:08-10"],
    ["Suárez","URU","CA","","","2015T",1,0,0,0,0,0,1,"LIV:11-14,BAR:15-20,ATM:21-22"],
    ["Griezmann","FRA","CA","MEI","2018T","",0,0,0,2,0,0,0,"ATM:15-19,BAR:20-21,ATM:22-26"],
    ["Ibrahimović","SUE","CA","","","",0,0,0,0,0,0,1,"JUV:05-06,INT:07-09,BAR:10-10,MIL:11-12,PSG:13-16,MUN:17-18,MIL:20-23"],
    ["Drogba","CIV","CA","","","2012T",0,0,0,0,0,0,1,"OM:04-04,CHE:05-12,CHE:15-15"]
  ],
  "S": {
    "PL": {"c":"MUN ARS MUN ARS CHE CHE MUN MUN MUN CHE MUN MCI MUN MCI CHE LEI CHE MCI MCI LIV MCI MCI MCI MCI LIV ARS","s":"787 810 772 778 858 873 891 1000 1000 1000 1000 1000 942 867 804 722 723 744 825 884 1000 1000 1000 1000 1000 1000","p":"41310112223031101120234410"},
    "LL": {"c":"RMA VAL RMA VAL BAR BAR RMA RMA BAR BAR BAR RMA BAR ATM BAR BAR RMA BAR BAR RMA ATM RMA BAR RMA BAR BAR","s":"1000 1000 1000 1000 1000 1000 1000 994 934 974 960 997 1000 1000 1000 1000 1000 1000 1000 1000 973 902 849 858 820 812","p":"10110112233230331331022212"},
    "SA": {"c":"ROM JUV JUV MIL --- INT INT INT INT INT MIL JUV JUV JUV JUV JUV JUV JUV JUV JUV INT MIL NAP INT NAP INT","s":"862 857 825 741 830 917 860 798 791 786 706 711 729 685 705 666 698 713 721 691 750 721 748 866 844 836","p":"02210012340012345555000112"},
    "BL": {"c":"BAY BVB BAY WER BAY BAY STU BAY WOB BAY BVB BVB BAY BAY BAY BAY BAY BAY BAY BAY BAY BAY BAY B04 BAY BAY","s":"746 774 677 620 665 665 577 643 713 784 809 891 904 836 794 758 757 668 694 731 732 705 753 831 749 777","p":"30303303030122334555555044"},
    "L1": {"c":"FCN OL OL OL OL OL OL OL BOR OM LOSC MHSC PSG PSG PSG PSG ASM PSG PSG PSG LOSC PSG PSG PSG PSG PSG","s":"649 619 575 605 671 698 698 695 631 657 626 642 670 578 524 499 540 527 565 579 558 563 558 641 635 699","p":"00123455000001230444034444"}
  },
  "L": {"ARS":"PL","ASM":"L1","ATM":"LL","B04":"BL","BAR":"LL","BAY":"BL","BVB":"BL","CHE":"PL","INT":"SA","JUV":"SA","LEI":"PL","LIV":"PL","LOSC":"L1","MCI":"PL","MIL":"SA","MUN":"PL","NAP":"SA","OL":"L1","OM":"L1","PSG":"L1","RMA":"LL","ROM":"SA","TOT":"PL","VAL":"LL","WER":"BL","WOB":"BL"},
  "C": {"ARS":"Arsenal","ASM":"Monaco","ATM":"Atlético de Madrid","B04":"Leverkusen","BAR":"Barcelona","BAY":"Bayern","BOR":"Bordeaux","BVB":"Borussia Dortmund","CHE":"Chelsea","FCN":"Nantes","INT":"Inter","JUV":"Juventus","LEI":"Leicester","LIV":"Liverpool","LOSC":"Lille","MCI":"Manchester City","MHSC":"Montpellier","MIL":"Milan","MUN":"Manchester United","NAP":"Napoli","OL":"Lyon","OM":"Olympique de Marseille","PSG":"PSG","RMA":"Real Madrid","ROM":"Roma","STU":"Stuttgart","TOT":"Tottenham","VAL":"Valencia","WER":"Werder Bremen","WOB":"Wolfsburg"}
  };

  var FIRST_YEAR = 2001;
  var LGK = ['PL', 'LL', 'SA', 'BL', 'L1'];
  var LGN = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];
  var CLUB = DATA.C;
  var PHI = { T: 1, P: 0.6, E: 0.25 };
  var ROLE = { P: 'parcial', E: 'elenco' };
  var ADAPT = 0.92;
  var K = ['wc', 'ucl', 'cont', 'lg', 'b1', 'b2', 'b3', 'fifa', 'gb', 'xi'];
  var LBL = {
    wc: 'Copa do Mundo', ucl: 'Champions League', cont: 'Eurocopa ou Copa América', lg: 'Ligas top-5',
    b1: 'Bola de Ouro', b2: 'Bola de Ouro, 2º lugar', b3: 'Bola de Ouro, 3º lugar',
    fifa: 'Melhor do mundo FIFA', gb: 'Bola de Ouro da Copa', xi: 'Seleção do ano FIFPRO/FIFA'
  };
  var IND = { wc: 0, ucl: 0, cont: 0, lg: 0, b1: 1, b2: 1, b3: 1, fifa: 1, gb: 1, xi: 1 };
  var DEF = { wc: 100, ucl: 50, cont: 35, lg: 15, b1: 80, b2: 30, b3: 15, fifa: 50, gb: 30, xi: 15 };
  var DX = { h: 60, s: 1, phi: 1 };
  var W_MAX = 200, H_MAX = 90;

  function mk(o, x) { return { w: Object.assign({}, DEF, o), x: Object.assign({}, DX, x || {}) }; }
  var PRE = {
    'Equilibrado': mk({}),
    'Só coletivo': mk({ b1: 0, b2: 0, b3: 0, fifa: 0, gb: 0, xi: 0 }),
    'Só individual': mk({ wc: 0, ucl: 0, cont: 0, lg: 0, b1: 100, b2: 40, b3: 20, fifa: 60, gb: 40, xi: 20 }),
    'Copa é rei': mk({ wc: 200, ucl: 40, cont: 30, lg: 8, b1: 60, b2: 20, b3: 10, fifa: 40, gb: 60, xi: 10 }),
    'Sem ligas': mk({ lg: 0 }),
    'Sem ajustes': mk({ lg: 10 }, { h: 0, s: 0, phi: 0 })
  };
  var DEFAULT_PRESET = 'Equilibrado';

  var POS = {
    GOL: ['goleiro', 'goleiros'], LD: ['lateral-direito', 'laterais-direitos'], ZAG: ['zagueiro', 'zagueiros'],
    LE: ['lateral-esquerdo', 'laterais-esquerdos'], MC: ['meio-campista', 'meio-campistas'], MEI: ['meia', 'meias'],
    PD: ['ponta-direita', 'pontas-direitas'], PE: ['ponta-esquerda', 'pontas-esquerdas'], CA: ['centroavante', 'centroavantes']
  };
  var NAT = {
    ALE: 'Alemanha', ESP: 'Espanha', ITA: 'Itália', BEL: 'Bélgica', ARG: 'Argentina', BRA: 'Brasil', TCH: 'Tchéquia',
    MAR: 'Marrocos', ING: 'Inglaterra', FRA: 'França', POR: 'Portugal', HOL: 'Holanda', SRV: 'Sérvia', AUT: 'Áustria',
    CAN: 'Canadá', CRO: 'Croácia', GAL: 'País de Gales', EGI: 'Egito', POL: 'Polônia', NOR: 'Noruega', UCR: 'Ucrânia',
    URU: 'Uruguai', SUE: 'Suécia', CMR: 'Camarões', CRC: 'Costa Rica', CIV: 'Costa do Marfim'
  };
  var SHORT = {
    'Cristiano Ronaldo': 'C. Ronaldo', 'Sergio Ramos': 'Ramos', 'Emiliano Martínez': 'E. Martínez',
    'Alexander-Arnold': 'A.-Arnold', 'Ronaldo Fenômeno': 'Ronaldo', 'Thomas Müller': 'Müller', 'Lamine Yamal': 'Yamal',
    'Alphonso Davies': 'Davies', 'Roberto Carlos': 'R. Carlos', 'Keylor Navas': 'Navas', 'Kyle Walker': 'Walker',
    'Thiago Silva': 'T. Silva', 'David Villa': 'Villa', 'Schweinsteiger': 'Schweini'
  };
  var FK = { '433': '4-3-3', '4231': '4-2-3-1', '442': '4-4-2' };
  var DEFAULT_F = '4-3-3';
  var FM = {
    '4-3-3': [['PE', 17, 13], ['CA', 50, 9], ['PD', 83, 13], ['MC', 19, 39], ['MC', 50, 45], ['MC', 81, 39], ['LE', 12, 69], ['ZAG', 37, 74], ['ZAG', 63, 74], ['LD', 88, 69], ['GOL', 50, 91]],
    '4-2-3-1': [['CA', 50, 8], ['PE', 15, 27], ['MEI', 50, 30], ['PD', 85, 27], ['MC', 32, 51], ['MC', 68, 51], ['LE', 12, 70], ['ZAG', 37, 75], ['ZAG', 63, 75], ['LD', 88, 70], ['GOL', 50, 91]],
    '4-4-2': [['CA', 33, 10], ['CA', 67, 10], ['PE', 12, 36], ['MC', 37, 43], ['MC', 63, 43], ['PD', 88, 36], ['LE', 12, 69], ['ZAG', 37, 74], ['ZAG', 63, 74], ['LD', 88, 69], ['GOL', 50, 91]]
  };
  var LINES = {
    '4-3-3': [['GOL'], ['LD', 'ZAG', 'LE'], ['MC'], ['PD', 'CA', 'PE']],
    '4-2-3-1': [['GOL'], ['LD', 'ZAG', 'LE'], ['MC'], ['PD', 'MEI', 'PE'], ['CA']],
    '4-4-2': [['GOL'], ['LD', 'ZAG', 'LE'], ['PD', 'MC', 'PE'], ['CA']]
  };
  var EXAMPLES = [['PL', 2026], ['LL', 2014], ['BL', 2024], ['BL', 2012], ['SA', 2023], ['PL', 2024], ['LL', 2011], ['SA', 2016], ['L1', 2023], ['BL', 2019]];

  /* ---------- dados das ligas ---------- */
  var S = {};
  LGK.forEach(function (k) {
    var d = DATA.S[k], cs = d.c.split(' '), ss = d.s.split(' ');
    S[k] = {};
    cs.forEach(function (c, i) { S[k][FIRST_YEAR + i] = { c: c, s: +ss[i] / 1000, p: +d.p.charAt(i) / 5 }; });
  });

  function seasonsOf(k) {
    return Object.keys(S[k]).map(function (y) { var e = S[k][y]; return { y: +y, c: e.c, s: e.s, p: e.p }; })
      .filter(function (t) { return t.c !== '---'; });
  }

  function leagueTitles(tenure) {
    var out = [], seen = {};
    if (!tenure) return out;
    tenure.split(',').forEach(function (t) {
      var m = /^(\w+):(\d\d)-(\d\d)$/.exec(t);
      if (!m) return;
      var c = m[1], a = 2000 + (+m[2]), b = 2000 + (+m[3]), l = DATA.L[c];
      if (!l) return;
      for (var y = Math.max(a, FIRST_YEAR); y <= b; y++) {
        var e = S[l][y];
        if (e && e.c === c && !seen[l + y]) { seen[l + y] = 1; out.push({ l: LGK.indexOf(l), c: c, y: y, s: e.s, p: e.p }); }
      }
    });
    return out.sort(function (x, z) { return x.y - z.y; });
  }

  function norm(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function roles(s) { return s ? s.split(',').map(function (t) { return { y: +t.slice(0, 4), r: t.slice(4) }; }) : []; }
  function season(y) { return (y - 1) + '/' + String(y).slice(2); }

  var PLAYERS = DATA.P.map(function (a, i) {
    return {
      id: i, n: a[0], nat: a[1], pos: a[2], sec: a[3] ? a[3].split(',') : [],
      wc: roles(a[4]), ucl: roles(a[5]), cont: a[6], b1: a[7], b2: a[8], b3: a[9], fifa: a[10], gb: a[11], xi: a[12],
      lg: leagueTitles(a[13]), key: norm(a[0]), slug: norm(a[0]).replace(/[^a-z0-9]+/g, '')
    };
  });
  var BY_SLUG = {};
  PLAYERS.forEach(function (p) { BY_SLUG[p.slug] = p.id; });

  function canPlay(p, pos) { return p.pos === pos || p.sec.indexOf(pos) > -1; }

  /* ---------- pontuação ---------- */
  function titleValue(s, p, X) { return (X.s ? s : 1) * (1 - X.h / 100 * p); }

  function parts(p, W, X) {
    var o = {};
    o.wc = p.wc.reduce(function (a, t) { return a + W.wc * (X.phi ? PHI[t.r] : 1); }, 0);
    o.ucl = p.ucl.reduce(function (a, t) { return a + W.ucl * (X.phi ? PHI[t.r] : 1); }, 0);
    o.cont = W.cont * p.cont;
    o.lg = p.lg.reduce(function (a, t) { return a + W.lg * titleValue(t.s, t.p, X); }, 0);
    ['b1', 'b2', 'b3', 'fifa', 'gb', 'xi'].forEach(function (k) { o[k] = W[k] * p[k]; });
    return o;
  }

  function count(p, k) { return (k === 'wc' || k === 'ucl' || k === 'lg') ? p[k].length : p[k]; }

  var EPS = 1e-9;

  /* Mantém só escolhas válidas: vaga existente, jogador apto para a posição e sem repetição. */
  function cleanLocks(F, locks) {
    var out = {}, seen = {};
    if (!locks) return out;
    Object.keys(locks).forEach(function (k) {
      var i = +k, id = locks[k], slot = FM[F][i], p = PLAYERS[id];
      if (!slot || !p || seen[id] || !canPlay(p, slot[0])) return;
      seen[id] = 1; out[i] = id;
    });
    return out;
  }

  /* Leva as escolhas para outra formação, vaga a vaga na mesma posição. */
  function remapLocks(fromF, toF, locks) {
    var out = {}, taken = {};
    Object.keys(cleanLocks(fromF, locks)).forEach(function (k) {
      var pos = FM[fromF][+k][0];
      for (var i = 0; i < FM[toF].length; i++) {
        if (!taken[i] && FM[toF][i][0] === pos) { taken[i] = 1; out[i] = locks[k]; return; }
      }
    });
    return out;
  }

  /* Calcula pontos, ranking (empates dividem a posição) e o XI da formação.
     locks: { índice da vaga: id do jogador } com as escolhas feitas à mão. */
  function compute(W, X, F, locks) {
    var scored = PLAYERS.map(function (base) {
      var p = Object.assign({}, base);
      p.o = parts(p, W, X);
      p.c = p.o.wc + p.o.ucl + p.o.cont + p.o.lg;
      p.i = p.o.b1 + p.o.b2 + p.o.b3 + p.o.fifa + p.o.gb + p.o.xi;
      p.t = p.c + p.i;
      return p;
    });
    var ranked = scored.slice().sort(function (a, b) { return b.t - a.t || a.id - b.id; });
    var lastByPos = {}, countByPos = {};
    ranked.forEach(function (p, i) {
      var prev = ranked[i - 1];
      p.r = prev && Math.abs(prev.t - p.t) < EPS ? prev.r : i + 1;
      countByPos[p.pos] = (countByPos[p.pos] || 0) + 1;
      var lp = lastByPos[p.pos];
      p.pr = lp && Math.abs(lp.t - p.t) < EPS ? lp.pr : countByPos[p.pos];
      lastByPos[p.pos] = p;
    });

    var xi = FM[F].map(function (s) { return { pos: s[0], x: s[1], y: s[2], p: null, adapt: false, locked: false }; });
    var cap = {}, used = new Set();
    xi.forEach(function (s) { cap[s.pos] = (cap[s.pos] || 0) + 1; });
    var fixed = cleanLocks(F, locks);
    Object.keys(fixed).forEach(function (k) {
      var slot = xi[+k], p = scored[fixed[k]];
      slot.p = p; slot.adapt = p.pos !== slot.pos; slot.locked = true; used.add(p.id); cap[slot.pos]--;
    });
    var pairs = [];
    scored.forEach(function (p) {
      pairs.push({ p: p, pos: p.pos, v: p.t, q: 1 });
      p.sec.forEach(function (s) { pairs.push({ p: p, pos: s, v: p.t * ADAPT, q: 0 }); });
    });
    pairs.sort(function (a, b) { return b.v - a.v || b.q - a.q || a.p.id - b.p.id; });
    pairs.forEach(function (o) {
      if (used.has(o.p.id) || !cap[o.pos]) return;
      var slot = xi.filter(function (z) { return z.pos === o.pos && !z.p; })[0];
      slot.p = o.p; slot.adapt = !o.q; used.add(o.p.id); cap[o.pos]--;
    });
    var best = xi.reduce(function (a, b) { return b.p.t > a.p.t ? b : a; }).p.id;
    return {
      ranked: ranked, byId: scored, xi: xi, inXI: used, best: best, locks: fixed,
      sum: xi.reduce(function (a, s) { return a + s.p.t; }, 0)
    };
  }

  /* Opções para uma vaga: quem joga na posição, com 8% de desconto para adaptados. */
  function candidates(res, slotIndex) {
    var slot = res.xi[slotIndex];
    return res.ranked.filter(function (p) { return canPlay(p, slot.pos); }).map(function (p) {
      var at = -1;
      res.xi.forEach(function (z, i) { if (z.p.id === p.id) at = i; });
      return { p: p, adapt: p.pos !== slot.pos, v: p.pos === slot.pos ? p.t : p.t * ADAPT, current: at === slotIndex, elsewhere: at > -1 && at !== slotIndex };
    }).sort(function (a, b) { return b.v - a.v || a.p.id - b.p.id; });
  }

  function breakdownRows(p) {
    return K.filter(function (k) { return count(p, k) > 0; })
      .map(function (k) { return { k: k, label: LBL[k], n: count(p, k), v: p.o[k], individual: !!IND[k] }; });
  }

  function detail(p, k, W, X, fmt1) {
    if (k === 'wc' || k === 'ucl') {
      return p[k].map(function (t) { return t.y + (X.phi && t.r !== 'T' ? ' (' + ROLE[t.r] + ')' : ''); }).join(', ');
    }
    if (k === 'lg') {
      var g = {}, order = [];
      p.lg.forEach(function (t) {
        var key = t.c + '|' + t.l;
        if (!g[key]) { g[key] = { c: t.c, l: t.l, n: 0, v: 0 }; order.push(key); }
        g[key].n++; g[key].v += W.lg * titleValue(t.s, t.p, X);
      });
      return order.map(function (key) {
        var o = g[key];
        return CLUB[o.c] + ', ' + LGN[o.l] + ': ' + o.n + (o.n > 1 ? ' títulos' : ' título') + ', média de ' + fmt1(o.v / o.n);
      }).join('. ');
    }
    return '';
  }

  function leagueTable(W, X) {
    var rows = LGK.map(function (k, i) {
      var ss = seasonsOf(k);
      var avg = ss.reduce(function (a, t) { return a + W.lg * titleValue(t.s, t.p, X); }, 0) / ss.length;
      var sAvg = ss.reduce(function (a, t) { return a + t.s; }, 0) / ss.length;
      var heg = ss.filter(function (t) { return t.p >= 0.6; }).length;
      var champs = {};
      ss.forEach(function (t) { champs[t.c] = 1; });
      return { i: i, name: LGN[i], avg: avg, s: sAvg, heg: heg, n: ss.length, dist: Object.keys(champs).length };
    });
    return rows.sort(function (a, b) { return b.avg - a.avg || a.i - b.i; });
  }

  function leagueTitleValue(league, year, W, X) {
    var t = S[league] && S[league][year];
    if (!t || t.c === '---') return null;
    return { club: CLUB[t.c], league: LGN[LGK.indexOf(league)], season: season(year), v: W.lg * titleValue(t.s, t.p, X) };
  }

  /* ---------- estado compartilhável no endereço ---------- */
  function isDefault(st) {
    return st.F === DEFAULT_F && matchPreset(st.W, st.X) === DEFAULT_PRESET && !Object.keys(st.L || {}).length;
  }

  function matchPreset(W, X) {
    for (var n in PRE) {
      var pr = PRE[n];
      if (K.every(function (k) { return pr.w[k] === W[k]; }) && pr.x.h === X.h && pr.x.s === X.s && pr.x.phi === X.phi) return n;
    }
    return '';
  }

  function encodeState(st) {
    if (isDefault(st)) return '';
    var fk = Object.keys(FK).filter(function (k) { return FK[k] === st.F; })[0];
    var locks = cleanLocks(st.F, st.L);
    var l = Object.keys(locks).sort(function (a, b) { return a - b; }).map(function (k) { return k + '.' + PLAYERS[locks[k]].slug; }).join('-');
    return fk + '_' + K.map(function (k) { return st.W[k]; }).join('-') + '_' + [st.X.h, st.X.s, st.X.phi].join('-') + (l ? '_' + l : '');
  }

  /* Lê o trecho depois do #. Valores inválidos são ignorados e mantêm o padrão. */
  function decodeState(hash) {
    var st = { F: DEFAULT_F, W: Object.assign({}, DEF), X: Object.assign({}, DX), L: {} };
    var h;
    try { h = decodeURIComponent(String(hash || '').replace(/^#/, '')); } catch (e) { return st; }
    if (!h) return st;
    var seg = h.split('_');
    if (FK[seg[0]]) st.F = FK[seg[0]];
    if (seg[1]) {
      var a = seg[1].split('-').map(Number);
      if (a.length === K.length && a.every(function (n) { return Number.isInteger(n) && n >= 0 && n <= W_MAX; })) {
        K.forEach(function (k, i) { st.W[k] = a[i]; });
      }
    }
    if (seg[2]) {
      var b = seg[2].split('-').map(Number);
      if (b.length === 3 && Number.isInteger(b[0]) && b[0] >= 0 && b[0] <= H_MAX && b[0] % 10 === 0) {
        st.X.h = b[0]; st.X.s = b[1] ? 1 : 0; st.X.phi = b[2] ? 1 : 0;
      }
    }
    if (seg[3]) {
      var raw = {};
      seg[3].split('-').forEach(function (pair) {
        var m = /^(\d{1,2})\.([a-z0-9]+)$/.exec(pair);
        if (m && BY_SLUG[m[2]] !== undefined) raw[+m[1]] = BY_SLUG[m[2]];
      });
      st.L = cleanLocks(st.F, raw);
    }
    return st;
  }

  function listPt(a) {
    try { return new Intl.ListFormat('pt-BR', { type: 'conjunction' }).format(a); } catch (e) { return a.join(', '); }
  }

  function lineupText(xi, F) {
    return LINES[F].map(function (line) {
      var names = [];
      line.forEach(function (pos) { xi.forEach(function (s) { if (s.pos === pos) names.push(s.p.n); }); });
      return listPt(names);
    }).join('; ');
  }

  return {
    DATA: DATA, FIRST_YEAR: FIRST_YEAR, LGK: LGK, LGN: LGN, CLUB: CLUB, PHI: PHI, ROLE: ROLE, ADAPT: ADAPT,
    K: K, LBL: LBL, IND: IND, DEF: DEF, DX: DX, W_MAX: W_MAX, H_MAX: H_MAX, PRE: PRE, DEFAULT_PRESET: DEFAULT_PRESET,
    POS: POS, NAT: NAT, SHORT: SHORT, FK: FK, FM: FM, LINES: LINES, DEFAULT_F: DEFAULT_F, EXAMPLES: EXAMPLES,
    PLAYERS: PLAYERS, seasonsOf: seasonsOf, norm: norm, season: season, titleValue: titleValue,
    compute: compute, candidates: candidates, canPlay: canPlay, cleanLocks: cleanLocks, remapLocks: remapLocks, breakdownRows: breakdownRows, detail: detail, leagueTable: leagueTable,
    leagueTitleValue: leagueTitleValue, matchPreset: matchPreset, encodeState: encodeState,
    decodeState: decodeState, isDefault: isDefault, lineupText: lineupText
  };
});
