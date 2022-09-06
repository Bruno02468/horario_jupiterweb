// view.js
// borges 2021 - nenhum direito reservado
// script principal da página de visualização

// armazenado globalmente para não termos que descomprimir toda vez
let g = null;

function ta_na_disney(e) {
  alert("Não é pra abrir o link aqui!\n\nLeia as instruções com calma.");
  return false;
}

// detecta a presença do parâmetro e esconde o div correspondente
function kickstart() {
  if (extract(true)) {
    document.getElementById("no_enc").style.display = "none";
    first_run();
  } else {
    document.getElementById("has_enc").style.display = "none";
  }
  const bm = document.getElementById("bookmarklet_mobile");
  const bl = document.getElementById("bookmarklet");
  bm.value = bl.href.substring(11);
  bm.addEventListener("click", () => bm.select());
  bm.addEventListener("focus", () => bm.select());
  bm.addEventListener("mouseover", () => bm.select());
}

// chamada no primeiro carregamento com horário na URL
function first_run() {
  g = extract();
  gen_inputs();
  if (window.location.hash.length > 0) {
    const opts = frag2obj();
    obj2opt(opts);
  } else {
    color_default();
  }
  regen();
}

// gerar os inputs de cor, nome, e links
function gen_inputs() {
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
    const nom = document.createElement("input");
    const isite = document.createElement("input");
    const icall = document.createElement("input");
    const tcol = el.children[col];
    inp.type = "color";
    inp.id = `opt_color_${k}`;
    nom.className = "color_example";
    inp.addEventListener("change", function() {
      regen();
    });
    nom.type = isite.type = icall.type = "text";
    isite.placeholder = "Site da disciplina";
    icall.placeholder = "Call da disciplina";
    nom.value = nome;
    nom.id = `opt_name_${k}`;
    isite.id = `opt_site_${k}`;
    icall.id = `opt_call_${k}`;
    const regen_noargs = () => regen();
    nom.addEventListener("change", regen_noargs);
    nom.addEventListener("input", regen_noargs);
    isite.addEventListener("change", regen_noargs);
    isite.addEventListener("input", regen_noargs);
    icall.addEventListener("change", regen_noargs);
    icall.addEventListener("input", regen_noargs);
    tcol.appendChild(inp);
    tcol.appendChild(document.createElement("br"));
    tcol.appendChild(nom);
    tcol.appendChild(document.createElement("br"));
    tcol.appendChild(isite);
    tcol.appendChild(document.createElement("br"));
    tcol.appendChild(icall);
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
function stripes(colors, opts) {
  const angle = opts["stra"];
  const shuf = opts["shuf"];
  const width = opts["strw"];
  if (shuf) {
    shuffle(colors);
  }
  colors = colors.map((c) => rgb2css(hex2rgb(c)));
  let cs = [];
  for (let rems = 1; rems < colors.length; rems++) {
    cs.push(`${colors[rems-1]} ${rems*width}rem`);
    cs.push(`${colors[rems]} ${rems*width}rem`);
  }
  cs.push(`${colors[colors.length-1]} ${colors.length*width}rem`);
  const rlg = "repeating-linear-gradient";
  return `${rlg}(\n  ${angle}deg,\n  ${colors[0]},\n  ${cs.join(",\n  ")}\n)`;
}

// gera propriedade de fundo baseado em cores e opções
function setbg(elem, colors, opts) {
  let alpha = opts["alpha"];
  const strategy = opts["cmix"];
  if (colors.length == 1) {
    alpha = 1.0;
  }
  colors.sort();
  if (strategy == "blend" || colors.length == 1) {
    const color = blend(colors.map((c) => hex2rgba(c, alpha)));
    elem.style.backgroundColor = rgb2css(color);
  } else if (strategy == "stripes") {
    const rcg = stripes(colors, opts);
    elem.style.background = rcg;
  } else {
    throw `bad color strategy ${strategy}`;
  }
}

// remove os nomes
function renomes() {
  for (const cod in g["detalhes"]) {
    const btn = document.getElementById(`opt_name_${cod}`);
    input_set(btn, g["detalhes"][cod]["nome"]);
  }
  regen();
}

// coloca o texto formatado num td
function aulas_fmt(td, codigos, dets, opts) {
  const fmt = opts["fmt"];
  const borr = opts["borr"];
  const sep = opts["sep"];
  let elems = [];
  for (const cod of codigos) {
    let codigo = dets[cod]["codigo"];
    if (sep) {
      codigo = codigo.substring(0, 3) + " " + codigo.substring(3);
    }
    const nome = opts["name_" + cod];
    const fsite = opts["site_" + cod];
    const fcall = opts["call_" + cod];
    const da_aula = document.createElement("span");
    for (const cf of fmt) {
      const e = document.createElement("span");
      const cl = cf.toLowerCase();
      e.innerText = {
        "c": codigo,
        "n": nome,
        "!": "\n",
        "-": " - "
      }[cl];
      if (cf == cl) {
        e.className = "aula_peq";
      } else {
        e.class_name = "aula_normal";
      }
      da_aula.appendChild(e);
    }
    // links
    const linx = document.createElement("span");
    if (fsite) {
      const lsite = document.createElement("a");
      lsite.innerText = "site";
      lsite.target = "_blank";
      lsite.href = fsite;
      linx.appendChild(lsite);
      if (fcall) {
        linx.innerHTML += " · ";
      }
    }
    if (fcall) {
      const lcall = document.createElement("a");
      lcall.href = fcall;
      lcall.target = "_blank";
      lcall.innerText = "call";
      linx.appendChild(lcall);
    }
    if ((fcall || fsite) && !opts["nolinks"]) {
      da_aula.appendChild(document.createElement("br"));
      da_aula.appendChild(document.createTextNode("\n("));
      da_aula.appendChild(linx);
      da_aula.appendChild(document.createTextNode(")"));
    }
    elems.push(() => da_aula);
  }
  elems = interleave(elems, () => document.createElement("hr"));
  const cont = document.createElement("span");
  cont.style.borderRadius = `${borr}rem`;
  for (const elem of elems) {
    cont.appendChild(elem());
  }
  td.appendChild(cont);
}

// redireciona para a página de edição de horário
function edit() {
  const o = compress(JSON.stringify(g));
  window.location.assign(`editor/${sh()}`);
}

// redireciona para a página de edição de disciplinas
function edit_discs() {
  const o = compress(JSON.stringify(g));
  window.location.assign(`editor/disciplinas/${sh()}`);
}

// abre uma nova guia pra imprimir
function imprimir_old() {
  print_element(document.getElementById("mt"));
}

// abre uma nova guia na página de print
function imprimir() {
  const l = window.location;
  const url = `${l.origin}${l.pathname}print/${l.search}${l.hash}`;
  const w = window.open(url, "_blank");
  w.focus();
}

// monta a tabela com o horário
function regen(opts) {
  // sincronizar opções
  if (!opts) {
    opts = opt2obj();
    obj2frag(opts);
  }
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
        let cores = codigos.map((c) => opts[`color_${c}`]);
        cores.sort();
        aulas_fmt(td, codigos, g["detalhes"], opts);
        setbg(td, cores, opts);
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
      if (cell.innerText.length > 0 && opts["nmcl"]) continue;
      if (cell.innerText.length == 0 && opts["nmvz"]) continue;
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
