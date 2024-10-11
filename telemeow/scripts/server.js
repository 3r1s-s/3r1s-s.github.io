function main() {
    serverWebSocket = new WebSocket(server);

    serverWebSocket.addEventListener('error', function(event) {
        console.error(event);
    });

    serverWebSocket.onopen = () => {
        if (storage.get("token") != undefined && storage.get("username") != undefined) {
            console.info("Logging in...");
            serverWebSocket.send(JSON.stringify({
                cmd: "authpswd",
                val: {
                    username: storage.get("username"),
                    pswd: storage.get("token"),
                },
                listener: "auth",
            }));
        } else {
            loginPage();
        };
    };

    serverWebSocket.onclose = () => {
        console.info("Connection closed attempting to reconnect...");
        setTimeout(() => {
            main();
            if (page === "chats" ) {
                chatsPage();
            } else if (chatCache[page]) {
                chatPage(page);
            } else if (page === 'home') {
                chatPage('home');
            }
        }, 5000);
    };

    serverWebSocket.onmessage = (event) => {
        if (!settings.get('disableLogs')) {
            console.log(event.data);
        }
        let data = JSON.parse(event.data);
        if (data.listener === "auth") {
            if (data.cmd === "auth") {
                storage.set("token", data.val.token);
                storage.set("username", data.val.username);
                console.info("Logged in as " + data.val.username);

                getUser(data.val.username);
                
                data.val.chats.forEach((chat) => {
                    chatCache[chat._id] = chat;
                });

                favoritedChats = data.val.account.favorited_chats;
                unreadInbox = data.val.account.unread_inbox;
                if (page === 'login' || !page) {
                    chatsPage();
                }
            }
        } else if (data.cmd === "post" || data.cmd === "inbox_message") {
            let post = data.val;
            let postOrigin = post.post_origin;

            if (usersTyping[postOrigin] && post.author._id in usersTyping[postOrigin]) {
                clearTimeout(usersTyping[postOrigin][post.author._id]);
                delete usersTyping[postOrigin][post.author._id];
            }

            if (!(postOrigin in postCache)) postCache[postOrigin] = [];
            postCache[postOrigin].unshift(post);
            if (page === postOrigin) {
                document.querySelector(".posts").insertAdjacentHTML('afterbegin', createPost(post));
                
            } else {
                if (postCache[postOrigin].length > 25) postCache[postOrigin].length = 25;
            }
        } else if (data.cmd === "typing") {
            const chatId = data.val.chat_id;
            const username = data.val.username;
            if (!usersTyping[chatId]) usersTyping[chatId] = {};
            if (username in usersTyping[chatId]) {
                clearTimeout(usersTyping[chatId][username]);
            }
            usersTyping[chatId][username] = setTimeout(() => {
                if (username in usersTyping[chatId]) {
                    clearTimeout(usersTyping[chatId][username]);
                    delete usersTyping[chatId][username];

                    renderTyping();
                }
            }, 4000);
            renderTyping();
        } else if (data.cmd === "update_post") {
            let postOrigin = data.val.post_origin;
            if (postCache[postOrigin]) {
                index = postCache[postOrigin].findIndex(post => post._id === data.val._id);
                if (index !== -1) {
                    postCache[postOrigin][index] = Object.assign(
                        postCache[postOrigin][index],
                        data.val
                    );
                }
            }
        } else if (data.cmd === "delete_post") {
            if (data.val.chat_id in postCache) {
                const index = postCache[data.val.chat_id].findIndex(post => post._id === data.val.post_id);
                if (index !== -1) {
                    postCache[data.val.chat_id].splice(index, 1);
                }
            }
        } else if (data.cmd === "create_chat") {
            chatCache[data.val._id] = data.val;
        } else if (data.cmd === "update_chat") {
            const chatId = data.val._id;
            if (chatId in chatCache) {
                chatCache[chatId] = Object.assign(
                    chatCache[chatId],
                    data.val
                );
            }
        } else if (data.cmd === "delete_chat") {
            if (chatCache[data.val.chat_id]) {
                delete chatCache[data.val.chat_id];
            }
            if (postCache[data.val.chat_id]) {
                delete postCache[data.val.chat_id];
            }
        } else if (data.cmd == "update_profile") {
            return new Promise((resolve, reject) => {      
                const username = data.val._id;  
                fetch(`https://api.meower.org/users/${username}`)
                    .then(resp => resp.json())
                    .then(data => {
                        usersCache[username] = data;
                        resolve(data);
                    })
                    .catch(error => {
                        console.error("Failed to fetch:", error);
                        reject(error);
                    });
            });
        } else if (data.cmd == 'ulist') {
            userList = data.val.trim().split(";");
            if (page === 'chats') {
                if (document.getElementById("home")) {
                    document.getElementById("home").querySelector(".chat-preview").innerText = `${userList.length - 1} Users Online`;
                }
            } else if (page === 'home') {
                document.querySelector(".chat-extra").innerHTML = `
                <span class="userlist">${userList.length - 1} Users Online</span>
                <span class="typing-indicator"></span>
                `;
            }
        }
}}

