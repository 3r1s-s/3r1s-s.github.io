function openModal(data) {
    const modalOuter = document.querySelector(".modal-outer");
    const modalInner = document.querySelector(".modal");

    if (data) {
        if (data.small) {
            modalInner.classList.add("small");
        }

        document.querySelector(".modal-inner").innerHTML = `
        <div class="modal-icon" style="--image: url('${data.icon}')"></div>
        <span class="modal-header">${data.title}</span>
        <span class="modal-body">${data.body}</span>
        `;
        document.querySelector(".modal-options").innerHTML = `
        <button class="modal-button" onclick="closeModal()">Close</button>
        `;
    }
    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");
}

function closeModal() {
    const modalOuter = document.querySelector(".modal-outer");
    const modalInner = document.querySelector(".modal");

    modalOuter.classList.remove("open");

    setTimeout(() => {
        modalOuter.style.visibility = "hidden";
        modalInner.classList.remove("small");
        document.querySelector(".modal-inner").innerHTML = ``;
        document.querySelector(".modal-options").innerHTML = ``;
    }, 500);
}

// openModal( { small: false, icon: 'assets/images/placeholder.jpg', title: 'TeleMeow', body: 'placeholder' })