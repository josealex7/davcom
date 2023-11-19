import { auth, signInWithEmailAndPassword } from "./firebase_config.js";

document.getElementById("ingresoBtn").addEventListener("click", function() {
    iniciarSesion();
});

const iniciarSesion = () => {

    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passwordLogin").value;

    signInUser(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            const usuario = {
                uid: user,
                email:email
            };
    
            const usuarioString = JSON.stringify(usuario);
            localStorage.setItem("usuario", usuarioString);

            location.href = '../html/eventos.html';
        })
        .catch((error) => {
            alert("Error al iniciar sesión:", error.message);
        });
}


function signInUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}
const usuarioLogin = () => {
    const usuarioStringRecuperado = localStorage.getItem("usuario");
    const usuarioRecuperado = JSON.parse(usuarioStringRecuperado);

    if (usuarioRecuperado!=undefined){
        alert('Usted ya ha iniciado sesión')
        location.href = '../html/eventos.html';
    }
    
}

window.addEventListener("load", usuarioLogin);