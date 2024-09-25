function openModal(data) {
    const modalOuter = document.querySelector(".modal-outer");
    const modalInner = document.querySelector(".modal");

    if (data) {
        if (data.small) {
            modalInner.classList.add("small");
        }

        document.querySelector(".modal-inner").innerHTML = `
        <span class="modal-header">${data.title}</span>
        <span class="modal-body">${data.body}</span>
        `;
        document.querySelector(".modal-options").innerHTML = `
        <button class="modal-button" onclick="closeModal()">Close</button>
        `;
    }
    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");
    app.classList.add("fade");
}

function closeModal() {
    const modalOuter = document.querySelector(".modal-outer");
    const modalInner = document.querySelector(".modal");

    app.classList.remove("fade");
    modalOuter.classList.remove("open");

    setTimeout(() => {
        modalOuter.style.visibility = "hidden";
        modalInner.classList.remove("small");
        document.querySelector(".modal-inner").innerHTML = ``;
        document.querySelector(".modal-options").innerHTML = ``;
    }, 500);
}