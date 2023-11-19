import {
  db,
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  where,
  query,
} from "./firebase_config.js";

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
  const eventosCollection = collection(db, "eventos");

  const q1 = query(
    eventosCollection,
    where("organizador", "==", usuarioRecuperado.uid.uid)
  );

  const q2 = query(
    eventosCollection,
    where("participantes", "array-contains", usuarioRecuperado.uid.email)
  );

  const q3 = query(
    eventosCollection,
    where("organizador", "!=", usuarioRecuperado.uid.uid)
  );
  const querySnapshot1 = await getDocs(q1);
  const querySnapshot2 = await getDocs(q2);
  const querySnapshot3 = await getDocs(q3);
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

  let botonEdit = document.getElementById("editarEvento");

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
    description: evento.descripcion,
    participantes: evento.participantes,
  };
};

// Metodo que muestra el evento en el calendario
let id = "";
const mostrarEvento = (evento) => {
  id = evento.id;
  const botonDetalles = document.getElementById("detalle-evento-modal");

  document.getElementById("titulo-modal").value = evento.title;
  const fechaInicioFormateada = evento.start.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
  });
  const fechaFinalFormateada = evento.end.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
  });
  document.getElementById("fechaI-modal-1").value = fechaInicioFormateada;
  document.getElementById("fechaF-modal-1").value = fechaFinalFormateada;

  let select = document.getElementById("contenedor-participantes-modal");

  // Limpiar el select antes de agregar nuevos elementos
  select.innerHTML = "";

  evento.extendedProps.participantes.forEach((element) => {
    // Crear un elemento de opción (option)
    const opcion = document.createElement("option");

    // Agregar el valor del participante a la opción
    opcion.value = element;

    // Agregar el texto del participante como contenido de la opción
    opcion.textContent = element;

    // Agregar la opción al select
    select.appendChild(opcion);
  });
  document.getElementById("descripcion-m").value =
    evento.extendedProps.description;

  botonDetalles.click();

  const contenedorParticipantes = document.getElementById(
    "contenedor-participantes-modal"
  );
};

// Evento que añade nuevo participante
$("#agregarParticipantes").on("click", function () {
  let nuevoCampo =
    '<input type="text" class="form-control" placeholder="Ingrese los participantes">';
  $("#contenedor-participantes").append(nuevoCampo);
});

// Evento que se ejecuta al agregar nueva información en el formulario de eventos
document
  .getElementById("formularioEvento")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let titulo = document.getElementById("titulo").value;
    let participantes = document.querySelectorAll(
      "#contenedor-participantes input"
    );
    let fechaInicio = document.getElementById("fechaInicio").value;
    let fechaFinal = document.getElementById("fechaFinal").value;
    let descripcion = document.getElementById("descripcion").value;
    let participantes_array = [];

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

    crear_evento(nuevoEvento);
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
};

// Evento que se ejecuta al agregar nueva información en el formulario de eventos
document
  .getElementById("formularioEventoEdit")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let fechaInicioM = document.getElementById("fechaI-modal-1").value;
    let fechaInicio = document.getElementById("fechaInicio-modal").value;
    let fechaFinal = document.getElementById("fechaFinal-modal").value;

    let titulo = document.getElementById("titulo-modal").value;

    let descripcion = document.getElementById("descripcion-m").value;
    let participantes_array = [];

    // participantes.forEach(function (participante) {
    //     participantes_array.push(participante.value)
    // });

    const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));

    let nuevoEvento = {
      titulo: titulo,
      // participantes: participantes_array,
      fechaInicio: fechaInicio === "" ? fechaInicioM : fechaInicio,
      fechaFinal: fechaFinal,
      descripcion: descripcion,
      organizador: usuarioRecuperado.uid.uid,
    };

    editar_evento(nuevoEvento);
  });

// Metodo que crea eventos nuevos en el calendario
const editar_evento = async (nuevoEvento) => {
  const idEvent = id;
  console.log(idEvent);

  // Obtener el ID del documento que deseas editar
  const eventoId = idEvent;

  // Eliminar la propiedad 'id' del objeto, ya que no se debe actualizar en Firestore
  delete nuevoEvento.id;
  const eventosCollection = collection(db, "eventos");
  updateDoc(doc(eventosCollection, eventoId), nuevoEvento)
    .then(() => {
      alert("El evento se ha editado exitosamente");
      location.reload();
    })
    .catch((error) => {
      console.error("Error al editar el evento:", error);
      alert("Ha ocurrido un error, el evento no se ha editado");
      location.reload();
    });
};

//Metodo que valida que el usuario haya iniciado sesion
const usuarioLogin = () => {
  const usuarioStringRecuperado = localStorage.getItem("usuario");
  const usuarioRecuperado = JSON.parse(usuarioStringRecuperado);

  if (usuarioRecuperado == undefined || usuarioRecuperado == undefined) {
    alert("Debe iniciar sesión para acceder");
    location.href = "../html/ingresar.html";
  }
};

const cerrarSesion = () => {
  localStorage.removeItem("usuario");
  location.href = "../html/ingresar.html";
};

//Evento que ejecuta la funcion usuarioLogin al cargar la pagina
window.addEventListener("load", usuarioLogin);

$("#cerrarSesion").on("click", function () {
  cerrarSesion();
});
