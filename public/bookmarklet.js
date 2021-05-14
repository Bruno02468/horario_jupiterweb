// bookmarklet.js
// borges 2021 - nenhum direito reservado
// código original da bookmarklet

// algoritmo de compressão LZString, minificado pra caber em ~1.5 kB
// thanks, @pieroxy
function compress(o) {
  const _compress = function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")}
  const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  return null==o?"":_compress(o,6,function(o){return e.charAt(o)})
}

// certifica que estamos na página certa.
function ensure_url(tgt) {
  if (location.href != tgt) {
    alert(
      "Este script deve ser rodado na página de grade horária!\n\n" +
      "Você será redirecionado para lá. Rode de novo quando abrir a grade..."
    );
    location.assign(tgt);
    return false;
  }
  return true;
}

// certifica que uma grade esteja aberta
function ensure_tables() {
  const base = document.getElementById("gbox_tableGradeHoraria");
  if (!base) {
    alert(
      "Não consegui achar uma grade horária aberta!\n\n" +
      "Abra uma e rode a bookmarklet novamente..."
    );
    return null;
  }
  return base;
}

// função auxiliar para entrar em elementos profundos
function inner(elem, arr) {
  for (const i of arr) {
    elem = elem.children[i];
  }
  return elem;
}

// função auxiliar usada para esperar
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// pega os detalhes da disciplina da página de detalhes (aquela que aparece
// quando você clica na aula)
async function get_deets(anchor, delay, attempts) {
  const dd = () => document.getElementById("div_disciplina");
  const cod = () => dd().getElementsByClassName("coddis")[0].innerText;
  const nom = () => dd().getElementsByClassName("nomdis")[0].innerText;
  let cod_antes;
  try {
    cod_antes = cod();
  } catch (e) {
    cod_antes = null;
  }
  for (let i = 0; i < attempts; i++) {
    anchor.click();
    await sleep(delay);
    const cod_depois = cod();
    const nome_depois = nom();
    if (cod_depois != cod_antes) {
      return {
        "codigo": cod_depois,
        "nome": nome_depois
      };
    }
    await sleep(delay);
  }
  alert(`Falha ao pegar nome e código da disciplina ${anchor.innerText}!`)
  window.location.reload();
}

// extrai o json para enviar a partir de uma tabela
async function tab2json(base, delay, attempts) {
  // passo 1: extrair os dias da semana
  const cdays = inner(base, [2, 1, 0, 0, 0, 2]).cells;
  const days = Array.from(cdays).map((td) => td.innerText.trim()).slice(2);
  // passo 2: extrair as aulas por linha
  const gh = inner(base, [2, 2, 0, 1, 0]);
  let inf = {}, classes = [];
  for (const tr of gh.rows) {
    if (!tr.id) continue;
    let start = null, end = null, iday = -2;
    for (const td of tr.cells) {
      const txt = td.innerText.trim();
      if (!start) {
        start = txt;
      } else if (!end) {
        end = txt;
      } else if (txt) {
        const day = days[iday];
        for (const anchor of td.children) {
          const atxt = anchor.innerText.trim();
          const cod = atxt.substring(0, 7);
          classes.push({
            "codigo": cod,
            "dia": day,
            "inicio": start,
            "fim": end
          });
          if (!(cod in inf)) {
            // pegar os detalhes dessa disciplina
            inf[cod] = await get_deets(anchor, delay, attempts);
          }
        }
      }
      iday++;
    }
  }
  return {
    "aulas": classes,
    "detalhes": inf,
    "ver": 1
  };
}

// comprime o json com LZ77 e redireciona para o meu site
function credir(obj, home) {
  const s = JSON.stringify(obj);
  const enc = compress(s);
  const url = home + "?o=" + enc;
  location.assign(url);
}


// função principal da bookmarklet
async function fire() {
  // todas as constantes que regem o funcionamento do script
  const tgt = "https://uspdigital.usp.br/jupiterweb/gradeHoraria?codmnu=4759";
  const home = "http://oisumida.rs/horario_jupiterweb/";
  const click_delay = 1000;
  const max_deets_attempts = 5;
  // sequência de eventos: certificar, puxar, comprimir, e redirecionar
  if (!ensure_url(tgt)) return false;
  const base = ensure_tables();
  if (!base) return false;
  const obj = await tab2json(base, click_delay, max_deets_attempts);
  if (!obj) throw "objeto retornou vazio (off)";
  credir(obj, home);
}

// wrapper seguro para avisar o usuário caso dê ruim
function safe_main() {
  try {
    fire();
  } catch (err) {
    // um erro aqui teoricamente não seria culpa do usuário
    alert("Deu ruim! Repasse o seguinte erro:\n\n" + err.message);
  }
}

safe_main();
