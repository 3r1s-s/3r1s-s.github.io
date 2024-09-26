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

let moderator = true;

const content = document.querySelector('.app').querySelector('.content');
const app = document.querySelector('.app');

const icon = {
    "arrow": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"></path></svg>`
}

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

function logout() {
    storage.delete("token");
    storage.delete("username");
    loginPage();
}

function chatsPage() {
    page = 'chats';
    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
    document.querySelector('.nav').getElementsByClassName('nav-item')[0].classList.add('active');
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
    let chatList = '';
    chatList += `
    <div class="chat favourite" onclick="" id="home">
        <div class="chat-icon" style="--image: url('assets/images/home.jpg')"></div>
        <div class="chat-text">
            <span class="chat-title">Home</span>
            <span class="chat-preview">${userList.length - 1} Users Online</span>
        </div>
    </div>
    <div class="chat favourite" onclick="" id="inbox">
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

function settingsPage() {
    page = 'settings';
    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
    document.querySelector('.nav').getElementsByClassName('nav-item')[1].classList.add('active');
    titlebar.set('Settings');
    titlebar.show();

    navigation.show();
    content.classList.remove('max');

    content.innerHTML = `
        <div class="settings">
            <div class="settings-options">
                <div class="menu-button"><span>General</span>${icon.arrow}</div>
                <div class="menu-button"><span>Profile</span>${icon.arrow}</div>
                <div class="menu-button"><span>Account</span>${icon.arrow}</div>
                <div class="menu-button"><span>Appearance</span>${icon.arrow}</div>
                <div class="menu-button"><span>Language</span>${icon.arrow}</div>
            </div>
            <div class="settings-options">
                <div class="menu-button" onclick="logout()"><span>Log Out</span>${icon.arrow}</div>
            </div>
            <div class="settings-about">
            <span style="font-weight: 600;">TeleMeow</span>
            <span>0.0.0</span>
            </div>
        </div>
    `;

}

main();