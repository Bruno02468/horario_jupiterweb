// disc.js
// borges 2022 -- nenhum direito reservado
// script da página de editar disciplinas

// cada formulário vai ficar aqui
let forms = [];

// contador global para gerar IDs para os mini-forms...
let incr = 0;

// armazenando o objeto no escopo global de novo...
let g = null;

// onde ficarão os formulários
const idiscs = document.getElementById("idiscs");

// insere uma linha nos formulários
function add_line(old_code, old_name) {
  const form = document.createElement("div");
  const nid = incr;
  incr++;
  form.id = "disc_" + nid;
  const in_code = document.createElement("input");
  in_code.type = "text";
  const in_old_code = document.createElement("input");
  in_old_code.type = "hidden";
  const in_name = document.createElement("input");
  in_name.type = "text";
  if (old_code) {
    in_code.value = old_code;
    in_old_code.value = old_code;
  }
  if (old_name) {
    in_name.value = old_name;
  }
  const delbtn = document.createElement("button");
  delbtn.setAttribute("nid", nid);
  delbtn.innerText = "Remover";
  delbtn.addEventListener("click", function(evt) {
    del_line(evt.target.getAttribute("nid"));
  });
  form.appendChild(in_code);
  form.appendChild(in_name);
  form.appendChild(delbtn);
  form.appendChild(in_old_code);
  idiscs.appendChild(form);
  forms.push({
    "form": form,
    "in_name": in_name,
    "in_code": in_code,
    "in_old_code": in_old_code,
    "delbtn": delbtn
  });
}

// remove uma linha
function del_line(nid) {
  const form = forms[nid];
  const oldcode = form["in_old_code"].value;
  if (oldcode) {
    if (!confirm("Essa disciplina aparece no horário. Tem certeza?")) {
      return;
    }
    g["aulas"] = g["aulas"].filter(function(v, i, a) {
      return v["codigo"] != oldcode;
    });
  }
  form.remove();
  forms.splice(nid, 1);
}

// carrega as aulas do json pro formulário
function init_forms() {
  g = extract();
  for (const disc of g["detalhes"]) {
    add_line(disc["codigo"], disc["nome"]);
  }
}

// reseta alterações de volta pro json
function reset() {
  let form;
  while (form = forms.pop()) {
    form["form"].remove();
  }
  init_fields();
}

// "aplica" os formulários no g atual
function capture_forms() {
  let subst = {};
  for (const form of forms) {
    const old_code = form["in_old_code"].value;
    const code = form["in_code"].value;
    const name = form["in_name"].value;
    g["detalhes"][codigo] = {
      "codigo": code,
      "nome": name
    };
    if (old_code) {
      subst[old_code] = code;
    }
  }
  for (const [old_code, new_code] of Object.entries(subst)) {
    g["aulas"] = g["aulas"].map(function(v, i, a) {
      if (v["codigo"] == old_code) {
        v["codigo"] = new_code;
      }
      return v;
    })
  }
}

// ação de botão: volta
function givei() {
  g = extract();
  window.location.assign(`../${sh()}`);
}

// ação de botão: salva e volta
function commit() {
  commit_forms();
  const o = compress(JSON.stringify(g));
  window.location.assign("../?o=" + o + window.location.hash);
}

init_fields();
