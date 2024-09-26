const server = 'wss://server.meower.org?v=1';
const home = 'https://eris.pages.dev/telemeow';
let page = '';

let bridges = ['Discord', 'SplashBridge', 'gc'];

const usersCache = {};
const postCache = { livechat: [] };  // {chatId: [post, post, ...]} (up to 25 posts for inactive chats)
const chatCache = {}; // {chatId: chat}
const blockedUsers = {}; // {user, user}
const usersTyping = {}; // {chatId: {username1: timeoutId, username2: timeoutId}}

let userList = {}; // {user, user}
let favoritedChats = [];  // [chatId, ...]
let pendingAttachments = [];
let unreadInbox = '';

const content = document.querySelector('.app').querySelector('.content');
const app = document.querySelector('.app');

const titlebar = (() => {
    const titlebar = document.querySelector('.titlebar');

    return {
        hide() {
            titlebar.style.display = 'none';
        },
        show() {
            titlebar.style.display = '';
        },
        set(title) {
            titlebar.querySelector('span').textContent = title;
        },
    };
})();

const navigation = (() => {
    const nav = document.querySelector('.nav');

    return {
        hide() {
            nav.style.display = 'none';
        },
        show() {
            nav.style.display = '';
        },
    };
})();

const storage = (() => {
    let storagedata = {};

    try {
        storagedata = JSON.parse(localStorage.getItem('tele-data') || '{}');
    } catch (e) {
        console.error(e);
    }

    return {
        get(key) {
            return storagedata[key];
        },

        set(key, value) {
            storagedata[key] = value;
            localStorage.setItem('tele-data', JSON.stringify(storagedata));
        },

        delete(key) {
            delete storagedata[key];
            localStorage.setItem('tele-data', JSON.stringify(storagedata));
        }
    };
})();

function loginPage() {
    page = 'login';
    titlebar.set('Login');
    titlebar.show();

    navigation.hide();

    content.classList.add('max');

    content.innerHTML = `
        <div class="login">
        <div class="logo-hero"></div>
        <div class="login-title">TeleMeow</div>
            <div class="login-form">
                <div class="login-input-container">
                    <input class="login-input" id="login-username" type="text">
                    <label for="login-username">Username</label>
                </div>
                <div class="login-input-container">
                    <input class="login-input" id="login-pass" type="password">
                    <label for="login-pass">Password</label>
                </div>
            </div>
            <button class="login-button" onclick="login(document.getElementById('login-username').value, document.getElementById('login-pass').value)">Login</button>
        </div>
    `;

    document.querySelectorAll('.login-input').forEach(function(input) {
        input.addEventListener('input', function() {
            if (this.value) {
                this.classList.add('filled');
            } else {
                this.classList.remove('filled');
            }
        });
    });
}

function login(user, pass) {
    serverWebSocket.send(JSON.stringify({
        cmd: "authpswd",
        val: {
            username: user,
            pswd: pass,
        },
        listener: "auth",
    }));
}

function chatsPage() {
    titlebar.set('TeleMeow');
    titlebar.show();

    navigation.show();
    content.classList.remove('max');

    content.innerHTML = `
        <div class="chats">
        </div>
    `;

    chatList();
}

function chatList() {
    page = 'chats';
    let chatList = '';
    chatList += `
    <div class="chat favourite" onclick="openChat('home')" id="home">
        <div class="chat-icon" style="--image: url('assets/images/home.jpg')"></div>
        <div class="chat-text">
            <span class="chat-title">Home</span>
            <span class="chat-preview">${userList.length - 1} Users Online</span>
        </div>
    </div>
    <div class="chat favourite" onclick="openChat('inbox')" id="inbox">
        <div class="chat-icon ${unreadInbox ? 'attention' : ''}" style="--image: url('assets/images/inbox.jpg')"></div>
        <div class="chat-text">
            <span class="chat-title">Inbox</span>
            <span class="chat-preview">Placeholder</span>
        </div>
    </div>
`;

// put a gc icon next to gc names
    (async () => {
        let favouritedChats = favoritedChats.slice().sort((a, b) => {
            let aLastPost = postCache[a]?.[0]?.timestamp || 0;
            let bLastPost = postCache[b]?.[0]?.timestamp || 0;
            return bLastPost - aLastPost;
        });

        for (let chatId of favouritedChats) {
            let data = chatCache[chatId];
            let nickname;
            let icon;
            let attention = '';
            let action = '';

            nickname = data.nickname || `${data.members.find(v => v !== storage.get("username"))}`;
            nickname = nickname.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
            if (data.type === 0) {
                if (data.icon) {
                    icon = `https://uploads.meower.org/icons/${data.icon}`;
                } else {
                    icon = 'assets/images/chat.jpg';
                }
            } else {
                const user = data.members.find(v => v !== storage.get("username"));
                userData = await getUser(`${user}`);
                icon = `https://uploads.meower.org/icons/${userData.avatar}`;
                if (userList.includes(user)) {
                    attention = 'online';
                }
                action = `openProfile('${user}')`;
            }

            chatList += `
                <div class="chat favourite" onclick="${action}" id="${chatId}">
                    <div class="chat-icon ${attention}" style="--image: url('${icon}')"></div>
                    <div class="chat-text">
                        <span class="chat-title">${nickname}</span>
                        <span class="chat-preview">Placeholder</span>
                    </div>
                </div>
            `;
        }

        let otherChats = Object.keys(chatCache).filter(chatId => !favouritedChats.includes(chatId));
        otherChats.sort((a, b) => {
            let aLastPost = postCache[a]?.[0]?.timestamp || 0;
            let bLastPost = postCache[b]?.[0]?.timestamp || 0;
            return bLastPost - aLastPost;
        });

        for (let chatId of otherChats) {
            let data = chatCache[chatId];
            let nickname;
            let icon;
            let attention = 'offline';
            let action = '';

            nickname = data.nickname || `${data.members.find(v => v !== storage.get("username"))}`;
            nickname = nickname.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

            if (data.type === 0) {
                if (data.icon) {
                    icon = `https://uploads.meower.org/icons/${data.icon}`;
                } else {
                    icon = 'assets/images/chat.jpg';
                }
            } else {
                const user = data.members.find(v => v !== storage.get("username"));
                userData = await getUser(`${user}`);
                icon = `https://uploads.meower.org/icons/${userData.avatar}`;
                if (userList.includes(user)) {
                    attention = 'online';
                }
                action = `openProfile('${user}')`;
            }

            chatList += `
                <div class="chat" onclick="${action}" id="${chatId}">
                    <div class="chat-icon ${attention}" style="--image: url('${icon}')"></div>
                    <div class="chat-text">
                        <span class="chat-title">${nickname}</span>
                        <span class="chat-preview">Placeholder</span>
                    </div>
                </div>
            `;
        }

        document.querySelector('.chats').innerHTML = chatList;
    })();
}

main();