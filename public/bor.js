// bookmarklet.js
// borges 2021 - nenhum direito reservado
// script principal da página

// armazenado globalmente para não termos que descomprimir toda vez
let g = null;

// versão do objeto exigida, será descartado se diferir
const obj_ver = 1;

// cores padrão legaizinhas
const COLORS = [
  "#e74c3c", "#8e44ad", "#3498db", "#1abc9c", "#27ae60", "#f1c40f",
  "#f39c12", "#ec7063", "#c39bd3", "#85c1e9", "#7dcea0", "#f8c471"
];

// nomes dos dias de semana nas várias configurações
const DIAS = {
  "letra": {
    "Dom": "D",
    "Seg": "S",
    "Ter": "T",
    "Qua": "Q",
    "Qui": "Q",
    "Sex": "S",
    "Sab": "S"
  },
  "abreviado": {
    "Dom": "Dom",
    "Seg": "Seg",
    "Ter": "Ter",
    "Qua": "Qua",
    "Qui": "Qui",
    "Sex": "Sex",
    "Sab": "Sáb"
  },
  "coloquial": {
    "Dom": "Domingo",
    "Seg": "Segunda",
    "Ter": "Terça",
    "Qua": "Quarta",
    "Qui": "Quinta",
    "Sex": "Sexta",
    "Sab": "Sábado"
  },
  "completo": {
    "Dom": "Domingo",
    "Seg": "Segunda-feira",
    "Ter": "Terça-feira",
    "Qua": "Quarta-feira",
    "Qui": "Quinta-feira",
    "Sex": "Sexta-feira",
    "Sab": "Sábado"
  }
}

// nomes das opções
const OPTS = [
  "prop", "sep", "evil", "fmt", "fday", "stra", "strw", "cmix", "alpha",
  "nosab"
];

// função auxiliar: pega o valor de um input
function input_get(elem) {
  if (elem.type == "checkbox") {
    return elem.checked;
  } else if (elem.type == "range") {
    if (elem.step == 1) {
      return parseInt(elem.value);
    } else {
      return parseFloat(elem.value);
    }
  } else {
    return elem.value;
  }
}

// função auxiliar: seta o valor de um input
function input_set(elem, val) {
  if (elem.type == "checkbox") {
    return elem.checked == val;
  } else {
    return elem.value = val;
  }
}

// algoritmo de compressão LZString, minificado pra caber em ~1.5 kB
// thanks, @pieroxy
const _compress = function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")}
const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
function compress(o) {
  return null==o?"":_compress(o,6,function(o){return e.charAt(o)})
}

// função auxiliar -- descomprime o JSON usando lz-string
function decomp(s) {
  return LZString.decompressFromEncodedURIComponent(s);
}

// insere elementos entre elementos de uma array
const interleave = (a, e) => [].concat(...a.map(n => [n, e])).slice(0, -1);

// retorna o comprimento, em bytes, de uma string
function bytelen(s) {
  return (new TextEncoder().encode(s)).length
}

// extrai o objeto da URL, e insere alguns detalhes adicionais
function extract(dbg) {
  const o = new URLSearchParams(window.location.search).get("o");
  if (!o) return null;
  const d = decomp(o);
  const a = bytelen(o), b = bytelen(d);
  if (dbg)
    console.log(
      `Compressão encolheu o JSON em ~${Math.round(100-100*a/b)}%!`,
      `(de ${b} para ${a} bytes)`
    );
  let obj = JSON.parse(d);
  if (obj["ver"] != obj_ver) {
    alert("O bookmarklet foi atualizado! Você vai precisar rodar de novo...");
    location.assign("./");
  }
  obj["dias"] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  let hors = [];
  for (const aula of obj["aulas"]) {
    const i = hor2int(aula["inicio"]);
    const f = hor2int(aula["fim"]);
    hors.push(i);
    hors.push(f);
  }
  let nh = [...new Set(hors)];
  nh.sort((a, b) => a - b);
  obj["horarios"] = nh;
  return obj;
}

// detecta a presença do parâmetro e esconde o div correspondente
function hide_correct() {
  if (extract(true)) {
    document.getElementById("no_enc").style.display = "none";
    first_run();
  } else {
    document.getElementById("has_enc").style.display = "none";
  }
}

// detectar assim a página carregar (script no final do <body>)
hide_correct();

// ===== código daqui em diante só para horário carregado (g !== null) =====

// chamada no primeiro carregamento com horário na URL
function first_run() {
  g = extract();
  gen_colors();
  if (window.location.hash.length > 0) {
    const opts = frag2opt();
    obj2opt(opts);
  } else {
    color_default();
  }
  regen();
}

