/**************************************
 * CONFIGURACIÓN PLANES
 **************************************/

const LIMITE_GRATIS = 100;
const LIMITE_PREMIUM = 100000;

/**************************************
 * ESTADO PREMIUM (SEGURO)
 **************************************/

let esPremium = false;

function cargarPremium() {
    const data = localStorage.getItem("premium");
    if (data) {
        try {
            const p = JSON.parse(data);
            esPremium = p.activo === true;
        } catch {
            esPremium = false;
        }
    }
}

function obtenerLimite() {
    return esPremium ? LIMITE_PREMIUM : LIMITE_GRATIS;
}

/**************************************
 * VARIABLES GLOBALES
 **************************************/

let numeros = new Set();
let numeroGanador = null;
let sorteoRealizado = false;

let intervaloSlot = null;
let ganadorTemporal = null;

/**************************************
 * AGREGAR ITEMS
 **************************************/

function agregarNumerosMasivos() {

    if (sorteoRealizado) return;

    const textarea = document.getElementById("numerosMasivos");
    const texto = textarea.value.trim();

    if (texto === "") {
        alert("No hay items para agregar");
        return;
    }

    const lista = texto.split(/[\n, ]+/);

    if (lista.length > obtenerLimite()) {
        alert(`Límite permitido: ${obtenerLimite()} items`);
        return;
    }

    lista.forEach(item => {
        if (item !== "") {
            numeros.add(item);
        }
    });

    textarea.value = "";
    mostrarLista();
}

/**************************************
 * MOSTRAR LISTA
 **************************************/

function mostrarLista() {
    const listaHTML = document.getElementById("listaNumeros");
    listaHTML.innerHTML = "";

    const arrayNumeros = Array.from(numeros);
    const limiteVisual = 100000;

    arrayNumeros.slice(0, limiteVisual).forEach(num => {
        const li = document.createElement("li");
        li.textContent = num;

        if (num === numeroGanador) {
            li.classList.add("ganador");
        }

        listaHTML.appendChild(li);
    });

    if (arrayNumeros.length > limiteVisual) {
        const li = document.createElement("li");
        li.textContent = `+${arrayNumeros.length - limiteVisual}`;
        li.style.fontWeight = "bold";
        li.style.background = "#e5e7eb";
        listaHTML.appendChild(li);
    }
}

/**************************************
 * REALIZAR SORTEO (SLOT MACHINE)
 **************************************/

function realizarSorteo() {

    if (numeros.size === 0) {
        alert("No hay items para sortear");
        return;
    }

    numeroGanador = null;
    document.getElementById("resultado").innerHTML = "";

    const slotContainer = document.getElementById("slotContainer");
    const slotNumero = document.getElementById("slotNumero");
    const btn = document.querySelector(".btn-sorteo");

    btn.disabled = true;
    slotContainer.classList.remove("hidden");

    const arrayNumeros = Array.from(numeros);
    let index = 0;

    intervaloSlot = setInterval(() => {
        ganadorTemporal = arrayNumeros[index % arrayNumeros.length];
        slotNumero.textContent = ganadorTemporal;
        resaltarTemporal(ganadorTemporal);
        index++;
    }, 60);

    setTimeout(() => {
        clearInterval(intervaloSlot);

        const indiceFinal = Math.floor(Math.random() * arrayNumeros.length);
        numeroGanador = arrayNumeros[indiceFinal];
        sorteoRealizado = true;

        slotNumero.textContent = numeroGanador;
        mostrarLista();

        document.getElementById("resultado").innerHTML =
            `🏆 Item ganador: <strong>${numeroGanador}</strong>`;

        bloquearEdicion();
        guardarEstado();

        btn.disabled = false;
        document.getElementById("btnNuevoSorteo").classList.remove("hidden");

    }, 3000);
}

/**************************************
 * EFECTOS VISUALES
 **************************************/