function getUser(username) {
    return new Promise((resolve, reject) => {
        if (username in usersCache) return resolve(usersCache[username]);

        fetch(`https://api.meower.org/users/${username}`)
            .then(resp => resp.json())
            .then(data => {
                usersCache[username] = data;
                resolve(data);
            })
            .catch(error => {
                console.error("Failed to fetch:", error);
                reject(error);
            });
    });
}

function getChat(chatId) {
    if (!["home", "inbox", "livechat"].includes(chatId) && !chatCache[chatId]) {
        return fetch(`https://api.meower.org/chats/${chatId}`, {
            headers: {token: localStorage.getItem("token")}
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Chat not found");
                } else {
                    throw new Error('Network response was not ok');
                }
            }
            return response.json();
        })
        .then(data => {
            chatCache[chatId] = data;
            return data;
        })
        .catch(e => {
            openAlert({
                title: "Error",
                message: `Unable to open chat: ${e}`
            });
        });
    }
    return Promise.resolve(chatCache[chatId]);
}

async function loadPosts(pageNo) {
    const posts = document.querySelector(".posts");

    const chatId = page.valueOf();
    if (!(chatId in postCache)) postCache[chatId] = [];

    const cacheSkip = (pageNo-1) * 25;
    const cachedPosts = postCache[chatId].slice(cacheSkip, (cacheSkip+25)+1);
    for (const post of cachedPosts) {
        posts.innerHTML += createPost(post);
    }
    if (cachedPosts.length >= 25 || chatId === "livechat") {
        if (chatId === "livechat") document.querySelector(".skeleton-posts").style.display = "none";
        return;
    }

    var path;
    if (chatId === "home") path = "/home"
    else if (chatId === "inbox") path = "/inbox"
    else path = `/posts/${chatId}`;

    const response = await fetch(`https://api.meower.org${path}?page=${pageNo}`, {
        headers: {
            token: storage.get("token")
        }
    });
    const postsData = await response.json();

    if (postsData["page#"] === postsData.pages && postsData.autoget.length < 25) {
        document.querySelector(".skeleton-posts").style.display = "none";
        document.querySelector(".posts").setAttribute("data-loading-more", "");
    }

    const postsarray = postsData.autoget || [];
    postsarray.forEach(post => {
        if (page !== chatId) {
            return;
        }
        if (postCache[chatId].findIndex(_post => _post._id === post._id) !== -1) {
            return
        }
        postCache[chatId].push(post);
        posts.innerHTML += createPost(post);
    });
}

