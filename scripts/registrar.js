import { auth, createUserWithEmailAndPassword, db, collection, addDoc } from "./firebase_config.js";

document.getElementById("registroBtn").addEventListener("click", function() {
    registrarUsuario();
});

const registrarUsuario = () => {
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    
    registerUser(email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        console.log("Usuario registrado:", user.uid);
        crearUsuario(user.uid)
    })
    .catch((error) => {
        console.error("Error al registrar usuario:", error.message);
    });
}

const registerUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
}

const crearUsuario = (usuario_id) => {
    const nombreInput = document.getElementById("nombreInput").value;

    let nuevoUsuario = {
        nombre: nombreInput,
        apellido: "",
        celular: "",
        correo: "",
        edad: "",
        genero: "",
        telefono: "",
        genero: "",
        lugar_nacimiento: "",
        usuario_id: usuario_id
    };

    const eventosCollection = collection(db, "usuarios");

    addDoc(eventosCollection, nuevoUsuario)
    .then((docRef) => {
        alert("Registro exitoso");
        location.href = '../html/ingresar.html';
    })
    .catch((error) => {
        alert("Ha ocurrido un error, el registro no se ha completado");
        location.reload();
    });
}
