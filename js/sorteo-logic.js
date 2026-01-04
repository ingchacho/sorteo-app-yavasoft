let esPremium = localStorage.getItem("premium") === "true";

let numeros = new Set();
let numeroGanador = null;
let sorteoRealizado = false;

let intervaloSlot = null;
let ganadorTemporal = null;


function agregarNumerosMasivos() {
    
    if (sorteoRealizado) return;

    const texto = document.getElementById("numerosMasivos").value.trim();
    if (texto === "") {
        alert("No hay números para agregar");
        return;
    }

    const lista = texto.split(/[\n, ]+/);

    if (!esPremium && numeros.size + lista.length > 100) {
        alert("Versión gratuita permite hasta 100 items.\nActualiza a Premium 🚀");
        return;
    }

    lista.forEach(num => {
        if (num !== "") {
            numeros.add(num);
        }
    });

    document.getElementById("numerosMasivos").value = "";
    mostrarLista();
}

function mostrarLista() {
    const lista = document.getElementById("listaNumeros");
    lista.innerHTML = "";

    const arrayNumeros = Array.from(numeros);
    const limite = 100000;

    arrayNumeros.slice(0, limite).forEach(num => {
        const li = document.createElement("li");
        li.textContent = num;

        // Resaltar si es el ganador
        if (num === numeroGanador) {
            li.classList.add("ganador");
        }

        lista.appendChild(li);
    });

    if (arrayNumeros.length > limite) {
        const li = document.createElement("li");
        li.textContent = `+${arrayNumeros.length - limite}`;
        li.style.fontWeight = "bold";
        li.style.background = "#e5e7eb";
        lista.appendChild(li);
    }

}

function realizarSorteo() {
    if (numeros.size === 0) {
        alert("No hay items para sortear");
        return;
    }


    numeroGanador = null;
    document.getElementById("resultado").innerHTML = "";
    document.getElementById("slotContainer").classList.add("hidden");
    document.getElementById("slotNumero").textContent = "";





    const btn = document.querySelector(".btn-sorteo");
    const slot = document.getElementById("slotContainer");
    const slotNumero = document.getElementById("slotNumero");

    btn.disabled = true;
    slot.classList.remove("hidden");

    const arrayNumeros = Array.from(numeros);
    let index = 0;

    intervaloSlot = setInterval(() => {
        ganadorTemporal = arrayNumeros[index % arrayNumeros.length];
        slotNumero.textContent = ganadorTemporal;

        resaltarTemporal(ganadorTemporal);

        index++;
    }, 60);

    // ⏱ Detener animación y elegir ganador
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

function resaltarTemporal(valor) {
    const items = document.querySelectorAll("#listaNumeros li");

    items.forEach(li => {
        li.classList.remove("activo");

        if (li.textContent === valor && valor !== numeroGanador) {
            li.classList.add("activo");
        }
    });
}


function guardarEstado() {
    const data = {
        numeros: Array.from(numeros),
        numeroGanador,
        sorteoRealizado
    };

    localStorage.setItem("sorteoApp", JSON.stringify(data));
}

function cargarEstado() {
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

function bloquearEdicion() {
    document.getElementById("numerosMasivos")?.setAttribute("disabled", true);
    document.getElementById("btnAgregarMasivo")?.setAttribute("disabled", true);
    document.getElementById("btnAgregarUno")?.setAttribute("disabled", true);
    document.getElementById("btnSortear")?.setAttribute("disabled", true);
}

function habilitarEdicion() {
    document.getElementById("numerosMasivos")?.removeAttribute("disabled");
    document.getElementById("btnAgregarMasivo")?.removeAttribute("disabled");
    document.getElementById("btnAgregarUno")?.removeAttribute("disabled");
    document.getElementById("btnSortear")?.removeAttribute("disabled");
}


function nuevoSorteo() {
    if (!confirm("¿Desea iniciar un nuevo sorteo? Se perderán los datos actuales.")) {
        return;
    }

    // Reset estado
    numeros.clear();
    numeroGanador = null;
    sorteoRealizado = false;

    localStorage.removeItem("sorteoApp");

    document.getElementById("resultado").innerHTML = "";
    document.getElementById("listaNumeros").innerHTML = "";
    document.getElementById("numerosMasivos").value = "";
    habilitarEdicion();
    document.getElementById("slotContainer").classList.add("hidden");
    document.getElementById("slotNumero").textContent = "";
    document.getElementById("btnNuevoSorteo").classList.add("hidden");

}

function scrollAlGanador() {
    const items = document.querySelectorAll("#listaNumeros li");

    items.forEach(li => {
        if (li.textContent === numeroGanador) {
            li.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    });
}



function animarSlot(numerosArray, ganador, callback) {
    const slot = document.getElementById("slotNumero");
    const contenedor = document.getElementById("slotContainer");

    contenedor.classList.remove("hidden");

    let ciclos = 0;
    const maxCiclos = 25;

    const intervalo = setInterval(() => {
        const random =
            numerosArray[Math.floor(Math.random() * numerosArray.length)];

        slot.textContent = random;
        ciclos++;

        if (ciclos >= maxCiclos) {
            clearInterval(intervalo);
            slot.textContent = ganador;
            callback();
        }
    }, 100);
}


function animarSeleccion(arrayNumeros, ganador, callback) {
    const items = document.querySelectorAll("#listaNumeros li");
    const slot = document.getElementById("slotBox");
    const slotNumero = document.getElementById("slotNumero");

    let index = 0;
    let ciclos = 0;
    const maxCiclos = 3; // vueltas completas
    const velocidad = 60;

    slot.classList.remove("hidden");

    const intervalo = setInterval(() => {

        // limpiar estados
        items.forEach(li => li.classList.remove("activo"));

        const actual = arrayNumeros[index];
        slotNumero.textContent = actual;

        // resaltar en grid
        const liActual = [...items].find(li => li.textContent === actual);
        if (liActual) {
            liActual.classList.add("activo");
            liActual.scrollIntoView({ block: "center", behavior: "smooth" });
        }

        index++;

        if (index >= arrayNumeros.length) {
            index = 0;
            ciclos++;
        }

        // detener en el ganador
        if (ciclos >= maxCiclos && actual === ganador) {
            clearInterval(intervalo);

            items.forEach(li => li.classList.remove("activo"));

            if (liActual) {
                liActual.classList.add("ganador");
            }

            callback();
        }

    }, velocidad);
}

function actualizarPlanUI() {
    const badge = document.getElementById("badgePlan");
    if (esPremium) {
        badge.textContent = "PLAN PREMIUM";
        badge.className = "badge premium";
    }
}

function activarPremium() {
    localStorage.setItem("premium", "true");
    esPremium = true;
    actualizarPlanUI();
    alert("🎉 Premium activado");
}

function validarCodigo(codigo) {
    const codigosValidos = ["VIP2025", "SORTEO-PRO"];
    if (codigosValidos.includes(codigo)) {
        localStorage.setItem("premium", "true");
        location.reload();
    } else {
        alert("Código inválido");
    }
}

cargarEstado();