function openUserChat(username) {
    for (const chat of Object.values(chatCache)) {
        if (chat.type === 1 && chat.members.includes(username)) {
            chatPage(chat._id);
            closeModal();
            return;
        }
    }

    fetch(`https://api.meower.org/users/${username}/dm`, {
        method: 'GET',
        headers: {
            'token': storage.get('token')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        chatCache[data._id] = data;
        chatPage(data._id);
        closeModal();
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function attach(attachment) {
    let link;
    if (attachment.filename) {
        link = `https://uploads.meower.org/attachments/${attachment.id}/${attachment.filename}`;
    } else {
        link = `https://uploads.meower.org/attachments/${attachment.id}`;
    }
    if (link) {
        const baseURL = link.split('?')[0];
        const fileName = baseURL.split('/').pop();

        let embeddedElement;

        if (attachment.mime.includes("image/") && attachment.size < (12 << 20)) {
            const element = document.createElement("div");
            element.classList.add("image-outer");

            let imgElement = document.createElement("img");
            imgElement.setAttribute("src", link + '?preview');
            imgElement.setAttribute("onclick", `openImage('${link}')`);
            imgElement.setAttribute("alt", fileName);
            imgElement.setAttribute("title", fileName);
            imgElement.classList.add("embed");

            element.appendChild(imgElement);
            embeddedElement = element;
        } else if (attachment.mime.includes("video/") && attachment.size < (12 << 20)) {
            const element = document.createElement("div");
            element.classList.add("media-outer");

            let mediaElement = document.createElement("video");
            mediaElement.setAttribute("src", baseURL + '?preview');
            mediaElement.setAttribute("controls", "controls");
            mediaElement.setAttribute("playsinline", "");
            mediaElement.setAttribute("preload", "metadata");
            mediaElement.setAttribute("alt", fileName);
            mediaElement.setAttribute("title", fileName);
            mediaElement.classList.add("embed");
            
            element.appendChild(mediaElement);
            embeddedElement = element;
        } else if (attachment.mime.includes("audio/") && attachment.size < (12 << 20)) {

            const element = document.createElement("div");
            element.classList.add("media-outer");

            let mediaElement = document.createElement("audio");
            mediaElement.setAttribute("src", baseURL);
            mediaElement.setAttribute("controls", "controls");
            mediaElement.setAttribute("alt", fileName);
            mediaElement.setAttribute("title", fileName);
            mediaElement.classList.add("embed");
            
            element.appendChild(mediaElement);
            embeddedElement = element;
        } else {
            const element = document.createElement("div");
            element.classList.add("download");
            element.innerHTML = `
            <a href="${link}?download" target="_blank">${attachment.filename}</a>
            <small>${formatSize(attachment.size)}</small>
            `;
            embeddedElement = element;
        }
        return embeddedElement;
    }
}

async function sendPost() {
    const messageInput = document.querySelector('.message-input');
    if (messageInput.disabled) return;
    if (messageInput.value.trim() === "") return;
    const message = messageInput.value;
    messageInput.value = "";
    autoResize();

    const nonce = Math.random().toString();
    const response = await fetch(`https://api.meower.org/${page === "home" ? "home" : `posts/${page}`}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            token: storage.get("token"),
        },
        body: JSON.stringify({
            reply_to: [],
            content: message,
            attachments: [],
            nonce,
        })
    });

    autoResize();
}

function renderTyping() {
    if (!(page in usersTyping)) return;
    const typing = Object.keys(usersTyping[page]);
    const typingElem = document.querySelector(".chat-extra").querySelector(".typing-indicator");
    const translations = {
        "one": "{user} is typing...",
        "two": "{user1} and {user2} are typing...",
        "multiple": "{user1}, {user2}, and {user3} are typing...",
        "many": "{count} people are typing..."
    };

    switch (typing.length) {
        case 0:
            typingElem.innerText = "";
            break;
        case 1:
            typingElem.innerText = translations.one.replace("{user}", typing[0]);
            break;
        case 2:
            typingElem.innerText = translations.two
                .replace("{user1}", typing[0])
                .replace("{user2}", typing[1]);
            break;
        case 3:
            typingElem.innerText = translations.multiple
                .replace("{user1}", typing[0])
                .replace("{user2}", typing[1])
                .replace("{user3}", typing[2]);
            break;
        default:
            typingElem.innerText = translations.many.replace("{count}", typing.length);
            break;
    }
}

function ping() {
    serverWebSocket.send(JSON.stringify({
        cmd: "ping",
        val: ""
    }));
}