// print.js
// borges 2021 - nenhum direito reservado
// apenas mostra o horário, pra imprimir, mandar link ou tirar print

// ponto de entrada
function print_here() {
  g = extract();
  const opts = frag2obj();
  regen(opts);
  document.body.style.margin = "3rem";
  document.body.style.textAlign = "center";
}

// gera um link encurtado para cá
function mkshort(btn) {
  btn.innerText = "Espera um pouco...";
  setTimeout(() => btn.innerText = "Aguenta as pontas...", 2500);
  setTimeout(() => btn.innerText = "Tá chegando...", 4500);
  setTimeout(() => btn.innerText = "Quase lá...", 6500);
  setTimeout(() => btn.innerText = "Se prepara...", 8500);
  shorten_link(window.location.href, gotlink);
}

// quando temos o link de volta...
function gotlink(linky) {
  const inp = document.createElement("input");
  inp.type = "text";
  inp.readOnly = true;
  inp.style.fontWeight = "bold";
  inp.style.width = "100%";
  inp.style.textAlign = "center";
  inp.value = linky;
  inp.addEventListener("focus", () => inp.select());
  inp.addEventListener("click", () => inp.select());
  inp.addEventListener("mouseover", () => inp.select());
  const tgt = document.getElementById("link_tgt");
  tgt.children[0].style.display = "none";
  tgt.appendChild(inp);
  inp.select();
}

// volta para a edição
function goback() {
  window.location.assign(`../${sh()}`);
}
