const canvas = document.getElementById("ruletaCanvas");
const ctx = canvas.getContext("2d");

let numerosRuleta = [];
let anguloActual = 0;
let animacionId = null;
let girando = false;
let ganadorActual = null;


function configurarRuleta(lista, ganador = null) {
    numerosRuleta = lista;
    ganadorActual = ganador;
    dibujarRuleta();
}

function dibujarRuleta() {
    if (numerosRuleta.length === 0) return;

    const total = numerosRuleta.length;
    const radio = canvas.width / 2;
    const centro = radio;
    const anguloPorNumero = (2 * Math.PI) / total;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    numerosRuleta.forEach((numero, i) => {
        const inicio = anguloActual + i * anguloPorNumero;
        const fin = inicio + anguloPorNumero;

        ctx.beginPath();
        ctx.moveTo(centro, centro);
        ctx.arc(centro, centro, radio, inicio, fin);

        // 🎯 Colorear ganador
        if (numero === ganadorActual) {
            ctx.fillStyle = "#00c853"; // verde ganador
        } else {
            ctx.fillStyle = i % 2 === 0 ? "#facc15" : "#fde047";
        }

        ctx.fill();

        // Texto
        ctx.save();
        ctx.translate(centro, centro);
        ctx.rotate(inicio + anguloPorNumero / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.fillText(numero, radio - 10, 5);
        ctx.restore();
    });
}


function girarRuletaHastaGanador(ganador) {
    
    ganadorActual = ganador;
    
    if (girando) return;

    const index = numerosRuleta.indexOf(ganador);
    if (index === -1) return;

    girando = true;
    ganadorActual = null;

    document.getElementById("ruletaContainer").classList.remove("hidden");

    const anguloPorNumero = (2 * Math.PI) / numerosRuleta.length;

    // 🎯 Flecha apunta arriba (-90°)
    const anguloObjetivo =
        (Math.PI * 3 / 2) - (index * anguloPorNumero);

    const vueltas = 6;
    const anguloFinal = vueltas * 2 * Math.PI + anguloObjetivo;

    let velocidad = 0.35;
    const desaceleracion = 0.985;

    function animar() {
        if (anguloActual < anguloFinal) {
            anguloActual += velocidad;
            velocidad *= desaceleracion;
            dibujarRuleta();
            animacionId = requestAnimationFrame(animar);
        } else {
            anguloActual = anguloFinal;
            girando = false;
            ganadorActual = ganador;
            dibujarRuleta(); // 🔥 pinta el ganador
            cancelAnimationFrame(animacionId);
        }
    }

    animar();
}

function resetearRuleta() {
    numerosRuleta = [];
    ganadorActual = null;
    anguloActual = 0;
    girando = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const container = document.getElementById("ruletaContainer");
    if (container) {
        container.classList.add("hidden");
    }
}

function limpiarRuleta() {
    numerosRuleta = [];
    ganadorActual = null;
    anguloActual = 0;
    girando = false;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
