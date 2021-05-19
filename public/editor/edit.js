// edit.js
// borges 2021 -- nenhum direito reservado
// script da página de edição

// todos os elementos contendo os formulários vão ficar aqui...
let fields = [];

// contador global para gerar IDs para os mini-forms...
let incr = 0;

// armazenando o objeto no escopo global de novo...
let g = null;

// gera um select de disciplinas
function gen_sel_disc(gg) {
  const code_select = document.createElement("select");
  for (const cod in gg["detalhes"]) {
    const option = document.createElement("option");
    option.value = cod;
    const det = gg["detalhes"][cod];
    option.innerText = `${det["codigo"]} - ${det["nome"]}`;
    code_select.appendChild(option);
  }
  return code_select;
}

// gera um select de dias da semana
function gen_sel_day(gg) {
  const day_select = document.createElement("select");
  for (const k in DIAS["coloquial"]) {
    const option = document.createElement("option");
    option.value = k;
    option.innerText = DIAS["coloquial"][k];
    day_select.appendChild(option);
  }
  return day_select;
}

// gera um input de horário
function gen_input_time() {
  const inp = document.createElement("input");
  inp.type = "time";
  inp.pattern = "\\d{2}:\\d{2}";
  inp.step = 60;
  inp.value = "08:00";  
  return inp;
} 

// insere um campo na lista!
function add_field() {
  const container = document.createElement("div");
  const sel_disc = gen_sel_disc(g);
  const sel_day = gen_sel_day(g);
  const inp_start = gen_input_time();
  const inp_end = gen_input_time();
  const rem = document.createElement("button");
  rem.text = "Remover";
  container.appendChild(sel_disc);
  container.appendChild(sel_day);
  container.appendChild(inp_start);
  container.appendChild(inp_end);
  container.appendChild(rem);
  container.className = "row";
  rem.innerText = "Remover";
  let obj = {
    "container": container,
    "sel_disc": sel_disc,
    "sel_day": sel_day,
    "inp_start": inp_start,
    "inp_end": inp_end,
    "rem": rem,
    "id": incr
  };
  rem.addEventListener("click", remove_field_btn);
  rem.setAttribute("incr", incr);
  fields.push(obj);
  document.getElementById("iaulas").appendChild(container);
  incr++;
  return obj;
}

// remove um campo da lista (chamado pelo botão)
function remove_field(incremental_id) {
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    if (field["id"] == incremental_id) {
      fields.splice(index, 1);
      field["container"].remove();
      console.log(index, "removido", incremental_id)
      return true;
    }
  }
  throw "falha ao remover " + incremental_id;
  return false;
}

// remove um campo da lista de acordo com o botão
function remove_field_btn(evt) {
  const btn = evt.target;
  console.log(btn);
  remove_field(btn.getAttribute("incr"));
}


// inicializa os campos para editar a brincadeira
function init_fields() {
  g = extract();
  for (const aula of g["aulas"]) {
    const field = add_field();
    field["sel_disc"].value = aula["codigo"];
    field["sel_day"].value = aula["dia"];
    field["inp_start"].value = aula["inicio"];
    field["inp_end"].value = aula["fim"];
  }
}

// captura os valores dos campos num novo vetor aulas
function capture_fields() {
  let aulas = [];
  for (const field of fields) {
    aulas.push({
      "codigo": field["sel_disc"].value,
      "dia": field["sel_day"].value,
      "inicio": field["inp_start"].value,
      "fim": field["inp_end"].value
    });
  }
  return aulas;
}

// ação de botão: reseta alterações
function reset() {
  let field;
  while (field = fields.pop()) {
    field["container"].remove();
  }
  init_fields();
}

// ação de botão: volta
function givei() {
  window.location.assign(`../${sh()}`);
}

// ação de botão: salva e volta
function commit() {
  g["aulas"] = capture_fields();
  const o = compress(JSON.stringify(g));
  window.location.assign("../?o=" + o + window.location.hash);
}

init_fields();
