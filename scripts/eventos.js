import { db, collection, addDoc, getDocs, where, query } from "./firebase_config.js";

// Agrega el calendario al iniciar la pagina
document.addEventListener('DOMContentLoaded', async function() {
    usuarioLogin()
    let calendarEl = document.getElementById('calendario');
    const eventos = await obtener_eventos();
    let calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      eventClick: function (info) {
        mostrarEvento(info.event);
    }
    });
    calendar.render();

    eventos.forEach(function (evento) {
        let evento_formateado = agregar_eventos(evento)
        calendar.addEvent(evento_formateado);
    });
    
});

// Consulta los eventos en la base de datos
const obtener_eventos = async() => {
    usuarioLogin()

    const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));
    const eventosCollection = collection(db, 'eventos');
    console.log(usuarioRecuperado.uid.email)

    const q1 = query(eventosCollection, where("organizador", "==", usuarioRecuperado.uid.uid));

    const q2 = query(eventosCollection, where("participantes", "array-contains", "joseaa4@gmail.com"));

    const querySnapshot1 = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);
    console.log(querySnapshot2)
    const eventosUsuario = [];

    querySnapshot1.forEach((doc) => {
        eventosUsuario.push({ id: doc.id, ...doc.data() });
    });

    querySnapshot2.forEach((doc) => {
        // Verificar que el documento no esté duplicado antes de agregarlo
        if (!eventosUsuario.some((evento) => evento.id === doc.id)) {
            eventosUsuario.push({ id: doc.id, ...doc.data() });
        }
    });

    return eventosUsuario;
}

// Crea el objeto del evento que se mostrara en el calendario
const agregar_eventos = (evento) => {
    return {
        title: evento.titulo,
        start: evento.fechaInicio,
        end: evento.fechaFinal,
        description: evento.descripcion,
        id: evento.id,
        participantes: evento.participantes
    };
}
  
// Metodo que muestra el evento en el calendario
const mostrarEvento = (evento) => {
    const botonDetalles = document.getElementById('detalle-evento-modal');

    document.getElementById('titulo-modal').value = evento.title;
    const fechaInicioFormateada = evento.start.toLocaleString("es-CO", { timeZone: "America/Bogota" });
    document.getElementById('fechaI-modal-1').value = fechaInicioFormateada;

    document.getElementById('descripcion').value = evento.description;

    botonDetalles.click();

    const contenedorParticipantes = document.getElementById('contenedor-participantes-modal');
}

// Evento que añade nuevo participante
$('#agregarParticipantes').on('click', function () {
    let nuevoCampo = '<input type="text" class="form-control" placeholder="Ingrese los participantes">';
    $('#contenedor-participantes').append(nuevoCampo);
});

// Evento que se ejecuta al agregar nueva información en el formulario de eventos
document.getElementById("formularioEvento").addEventListener("submit", function (event) {
    event.preventDefault()

    let titulo = document.getElementById("titulo").value;
    let participantes = document.querySelectorAll("#contenedor-participantes input");
    let fechaInicio = document.getElementById("fechaInicio").value;
    let fechaFinal = document.getElementById("fechaFinal").value;
    let descripcion = document.getElementById("descripcion").value;
    let participantes_array = []

    participantes.forEach(function (participante) {
        participantes_array.push(participante.value)
    });

    const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));

    let nuevoEvento = {
        titulo: titulo,
        participantes: participantes_array,
        fechaInicio: fechaInicio,
        fechaFinal: fechaFinal,
        descripcion: descripcion,
        organizador: usuarioRecuperado.uid.uid
    };

    crear_evento(nuevoEvento)
    
});

// Metodo que crea eventos nuevos en el calendario
const crear_evento = (nuevoEvento) => {
    const eventosCollection = collection(db, "eventos");

    addDoc(eventosCollection, nuevoEvento)
        .then((docRef) => {
            alert("El evento se ha agregado exitosamente");
            location.reload();
        })
        .catch((error) => {
            alert("Ha ocurrido un error, el evento no se ha añadido");
            location.reload();
        });
}

//Metodo que valida que el usuario haya iniciado sesion
const usuarioLogin = () => {
    const usuarioStringRecuperado = localStorage.getItem("usuario");
    const usuarioRecuperado = JSON.parse(usuarioStringRecuperado);

    if (usuarioRecuperado==undefined || usuarioRecuperado==undefined){
        alert('Debe iniciar sesión para acceder')
        location.href = '../html/ingresar.html';
    }
    
}

const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    location.href = '../html/ingresar.html';
}

//Evento que ejecuta la funcion usuarioLogin al cargar la pagina
window.addEventListener("load", usuarioLogin);

$('#cerrarSesion').on('click', function () {
    cerrarSesion();
});