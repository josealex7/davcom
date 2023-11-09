import { db, collection, addDoc, getDocs } from "./firebase_config.js";

document.addEventListener('DOMContentLoaded', async function() {
    let calendarEl = document.getElementById('calendario');
    const eventos = await obtener_eventos();
    let calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      eventClick: function (info) {
        miFuncionPersonalizada(info.event);
    }
    });
    console.log(eventos)
    calendar.render();

    eventos.forEach(function (evento) {
        let evento_formateado = agregar_eventos(evento)
        calendar.addEvent(evento_formateado);
    });
    
  });

const obtener_eventos = async() => {
    const usuariosCollection = collection(db, 'eventos');
    const querySnapshot = await getDocs(usuariosCollection);
    
    let eventos_usuario = []

    querySnapshot.forEach((doc) => {
        eventos_usuario.push({id: doc.id, ...doc.data()});
    });

    return eventos_usuario
}

const agregar_eventos = (evento) => {
    console.log(evento.participantes)
    return {
        title: evento.titulo,
        start: evento.fechaInicio,
        end: evento.fechaInicio,
        description: evento.descripcion,
        id: evento.id,
        participantes: evento.participantes
    };
}
  

const miFuncionPersonalizada = (evento) => {
    const botonDetalles = document.getElementById('detalle-evento-modal');
    console.log('Clic en evento:', evento.participantes);

    document.getElementById('titulo-modal').value = evento.title;
    document.getElementById('fechaInicio-modal').value = evento.start;
    document.getElementById('fechaFinal-modal').value = evento.end;
    document.getElementById('descripcion').value = evento.description;

    botonDetalles.click();

    const contenedorParticipantes = document.getElementById('contenedor-participantes-modal');

    
}

$(document).ready(function () {
    $('#agregarParticipantes').on('click', function () {
        let nuevoCampo = '<input type="text" class="form-control" placeholder="Ingrese los participantes">';
        $('#contenedor-participantes').append(nuevoCampo);
    });
});

document.getElementById("formularioEvento").addEventListener("submit", function (event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto

    // Obtener los valores de los campos
    let titulo = document.getElementById("titulo").value;
    let participantes = document.querySelectorAll("#contenedor-participantes input");
    let fechaInicio = document.getElementById("fechaInicio").value;
    let fechaFinal = document.getElementById("fechaFinal").value;
    let descripcion = document.getElementById("descripcion").value;
    let participantes_array = []

    participantes.forEach(function (participante) {
        participantes_array.push(participante.value)
    });

    
    let nuevoEvento = {
        titulo: titulo,
        participantes: participantes_array,
        fechaInicio: fechaInicio,
        fechaFinal: fechaFinal,
        descripcion: descripcion
    };

    crear_evento(nuevoEvento)
    
});

const crear_evento = (nuevoEvento) => {
    const eventosCollection = collection(db, "eventos");

    addDoc(eventosCollection, nuevoEvento)
        .then((docRef) => {
            // Detectar cuando la ventana emergente se cierra
            alert("El evento se ha agregado exitosamente");
            location.reload();
        })
        .catch((error) => {
            alert("Ha ocurrido un error, el evento no se ha añadido");
            location.reload();
        });
}