function resaltarTemporal(valor) {
    const items = document.querySelectorAll("#listaNumeros li");

    items.forEach(li => {
        li.classList.remove("activo");
        if (li.textContent === valor && valor !== numeroGanador) {
            li.classList.add("activo");
        }
    });
}

/**************************************
 * ESTADO LOCAL
 **************************************/

function guardarEstado() {
    const data = {
        numeros: Array.from(numeros),
        numeroGanador,
        sorteoRealizado
    };
    localStorage.setItem("sorteoApp", JSON.stringify(data));
}

function cargarEstado() {

    cargarPremium();
    actualizarPlanUI();

    const data = localStorage.getItem("sorteoApp");
    if (!data) return;

    const estado = JSON.parse(data);

    numeros = new Set(estado.numeros);
    numeroGanador = estado.numeroGanador;
    sorteoRealizado = estado.sorteoRealizado;

    mostrarLista();

    if (sorteoRealizado) {
        bloquearEdicion();
        document.getElementById("resultado").innerHTML =
            `🏆 Item ganador: <strong>${numeroGanador}</strong>`;
        document.getElementById("btnNuevoSorteo").classList.remove("hidden");
    }
}

/**************************************
 * BLOQUEO / RESET
 **************************************/

function bloquearEdicion() {
    ["numerosMasivos", "btnAgregarMasivo", "btnAgregarUno", "btnSortear"]
        .forEach(id => document.getElementById(id)?.setAttribute("disabled", true));
}

function habilitarEdicion() {
    ["numerosMasivos", "btnAgregarMasivo", "btnAgregarUno", "btnSortear"]
        .forEach(id => document.getElementById(id)?.removeAttribute("disabled"));
}

function nuevoSorteo() {
    if (!confirm("¿Desea iniciar un nuevo sorteo?")) return;

    numeros.clear();
    numeroGanador = null;
    sorteoRealizado = false;

    localStorage.removeItem("sorteoApp");

    document.getElementById("resultado").innerHTML = "";
    document.getElementById("listaNumeros").innerHTML = "";
    document.getElementById("numerosMasivos").value = "";
    document.getElementById("slotContainer").classList.add("hidden");
    document.getElementById("slotNumero").textContent = "";
    document.getElementById("btnNuevoSorteo").classList.add("hidden");

    habilitarEdicion();
}

/**************************************
 * UI PREMIUM
 **************************************/

function actualizarPlanUI() {
    const badge = document.getElementById("badgePlan");
    if (!badge) return;

    if (esPremium) {
        badge.textContent = "PLAN PREMIUM";
        badge.className = "badge premium";
    } else {
        badge.textContent = "PLAN GRATIS";
        badge.className = "badge";
    }
}

/**************************************
 * ACTIVACIÓN PREMIUM (MANUAL)
 **************************************/

function activarPremium() {
    localStorage.setItem("premium", JSON.stringify({
        activo: true,
        desde: Date.now()
    }));

    alert("🎉 Premium activado");
    location.reload();
}

function validarCodigo(codigo) {
    const codigosValidos = ["VIP2025", "SORTEO-PRO"];

    if (codigosValidos.includes(codigo)) {
        activarPremium();
    } else {
        alert("Código inválido");
    }
}

/**************************************
 * MODAL PREMIUM
 **************************************/

document.getElementById("btnPremium")?.addEventListener("click", () => {
    document.getElementById("modalPremium").classList.remove("hidden");
});

document.getElementById("btnCerrarModal")?.addEventListener("click", () => {
    document.getElementById("modalPremium").classList.add("hidden");
});

document.getElementById("btnConfirmarPago")?.addEventListener("click", () => {
    activarPremium();
});

/**************************************
 * INIT
 **************************************/


// Cerrar modal si el usuario hace clic fuera del contenido blanco
window.addEventListener("click", (event) => {
    const modal = document.getElementById("modalPremium");
    if (event.target === modal) {
        modal.classList.add("hidden");
    }
});

cargarEstado();
