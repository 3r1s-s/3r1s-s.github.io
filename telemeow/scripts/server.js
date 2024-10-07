function main() {
    serverWebSocket = new WebSocket(server);

    serverWebSocket.addEventListener('error', function(event) {
        // Error message
    });

    serverWebSocket.onopen = () => {
        if (storage.get("token") != undefined && storage.get("username") != undefined) {
            console.log("Logging in...");
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

    serverWebSocket.onmessage = (event) => {
        console.log(event.data);
        let data = JSON.parse(event.data);
        if (data.listener === "auth") {
            if (data.cmd === "auth") {
                storage.set("token", data.val.token);
                storage.set("username", data.val.username);
                console.log("Logged in as " + data.val.username);

                getUser(data.val.username);
                
                data.val.chats.forEach((chat) => {
                    chatCache[chat._id] = chat;
                });

                favoritedChats = data.val.account.favorited_chats;
                unreadInbox = data.val.account.unread_inbox;

                chatsPage();
            }
        } else if (data.cmd === "post" || data.cmd === "inbox_message") {
            if (!postCache[data.val.post_origin]) postCache[data.val.post_origin] = [];
            postCache[data.val.post_origin].unshift(data.val);
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
                }
            }, 4000);
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
        } else if (data.cmd == 'ulist') {
            userList = data.val.trim().split(";");
            if (page === 'chats') {
                document.getElementById("home").querySelector(".chat-preview").innerText = `${userList.length - 1} Users Online`;
            } else if (page === 'home') {
                document.querySelector(".chat-extra").innerText = `${userList.length - 1} Users Online`;
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
    return new Promise((resolve, reject) => {
        if (chatId in chatCache) return resolve(chatCache[chatId]);

        let url;
        if (chatId === "home") {
            url = "https://api.meower.org/home";
        } else if (chatId === "inbox") {
            url = "https://api.meower.org/inbox";
        } else {
            url = `https://api.meower.org/chats/${chatId}`
        }

        fetch(`${url}`, {
            headers: {
                token: storage.get("token")
            }
        })
            .then(resp => resp.json())
            .then(data => {
                if (chatId !== 'home' && chatId !== 'inbox') {
                    chatCache[chatId] = data;
                    postCache[chatId] = [];
                }
                    resolve(data);
            })
            .catch(error => {
                console.error("Failed to fetch:", error);
                reject(error);
            });
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
            if (settingsstuff().underlinelinks) {
                element.classList.add("underline");
            }
            element.innerHTML = `
            <a href="${link}?download" target="_blank">${attachment.filename}</a>
            <span class="subsubheader">${formatSize(attachment.size)}</span>
            `;
            embeddedElement = element;
        }
        return embeddedElement;
    }
}