// geral.js
// borges 2021 - nenhum direito reservado
// funções auxiliares comuns

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
function compress(o) {
  const _compress = function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")}
  const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
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

// função comparadora entre aulas, para ordenar
function cmpa(a, b) {
  const d = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  if (a["dia"] != b["dia"]) {
    return d.indexOf(a["dia"]) - d.indexOf(b["dia"]);
  } else if (a["inicio"] != b["inicio"]) {
    return hor2int(a["inicio"]) - hor2int(b["inicio"]);
  } else {
    return hor2int(a["fim"]) - hor2int(b["fim"]);
  }
}

// extrai o objeto da URL, e insere alguns detalhes adicionais
function extract(dbg) {
  const o = new URLSearchParams(window.location.search).get("o");
  if (!o) return null;
  const d = decomp(o);
  const a = bytelen(o), b = bytelen(d);
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
  obj["aulas"] = obj["aulas"].sort(cmpa);
  return obj;
}

// função auxiliar: embaralha uma array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
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

// abre uma nova guia para imprimir algum elemento
function print_element(elem) {
  const fp = window.location.origin + window.location.pathname;
  const nw = window.open();
  nw.document.write(elem.outerHTML);
  nw.document.head.innerHTML = document.head.innerHTML;
  nw.document.title = "Horário";
  nw.document.body.style.margin = "3rem";
  nw.focus();
}
