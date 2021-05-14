// view.js
// borges 2021 - nenhum direito reservado
// script principal da página

// armazenado globalmente para não termos que descomprimir toda vez
let g = null;

// nomes das opções
const OPTS = [
  "prop", "sep", "evil", "fmt", "fday", "stra", "strw", "cmix", "alpha",
  "nosab"
];

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
    txt.addEventListener("click", function(evt) {
      const newname = prompt("Novo nome:", nome);
      if (newname) {
        evt.target.innerText = `${codigo} - ${newname}`;
        g["detalhes"][k]["nome"] = newname;
      }
      regen();
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
    try {
      input_set(document.getElementById(`opt_${oname}`), obj[oname]);
    } catch (e) {}
  }
}

// redireciona para a página de edição
function edit() {
  const o = compress(JSON.stringify(g));
  window.location.assign("editor/?o=" + o);
}

// abre uma nova guia pra imprimir
function imprimir() {
  print_element(document.getElementById("mt"));
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
