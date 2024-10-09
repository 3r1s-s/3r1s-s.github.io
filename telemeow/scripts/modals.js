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
            titleElement.textContent = data.title.sanitize()
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

function closeAlert() {
    const modalOuter = document.querySelector(".alert-outer");
    const modalInner = document.querySelector(".alert-inner");
    const modal = document.querySelector(".alert");

    modalOuter.classList.remove("open");

    setTimeout(() => {
        modalOuter.style.visibility = "hidden";
        modal.classList.remove("small");
        modalInner.innerHTML = ``;
        document.querySelector(".alert-options").innerHTML = ``;
    }, 500);
}

function openProfile(user) {
    let quote;
    let pronouns;
    let lastfmuser;
    let attention = '';
    let recent;
    let badges = '';
    let colors;

    getUser(user).then(data => {
        md.disable(['image']);
        const regex = /\[(.*?)\]$/;
        const lastfm = data.quote.match(/\|lastfm:([^|]+)\|/);
        let match = data.quote.match(regex);
        pronouns = match ? match[1] : "";
        
        quote = data.quote.replace(regex, '');
        lastfmuser = lastfm ? lastfm[1] : undefined;
        quote = md.render(quote.replace(/\|lastfm:[^|]+\|/, '').trim()).replace(/<a(.*?)>/g, '<a$1 target="_blank">');
        
        if (userList.includes(user)) {
            attention = 'online';
            recent = 'Online';
        } else {
            recent = `Last Seen: ${timeAgo(data.last_seen)}`;
        }

        if (data.permissions === 1) {
            badges += icon.crown;
        }

        if (data._id === `Eris`) {
            badges += icon.heart;
        }

        openModal({ 
            style: `
                --banner-color: #${data.avatar_color};
            `,
            body: `
            <div class="modal-banner"></div>
            <div class="modal-icon ${attention}" style="background-image: url('https://uploads.meower.org/icons/${data.avatar}')"></div>
            <div class="modal-header"><span>${data._id}</span><span class="pronouns">${pronouns}</span><div class="badges">${badges}</div></div>
            <div class="profile-section">${quote}</div>
            ${lastfmuser ? `
            <div class="profile-section music" style="display: none">
                <a class="spotify" target="_blank" href="">
                    <div class="spotify-art" style="background-image: none"></div>
                    <div class="spotify-info">
                        <div class="sp-in-list">
                            <span style="font-weight: 800;" class="spotify-name">
                            
                            </span>
                            <span style="font-weight: 400;" class="spotify-artist">
                                by 
                            </span>
                            <span style="font-weight: 400;" class="spotify-album">
                                on 
                            </span>
                        </div>
                    </div>
                </a>
            </div>
                ` : ``}
            <div class="profile-section info"><span>Joined: ${new Date(data.created * 1000).toLocaleDateString()}</span><span class="divider"></span><span>${recent}</span></div>
            <div class="menu-options">
            <div class="menu-button" onclick="openUserChat('${data._id}')"><span>Send DM</span>${icon.arrow}</div>
            ${moderator ? `<div class="menu-button"><span>Moderate</span>${icon.arrow}</div>` : ``}
            </div>
            </div>`
        });

        if (lastfmuser) {
            let url = 'https://lastfm-last-played.biancarosa.com.br/' + lastfmuser + '/latest-song';
            fetch(url).then(response => response.text()).then(data => {
                data = JSON.parse(data);
                if (data.track["@attr"] && data.track["@attr"].nowplaying) {
                    document.querySelector('.spotify-name').innerHTML = `${data.track.name}`;
                    document.querySelector('.spotify-artist').innerHTML = `by ${data.track.artist['#text']}`;
                    document.querySelector('.spotify-album').innerHTML = `on ${data.track.album['#text']}`;
                    document.querySelector('.spotify-art').style.backgroundImage = `url('${data.track.image[2]['#text']}')`;
                    document.querySelector('.spotify').href = data.track.url;
                    document.querySelector('.profile-section.music').style.display = 'block';
                } else {
                    document.querySelector('.profile-section.music').style.display = 'none';
                }
            })   
        }
    });
}

