const form = document.querySelector("#update-form")
form.addEventListener("change", function () {
    const updateBtn = document.querySelector("#update-button")
    updateBtn.removeAttribute("disabled")
})