// bookmarklet.js
// borges 2021 - nenhum direito reservado
// script principal da página

// armazenado globalmente para não termos que descomprimir toda vez
let g = null;

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

// função auxiliar -- descomprime o JSON usando lz-string
function decomp(s) {
  return LZString.decompressFromEncodedURIComponent(s);
}

// extrai o objeto da URL
function extract(dbg) {
  const o = new URLSearchParams(window.location.search).get("o");
  if (!o) return null;
  const d = decomp(o);
  const a = o.length, b = d.length;
  if (dbg)
    console.log(
      `Compressão encolheu o JSON em ~${Math.round(100-100*a/b)}%!`,
      `(de ${b} para ${a} bytes)`
    );
  return JSON.parse(d);
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
  color_random();
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
    txt.innerText = `${codigo} - ${nome}`;
    inp.type = "color";
    inp.id = "in_color_" + k;
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
    el.children[col].appendChild(inp);
    el.children[col].appendChild(txt);
    el.children[col].appendChild(document.createElement("br"));
    col = (col + 1) % 3
  }
}

// converte horário XX:XX para minutos totais
function hor2int(hor) {
  const hre = /(\d{2}):(\d{2})/;
  const match = hor.match(hre);
  return match[1]*60 + match[2];
}

// converte minutos totais de volta para horário XX:YY
// "evil" deixa o horário no formato americano do mal: AM/PM sem zero antes
function int2hor(mins, evil) {
  const h = Math.floor(mins/60);
  const m = Math.round(mins - h*60).toFixed(0);
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

// recoloca as aulas por dia e hora de início
function reloc(gg) {
  let obj = {};
  let hors = [];
  for (const aula of gg["aulas"]) {
    const inicio = hor2int(aula["inicio"]);
    const fim = hor2int(aula["fim"]);
    if (!(inicio in hors)) hors.push(inicio);
    if (!(fim in hors)) hors.push(inicio);
    let dia = aula["dia"];
    if (!(dia in obj)) obj[dia] = {};
    obj[dia][inicio] = aula;
  }
  hors = [...Set(hors)];
  hors.sort();
  return [hors, obj];
}

// monta a tabela com o horário
function regen() {
  // puxar opções
  const prop = document.getElementById("opt_prop").value == "checked";
  const sep = document.getElementById("opt_sep").value == "checked";
  const evil = document.getElementById("opt_evil").value == "checked";
  const fmt = document.getElementById("opt_show").value;
  const wd_show = document.getElementById("opt_fday").value;
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
    const th = document.createElement("th");
    th.innerText = DIAS[wd_show][dia];
    thr.appendChild(th);
  }
  mh.appendChild(thr);
  // gerar corpo
  const hors, pd = reloc(g);
  for (const i = 0; i < hors.length - 1; i++) {
    const inicio = hors[i];
    const fim = hors[i+1];
    const ti = int2hor(inicio, evil);
    const tf = int2hor(fim, evil);
    const tr = document.createElement("tr");
    const hb = document.createElement("td");
    hb.innerText = `${ti} - ${tf}`;
    hb.className = "timeslot";
    tr.appendChild(hb);
  }
}