// gerar os inputs de cor
function gen_colors() {
  let col = 0;
  const el = document.getElementById("incolors");
  for (let i = 0; i < 3; i++) {
    el.children[i].innerHTML = "";
  }
  for (const k in g["detalhes"]) {
    const a = g["detalhes"][k];
    const codigo = a["codigo"];
    const nome = a["nome"];
    const inp = document.createElement("input");
    const txt = document.createElement("span");
    const tcol = el.children[col];
    txt.innerText = `${codigo} - ${nome}`;
    inp.type = "color";
    inp.id = "opt_color_" + k;
    txt.className = "color_example";
    inp.addEventListener("change", function() {
      regen();
    });
    txt.addEventListener("click", function(e) {
      const newname = prompt("Novo nome:", nome);
      if (newname) g["detalhes"][k]["nome"] = newname;
      regen();
      gen_colors();
    });
    tcol.appendChild(inp);
    tcol.appendChild(document.createElement("br"));
    tcol.appendChild(txt);
    tcol.appendChild(document.createElement("br"));
    tcol.appendChild(document.createElement("br"));
    col = (col + 1) % 3
  }
}

// retorna os inputas de cor por código
function color_inputs() {
  let ins = {};
  for (const cod in g["detalhes"]) {
    ins[cod] = document.getElementById("opt_color_" + cod);
  }
  return ins;
}

// função auxiliar: embaralha uma array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// embaralha a ordem das cores
function color_shuffle() {
  const ins = color_inputs();
  let vals = [...Object.values(ins)].map((inp) => inp.value);
  shuffle(vals);
  for (const cod in ins) {
    ins[cod].value = vals.pop();
  }
  regen();
}

// usa cores bonitinhas randômicas
function color_default() {
  let cs = [];
  const ins = color_inputs();
  for (const cod in ins) {
    if (cs.length < 1) {
      cs = [...COLORS];
      shuffle(cs);
    }
    ins[cod].value = cs.pop();
  }
  regen();
}

// algoritmo simples para mistura de cores
// vide gist.github.com/JordanDelcros/518396da1c13f75ee057#gistcomment-2075095
function blend(colors) {
  var args = colors;
  var base = [0, 0, 0, 0];
  var mix;
  var added;
  while (added = args.shift()) {
    if (typeof added[3] === 'undefined') {
      added[3] = 1;
    }
    // check if both alpha channels exist.
    if (base[3] && added[3]) {
      mix = [0, 0, 0, 0];
      // alpha
      mix[3] = 1 - (1 - added[3]) * (1 - base[3]);
      // red
      mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3]));
      // green
      mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3]));
      // blue
      mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3]));
    } else if (added) {
      mix = added;
    } else {
      mix = base;
    }
    base = mix;
  }
  return mix;
}

// estratégia de combinação de cores: listras (gera um gradiente)
function stripes(colors, angle, width) {
  shuffle(colors);
  colors = colors.map((c) => rgb2css(hex2rgb(c)));
  let cs = [];
  for (let rems = 1; rems < colors.length; rems++) {
    cs.push(`${colors[rems-1]} ${rems*width}rem`);
    cs.push(`${colors[rems]} ${rems*width}rem`);
  }
  cs.push(`${colors[colors.length-1]} ${colors.length*width}rem`);
  const rlg = "repeating-linear-gradient";
  return `${rlg}(\n  ${angle},\n  ${colors[0]},\n  ${cs.join(",\n  ")}\n)`;
}

// converte cor em hexa para rgb
function hex2rgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const obj = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
  if (!obj) throw `bad hex ${hex}`
  return [obj.r, obj.g, obj.b];
}

// converte cor em hexa para rgba
function hex2rgba(hex, alpha) {
  let a = hex2rgb(hex);
  a.push(alpha);
  return a;
}

// converte cor em rgb para hexa
function rgb2hex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// escreve uma cor rgb em css
function rgb2css(arr) {
  if (arr.length == 3) return `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
  else if (arr.length == 4)
    return `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;
  else throw `wtf kinda color is ${arr}?`;
}

// gera propriedade de fundo baseado em cores e opções
function setbg(elem, colors, strategy, strw, stra, alpha) {
  if (strategy == "blend" || colors.length == 1) {
    const color = blend(colors.map((c) => hex2rgba(c, alpha)));
    elem.style.backgroundColor = rgb2css(color);
  } else if (strategy == "stripes") {
    const angle = `${stra}deg`;
    const rcg = stripes(colors, angle, strw);
    elem.style.background = rcg;
  } else {
    throw `bad color strategy ${strategy}`;
  }
}

// converte horário XX:XX para minutos totais
function hor2int(hor) {
  const hre = /(\d{2}):(\d{2})/;
  const match = hor.match(hre);
  return parseInt(match[1])*60 + parseInt(match[2]);
}

