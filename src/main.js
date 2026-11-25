
import "./style.css"

/* ================= 1. STATO ================= */

const CHIAVE = "todo-tasks"
const CHIAVE_NOME = "todo-nome"

function caricaStato() {
  const testo = localStorage.getItem(CHIAVE)

  if (testo === null) return []

  try {
    const dati = JSON.parse(testo)

    if (!Array.isArray(dati)) return []

    return dati.filter(t =>
      t &&
      typeof t.id === "number" &&
      typeof t.title === "string" &&
      typeof t.completed === "boolean"
    )
  } catch (errore) {
    console.error("Dati salvati non validi:", errore.message)
    return []
  }
}

let tasks = caricaStato()

/* ================= 2. RIFERIMENTI ================= */

const lista = document.querySelector("#lista")
const info = document.querySelector("#info")
const messaggio = document.querySelector("#messaggio")
const azioni = document.querySelector("#azioni")

const form = document.querySelector("#form-task")
const campo = document.querySelector("#campo-task")

const box = document.querySelector("#benvenuto")

/* ================= 3. PERSISTENZA ================= */

function salvaStato() {
  localStorage.setItem(CHIAVE, JSON.stringify(tasks))
}

/* ================= 4. AGGIORNAMENTO STATO ================= */

function aggiornaStato(nuoviTasks) {
  tasks = nuoviTasks
  salvaStato()
  render()
}

/* ================= 5. VIEW ================= */

function render() {

  // Ordinamento: i completati vanno in fondo
  const ordinati = [...tasks].sort(
    (a, b) => Number(a.completed) - Number(b.completed)
  )

  lista.innerHTML = ordinati
    .map(t => `
      <li class="${t.completed ? "fatto" : ""}" data-id="${t.id}">
        <span class="titolo">${escapeHTML(t.title)}</span>
        <button class="elimina" data-id="${t.id}" type="button">×</button>
      </li>
    `)
    .join("")

  // Calcolo dei dati
  const totali = tasks.length
  const completati = tasks.filter(t => t.completed).length
  const restanti = totali - completati

  // Contatore
  info.textContent =
    `Totali: ${totali} · Completati: ${completati} · Da fare: ${restanti}`

  // Messaggio dinamico
  let frase

  if (totali === 0) {
    frase = "Non hai task. Buona giornata."
  } else if (restanti === 0) {
    frase = "Fatto tutto. Complimenti."
  } else {
    frase = `Ti restano ${restanti} task su ${totali}.`
  }

  messaggio.textContent = frase

  // Pulsante per eliminare i completati
  azioni.innerHTML = completati > 0
    ? `<button id="pulisci" type="button">Elimina completati (${completati})</button>`
    : ""
}

/* ================= 6. SICUREZZA TESTI ================= */

function escapeHTML(testo) {
  return testo.replace(/[&<>"']/g, carattere => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[carattere])
}

/* ================= 7. AZIONI ================= */

// Aggiungere un task
function addTask(title) {
  const pulito = title.trim()

  if (pulito === "") return

  const nuovo = {
    id: Date.now(),
    title: pulito,
    completed: false
  }

  aggiornaStato([...tasks, nuovo])
}

// Completare o riaprire un task
function toggleTask(id) {
  aggiornaStato(
    tasks.map(t =>
      t.id === id
        ? { ...t, completed: !t.completed }
        : t
    )
  )
}

// Eliminare un task
function deleteTask(id) {
  aggiornaStato(
    tasks.filter(t => t.id !== id)
  )
}

// Eliminare tutti i task completati
function deleteCompletati() {
  if (!confirm("Elimino tutti i task completati?")) return

  aggiornaStato(
    tasks.filter(t => !t.completed)
  )
}

/* ================= 8. EVENTI DEL FORM ================= */

form.addEventListener("submit", (evento) => {
  evento.preventDefault()

  addTask(campo.value)

  campo.value = ""
  campo.focus()
})

/* ================= 9. EVENT DELEGATION ================= */

// Click sulla lista
lista.addEventListener("click", (evento) => {
  const elemento = evento.target

  // Click sul pulsante elimina
  if (elemento.closest(".elimina")) {
    const pulsante = elemento.closest(".elimina")
    deleteTask(Number(pulsante.dataset.id))
    return
  }

  // Click sulla riga
  const riga = elemento.closest("li")

  if (riga) {
    toggleTask(Number(riga.dataset.id))
  }
})

// Click sul pulsante elimina completati
azioni.addEventListener("click", (evento) => {
  if (evento.target.closest("#pulisci")) {
    deleteCompletati()
  }
})

/* ================= 10. BENVENUTO PERSISTENTE ================= */

function renderBenvenuto() {
  const nome = localStorage.getItem(CHIAVE_NOME)

  if (nome) {
    box.innerHTML = `<p>Bentornato, ${escapeHTML(nome)}!</p>`
    return
  }

  box.innerHTML = `
    <form id="form-nome">
      <input
        type="text"
        id="campo-nome"
        placeholder="Come ti chiami?"
        autocomplete="given-name"
      >
      <button type="submit">Salva</button>
    </form>
  `
}

// Salvataggio del nome
box.addEventListener("submit", (evento) => {
  if (evento.target.id !== "form-nome") return

  evento.preventDefault()

  const valore = document.querySelector("#campo-nome").value.trim()

  if (valore === "") return

  localStorage.setItem(CHIAVE_NOME, valore)

  renderBenvenuto()
})

/* ================= 11. AVVIO ================= */

renderBenvenuto()
render()
