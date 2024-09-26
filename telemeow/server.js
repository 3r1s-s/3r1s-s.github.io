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

function timeAgo(tstamp) {
    const currentTime = Date.now();
    const lastSeenTime = tstamp * 1000;
    const timeDifference = currentTime - lastSeenTime;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
    }
}