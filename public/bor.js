// bookmarklet.js
// borges 2021 - nenhum direito reservado
// script principal da página

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
  } else {
    document.getElementById("has_enc").style.display = "none";
  }
}

hide_correct();
