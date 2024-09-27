function openModal(data) {
    const modalOuter = document.querySelector(".modal-outer");
    const modalInner = document.querySelector(".modal-inner");
    const modal = document.querySelector(".modal");

    if (data) {
        if (data.small) {
            modal.classList.add("small");
        }
        if (data.title) {
            let titleElement = document.createElement("span");
            titleElement.classList.add("modal-header");
            titleElement.textContent = data.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            modalInner.append(titleElement);
        }

        if (data.body) {
            let bodyElement = document.createElement("div");
            bodyElement.classList.add("modal-body");
            bodyElement.innerHTML = data.body;
            modalInner.append(bodyElement);
        }
        
        if (data.style) {
            modal.style = data.style;
        } else {
            modal.style = '';
        }

        if (data.id) {
            modal.id = data.id;
        } else {
            modal.id = '';
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
    const modalInner = document.querySelector(".modal-inner");
    const modal = document.querySelector(".modal");

    modalOuter.classList.remove("open");

    setTimeout(() => {
        modalOuter.style.visibility = "hidden";
        modal.classList.remove("small");
        modalInner.innerHTML = ``;
        document.querySelector(".modal-options").innerHTML = ``;
    }, 500);
}

function openProfile(user) {
    let quote;
    let pronouns;
    let attention = '';
    let recent;
    let colors;

    getUser(user).then(data => {
        md.disable(['image']);
        const regex = /\[(.*?)\]$/;
        let match = data.quote.match(regex);
        pronouns = match ? match[1] : "";
        
        quote = data.quote.replace(regex, '');
        quote = md.render(quote).replace(/<a(.*?)>/g, '<a$1 target="_blank">');  
        
        if (userList.includes(user)) {
            attention = 'online';
            recent = 'Online';
        } else {
            recent = `Last Seen: ${timeAgo(data.last_seen)}`;
        }

        openModal({ 
            style: `
            --modal-200: #00000040;
            --modal-300: #00000080;
            --modal-400: ${darkenColour(data.avatar_color, 3)};
            --modal-500: #000000e0;
            --modal-600: #000000aa;

            --modal-accent: #${data.avatar_color};

            --modal-text: ${lightenColour(data.avatar_color, 1.2)};
            --modal-link: ${lightenColour(data.avatar_color, 1.5)};
            `,
            body: `
            <div class="modal-icon ${attention}" style="background-image: url('https://uploads.meower.org/icons/${data.avatar}')"></div>
            <div class="modal-header"><span>${data._id}</span><span class="pronouns">${pronouns}</span></div>
            <div class="profile-section">${quote}</div>
            <div class="profile-section info"><span>Joined: ${new Date(data.created * 1000).toLocaleDateString()}</span><span class="divider"></span><span>${recent}</span></div>
            <div class="menu-options">
            <div class="menu-button"><span>Send DM</span>${icon.arrow}</div>
            ${moderator ? `<div class="menu-button"><span>Moderate</span>${icon.arrow}</div>` : ``}
            </div>
            </div>`
    });
    });
}


// openModal( { small: false, icon: 'assets/images/placeholder.jpg', title: 'TeleMeow', body: 'placeholder' })