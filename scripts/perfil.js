import { db, collection, addDoc, getDocs, where, query, deleteDoc, doc, updateDoc } from "./firebase_config.js";

function loadImage(event) {
    const profileImage = document.getElementById("profile-image");

    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profileImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}


// Obtén la información del usuario desde Firestore
const cargarDatosUsuario = async () => {
    try {
        const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));
        const usuarioId = usuarioRecuperado.uid.uid;

        const usuariosCollection = collection(db, 'usuarios');
        const q = query(usuariosCollection, where("usuario_id", "==", usuarioId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const usuario = querySnapshot.docs[0].data();

            // Rellena el formulario con los datos del usuario
            document.getElementById("nombre").value = usuario.nombre || '';
            document.getElementById("apellido").value = usuario.apellido || '';
            document.getElementById("edad").value = usuario.edad || '';
            document.getElementById("lugar-nacimiento").value = usuario.lugar_nacimiento || '';
            document.getElementById("genero").value = usuario.genero || '';
            document.getElementById("correo").value = usuario.correo || '';
            document.getElementById("telefono").value = usuario.telefono || '';
            document.getElementById("telefono-fijo").value = usuario.telefono_fijo || '';
        }
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
    }
};

document.getElementById("actualizarDatosUsuario").addEventListener("click", async function () {
    try {
        const usuarioRecuperado = JSON.parse(localStorage.getItem("usuario"));
        const usuarioId = usuarioRecuperado.uid.uid;

        const usuariosCollection = collection(db, 'usuarios');
        const q = query(usuariosCollection, where("usuario_id", "==", usuarioId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const usuarioDoc = querySnapshot.docs[0];

            // Actualiza los campos del usuario con los valores del formulario
            await updateDoc(usuarioDoc.ref, {
                nombre: document.getElementById("nombre").value || '',
                apellido: document.getElementById("apellido").value || '',
                edad: document.getElementById("edad").value || '',
                lugar_nacimiento: document.getElementById("lugar-nacimiento").value || '',
                genero: document.getElementById("genero").value || '',
                correo: document.getElementById("correo").value || '',
                telefono: document.getElementById("telefono").value || '',
                telefono_fijo: document.getElementById("telefono-fijo").value || ''
            });

            alert('Datos del usuario actualizados correctamente');
            location.reload();
        }
    } catch (error) {
        alert('Error al actualizar datos del usuario:', error);
    }
});



// Llama a la función para cargar los datos del usuario cuando la página carga
window.addEventListener("load", cargarDatosUsuario);


const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    location.href = "../html/ingresar.html";
  };
  
$("#cerrarSesion").on("click", function () {
    cerrarSesion();
  });
  