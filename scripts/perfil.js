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

window.onload = function() {
    const imageUpload = document.getElementById("image-upload");
    imageUpload.addEventListener("change", loadImage);

    const personalInfoForm = document.getElementById("personal-info-form");
    personalInfoForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const formData = new FormData(personalInfoForm);
        for (const pair of formData.entries()) {
            console.log(pair[0] + ": " + pair[1]);
        }
    });
};