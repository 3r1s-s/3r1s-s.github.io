function openModal(data) {
    const modalOuter = document.querySelector(".modal-outer");
    const modalInner = document.querySelector(".modal");

    if (data) {
        if (data.small) {
            modalInner.classList.add("small");
        }
        if (data.title) {
            let titleElement = document.createElement("span");
            titleElement.classList.add("modal-header");
            titleElement.textContent = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            document.querySelector(".modal-inner").append(titleElement);
        }
        
        if (data.body) {
            let bodyElement = document.createElement("div");
            bodyElement.classList.add("modal-body");
            bodyElement.innerHTML = data.body;
            document.querySelector(".modal-inner").append(bodyElement);
        }

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

function openProfile(user) {
    let quote;
    let pronouns;
    let attention = '';

    getUser(user).then(data => {
        md.disable(['image']);
        const regex = /\[(.*?)\]/;
        let match = data.quote.match(regex);
        pronouns = match ? match[1] : "";
        
        quote = data.quote.replace(regex, '');
        quote = md.render(quote).replace(/<a(.*?)>/g, '<a$1 target="_blank">');  
        
        if (userList.includes(user)) {
            attention = 'online';
        }

        openModal({ body: `
            <div class="modal-icon ${attention}" style="background-image: url('https://uploads.meower.org/icons/${data.avatar}')"></div>
            <div class="modal-header"><span>${data._id}</span><span class="pronouns">${pronouns}</span></div>
            <div class="profile-section">${quote}</div>
            <div class="profile-section info">
            <span>Joined: ${new Date(data.created * 1000).toLocaleDateString()}</span>
            <span class="divider"></span
            <span>Last Seen: ${timeAgo(data.last_seen)}</span>
            </div>
        ` });
    });
}


// openModal( { small: false, icon: 'assets/images/placeholder.jpg', title: 'TeleMeow', body: 'placeholder' })