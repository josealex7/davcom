import { db, collection, addDoc, getDocs, updateDoc, where, query, deleteDoc, doc, getDoc } from "./firebase_config.js";

// Agrega el calendario al iniciar la pagina
document.addEventListener("DOMContentLoaded", async function () {
  usuarioLogin();
  let calendarEl = document.getElementById("calendario");
  const eventos = await obtener_eventos();

  let calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    eventClick: function (info) {
      mostrarEvento(info.event);
    },
  });
  calendar.render();

  eventos.forEach(function (evento) {
    let evento_formateado = agregar_eventos(evento);
    calendar.addEvent(evento_formateado);
  });
});

// Consulta los eventos en la base de datos
const obtener_eventos = async () => {
  usuarioLogin();

    const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));
    const eventosCollection = collection(db, 'eventos');

  const q1 = query(
    eventosCollection,
    where("organizador", "==", usuarioRecuperado.uid.uid)
  );

  const q2 = query(
    eventosCollection,
    where("participantes", "array-contains", usuarioRecuperado.uid.email)
  );

    const querySnapshot1 = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);
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

  let botonEdit = document.getElementById("editar-evento");

  if (querySnapshot1.size > 0) {
    console.log("somos iguales");

    botonEdit.style.display = "block";
  } else {
    console.log("no iguales");

    botonEdit.style.display = "none";
  }
  return eventosUsuario;
};

// Crea el objeto del evento que se mostrara en el calendario
const agregar_eventos = (evento) => {
    return {
        id: evento.id,
        title: evento.titulo,
        start: evento.fechaInicio,
        end: evento.fechaFinal,
        description: evento.descripcion
    };
}
  
// Evento que añade nuevo participante
$("#agregarParticipantes").on("click", function () {
  let nuevoCampo =
    '<input type="text" class="form-control" placeholder="Ingrese los participantes">';
  $("#contenedor-participantes").append(nuevoCampo);
});

// Evento que se ejecuta al agregar nueva información en el formulario de eventos
document.getElementById("formularioEvento").addEventListener("submit", function (event) {
    event.preventDefault()
    let titulo = document.getElementById("titulo").value;
    let participantes = document.querySelectorAll(
      "#contenedor-participantes input"
    );
    let fechaInicio = document.getElementById("fechaInicio").value;
    let fechaFinal = document.getElementById("fechaFinal").value;
    let descripcion = document.getElementById("descripcion").value;
    let participantes_array = []
    participantes.forEach(function (participante) {
      participantes_array.push(participante.value);
    });
    const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));
    let nuevoEvento = {
      titulo: titulo,
      participantes: participantes_array,
      fechaInicio: fechaInicio,
      fechaFinal: fechaFinal,
      descripcion: descripcion,
      organizador: usuarioRecuperado.uid.uid,
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


// Metodo que muestra el evento en el calendario
const mostrarEvento = async(evento) => {
    document.getElementById('titulo-modal').value = evento.title;
    document.getElementById('fechaI-modal-1').value = evento.start.toLocaleString("es-CO", { timeZone: "America/Bogota" });
    document.getElementById('fechaF-modal-2').value = evento.end.toLocaleString("es-CO", { timeZone: "America/Bogota" });
    document.getElementById('id-evento-show').value = evento.id;
    let evento_participantes = await obtenerParticipantes(evento.id);
    let participantes = "";
    evento_participantes.participantes.forEach(participante => {
        participantes += participante + " - "
    });
    document.getElementById('descripcion-modal').value = evento_participantes.descripcion
    document.getElementById('contenedor-participantes-modal').value = participantes;
    const botonDetalles = document.getElementById('detalle-evento-modal');
    botonDetalles.click();
}

const obtenerParticipantes = async (id) => {
    const eventosCollection = collection(db, 'eventos');
    const q1 = query(eventosCollection, where("__name__", '==', id));
    const querySnapshot1 = await getDocs(q1);
    let evento;
    querySnapshot1.forEach((doc) => {
        evento = doc.data();
    });
    return evento
}

const eliminarEvento = async (id) => {
    const eventosCollection = collection(db, 'eventos');
    try {
        // Obtiene una referencia al documento que quieres eliminar
        const eventoRef = doc(eventosCollection, id);

        // Elimina el documento
        await deleteDoc(eventoRef);
        alert('Evento cancelado correctamente');
        location.reload();
    } catch (error) {
        alert('Error al cancelar el evento:', error);
    }
};
// Agrega un listener al botón de "Editar"
const editar_evento = async() => {    
    event.preventDefault();
    let idEvento = document.getElementById("id-evento-show").value;
    let titulo = document.getElementById("titulo-modal").value;
    let fechaInicio = document.getElementById("fechaInicio-modal").value;
    let fechaFinal = document.getElementById("fechaFinal-modal").value;
    let descripcion = document.getElementById("descripcion-modal").value;

    const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));

    // Obtén el documento actual del evento
    const eventoRef = doc(collection(db, 'eventos'), idEvento);
    const eventoSnapshot = await getDoc(eventoRef);

    if (eventoSnapshot.exists()) {
        // Obten la información actual del documento
        const eventoActual = eventoSnapshot.data();

        // Actualiza solo los campos que han cambiado
        const eventoActualizado = {
            titulo: titulo || eventoActual.titulo,
            participantes: eventoActual.participantes,
            fechaInicio: fechaInicio || eventoActual.fechaInicio,
            fechaFinal: fechaFinal || eventoActual.fechaFinal,
            descripcion: descripcion || eventoActual.descripcion,
            organizador: eventoActual.organizador
        };

        try {
            // Actualiza el documento en Firestore
            await updateDoc(eventoRef, eventoActualizado);
            alert('Evento actualizado correctamente');
            location.reload();
        } catch (error) {
            console.error('Error al actualizar el evento:', error);
        }
    } else {
        console.log('El evento no existe');
    }
};


//Metodo que valida que el usuario haya iniciado sesion
const usuarioLogin = () => {
    const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioRecuperado==undefined || usuarioRecuperado==undefined){
        alert('Debe iniciar sesión para acceder')
        location.href = '../html/ingresar.html';
    }
}

const cerrarSesion = () => {
  localStorage.removeItem("usuario");
  location.href = "../html/ingresar.html";
};

//Evento que ejecuta la funcion usuarioLogin al cargar la pagina
window.addEventListener("load", usuarioLogin);

$("#cerrarSesion").on("click", function () {
  cerrarSesion();
});

$('#cancelar-evento').on('click', function () {
    let id = document.getElementById('id-evento-show').value
    eliminarEvento(id);
});

$('#editar-evento').on('click', function(){
    console.log('hol')
    event.preventDefault();
    editar_evento();
});