// converte minutos totais de volta para horário XX:YY
// "evil" deixa o horário no formato americano do mal: AM/PM sem zero antes
function int2hor(mins, evil) {
  let h = Math.floor(mins/60);
  let m = Math.round(mins - h*60).toFixed(0);
  if (m.length < 2) m = "0" + m;
  if (evil) {
    let a = "AM";
    if (h > 12) {
      h %= 12;
      a = "PM";
    }
    return `${h.toFixed(0)}:${m} ${a}`;
  } else {
    h = h.toFixed(0);
    if (h.length < 2) h = "0" + h;
    return `${h}:${m}`;
  }
}

// acha as aulas num certo dia e bloco
function byblock(gg, day, s, e) {
  let cods = [];
  for (const aula of gg["aulas"]) {
    const ad = aula["dia"];
    const i = hor2int(aula["inicio"]);
    const f = hor2int(aula["fim"]);
    if (ad == day && i <= s && f >= e) {
      cods.push(aula["codigo"]);
    }
  }
  cods.sort();
  return [...new Set(cods)];
}

// coloca o texto formatado num td
function aulas_fmt(td, codigos, fmt, dets, sep) {
  let elems = [];
  for (const cod of codigos) {
    let codigo = dets[cod]["codigo"];
    if (sep) {
      codigo = codigo.substring(0, 3) + " " + codigo.substring(3);
    }
    const nome = dets[cod]["nome"];
    for (const cf of fmt) {
      const e = document.createElement("span");
      const cl = cf.toLowerCase();
      e.innerText = {
        "c": codigo,
        "n": nome,
        "!": "\n"
      }[cl];
      if (cf == cl) {
        e.className = "aula_peq";
      } else {
        e.class_name = "aula_normal";
      }
      elems.push(() => e);
    }
  }
  elems = interleave(elems, () => document.createElement("br"));
  for (const elem of elems) {
    td.appendChild(elem());
  }
}

// salva as opções para um objeto
function opt2obj() {
  let opts = {}
  for (const oname of OPTS) {
    opts[oname] = input_get(document.getElementById(`opt_${oname}`));
  }
  for (const inp of document.querySelectorAll("input[type=color]")) {
    const oname = inp.id.substring(4);
    opts[oname] = input_get(inp);
  }
  return opts;
}

// coloca as opções no fragmento
function obj2frag(obj) {
  window.location.hash = compress(JSON.stringify(obj));
}

// carrega as opções do fragmento
function frag2opt() {
  return JSON.parse(decomp(window.location.hash.substring(1)));
}

// carrega as opções de objeto pros elementos
function obj2opt(obj) {
  for (const oname in obj) {
    input_set(document.getElementById(`opt_${oname}`), obj[oname]);
  }
}

// monta a tabela com o horário
function regen() {
  // sincronizar opções
  const opts = opt2obj();
  obj2frag(opts);
  // elementos: thead e tbody
  const mh = document.getElementById("mh");
  const mb = document.getElementById("mb");
  // zerar o thead e tbody
  mh.innerHTML = "";
  mb.innerHTML = "";
  // gerar header
  const thr = document.createElement("tr");
  const hor = document.createElement("th");
  hor.innerText = "Horário";
  thr.appendChild(hor);
  for (const dia of g["dias"]) {
    if (dia == "Sab" && opts["nosab"]) continue;
    const th = document.createElement("th");
    th.innerText = DIAS[opts["fday"]][dia];
    thr.appendChild(th);
  }
  mh.appendChild(thr);
  // gerar corpo
  const ins = color_inputs();
  for (let i = 0; i < g["horarios"].length - 1; i++) {
    const inicio = g["horarios"][i];
    const fim = g["horarios"][i+1];
    const ti = int2hor(inicio, opts["evil"]);
    const tf = int2hor(fim, opts["evil"]);
    const tr = document.createElement("tr");
    const hb = document.createElement("td");
    hb.innerText = `${ti} - ${tf}`;
    hb.className = "timeslot";
    tr.appendChild(hb);
    for (const dia of g["dias"]) {
      if (dia == "Sab" && opts["nosab"]) continue;
      const codigos = byblock(g, dia, inicio, fim);
      const td = document.createElement("td");
      if (codigos.length > 0) {
        let cores = codigos.map((c) => ins[c].value);
        cores.sort();
        aulas_fmt(td, codigos, opts["fmt"], g["detalhes"], opts["sep"]);
        setbg(
          td, cores, opts["cmix"], opts["strw"], opts["stra"], opts["alpha"]
        );
      }
      tr.appendChild(td);
    }
    mb.appendChild(tr);
  }
  // combinar células com valor igual abaixo
  let remove_queue = [];
  for (let i = 0; i < mb.rows.length; i++) {
    const row = mb.rows[i];
    for (let j = 0; j < row.cells.length; j++) {
      const cell = row.cells[j];
      for (let k = i+1; k < mb.rows.length; k++) {
        const below = mb.rows[k].cells[j];
        if (below.innerText.trim() == cell.innerText.trim()) {
          remove_queue.push(below);
          cell.rowSpan++;
        } else {
          break;
        }
      }
    }
  }
  remove_queue.map((c) => c.remove());
}