function postModal(id) {
    openModal({ 
        id: id,
        body: `
        <div class="post-modal-button" onclick="reply('${id}')"><div>Reply</div><div class="post-modal-icon">${icon.reply}</div></div>
        <div class="post-modal-button" ><div>Mention</div><div class="post-modal-icon">${icon.mention}</div></div>
        <div class="post-modal-button" ><div>React</div><div class="post-modal-icon">${icon.emoji}</div></div>
        <div class="post-modal-button" ><div>Report</div><div class="post-modal-icon">${icon.report}</div></div>
        <div class="post-modal-button" ><div>Share</div><div class="post-modal-icon">${icon.share}</div></div>
        `,
        style: `height: auto; min-height: 60%;`,
     });
}

function openAlert(data) {
    const modalOuter = document.querySelector(".alert-outer");
    const modalInner = document.querySelector(".alert-inner");
    const modal = document.querySelector(".alert");

    modalInner.innerHTML = ``;

    if (data) {
        if (data.title) {
            let titleElement = document.createElement("span");
            titleElement.classList.add("alert-header");
            titleElement.textContent = data.title.sanitize();
            modalInner.append(titleElement);
        }

        if (data.message) {
            let messageElement = document.createElement("span");
            messageElement.classList.add("alert-message");
            messageElement.textContent = data.message.sanitize();
            modalInner.append(messageElement);
        }

        if (data.id) {
            modal.id = data.id;
        } else {
            modal.id = '';
        }

        document.querySelector(".alert-options").innerHTML = `
        <button class="modal-button" onclick="closeAlert()">Close</button>
        `;
    }
    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");
}

function openImage(url) {
    const modalOuter = document.querySelector(".view-image-outer");
    const modalInner = document.querySelector(".view-image-inner");
    const modal = document.querySelector(".view-image");

    const baseURL = url.split('?')[0];
    const fileName = baseURL.split('/').pop();

    modalInner.innerHTML = `
    <img class="image-view" src="${url}" alt="${fileName}"/>
    `;

    document.querySelector(".view-image-options").innerHTML = `
    <span onclick="closeImage()">Close</button>
    `;
    modalOuter.style.visibility = "visible";
    modalOuter.classList.add("open");
}


function closeImage() {
    const modalOuter = document.querySelector(".view-image-outer");
    const modalInner = document.querySelector(".view-image-inner");
    const modal = document.querySelector(".view-image");

    modalOuter.classList.remove("open");

    setTimeout(() => {
        modalOuter.style.visibility = "hidden";
        modalInner.innerHTML = ``;
        document.querySelector(".view-image-options").innerHTML = ``;
    }, 350);
}

function homeModal() {
    openModal({title: 'Home', body: `<div class="menu-options">${userList.slice(0, -1).map((user) => `<div class="menu-button"><span>${user}</span>${icon.arrow}</div>`).join('')}</div>`});
}

function emojiInfoModal(data) {
    openModal({style: `height: auto; min-height: 20%;` , body: `
        <div style="display:flex;align-items:center;gap:10px;padding:10px;padding-bottom:0;box-sizing:border-box;">
            <img src="https://uploads.meower.org/emojis/${data._id}" alt=":${data.name}:" title=":${data.name}:" class="emoji-icon">
            <div style="display:flex;flex-direction:column;gap:2px;">
                <span style="font-size: 1.25em;font-weight: 600;">:${data.name}:</span>
                <span style="font-size: 1em;font-weight: 400;">You can use this emoji anywhere.</span>
            </div>
        </div>
    `});
}
// openModal( { small: false, icon: 'assets/images/placeholder.jpg', title: 'TeleMeow', body: 'placeholder' })