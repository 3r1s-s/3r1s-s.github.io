const server = 'wss://server.meower.org?v=1';
const home = 'https://eris.pages.dev/telemeow';
let page = 'chats';

let bridges = ['Discord', 'SplashBridge', 'gc'];

const pfpCache = {};
const postCache = { livechat: [] };  // {chatId: [post, post, ...]} (up to 25 posts for inactive chats)
const chatCache = {}; // {chatId: chat}
const blockedUsers = {}; // {user, user}
const usersTyping = {}; // {chatId: {username1: timeoutId, username2: timeoutId}}

let favoritedChats = [];  // [chatId, ...]

let pendingAttachments = [];

const content = document.querySelector('.app').querySelector('.content');

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

const data = (() => {
    let data = {};

    try {
        data = JSON.parse(localStorage.getItem('tele-data') || '{}');
    } catch (e) {
        console.error(e);
    }

    return {
        get(key) {
            return data[key];
        },

        set(key, value) {
            data[key] = value;
            localStorage.setItem('tele-data', JSON.stringify(data));
        },

        delete(key) {
            delete data[key];
            localStorage.setItem('tele-data', JSON.stringify(data));
        }
    };
})();

function main() {
    serverWebSocket = new WebSocket(server);

    serverWebSocket.addEventListener('error', function(event) {
        // Error message
    });

    serverWebSocket.onopen = () => {
        if (data().get("token") != undefined && data().get("username") != undefined) {
            serverWebSocket.send(JSON.stringify({
                cmd: "authpswd",
                val: {
                    username: data().get("username"),
                    pswd: data().get("token"),
                },
                listener: "auth",
            }));
        } else {
            login();
        };
    };
}

function login() {
    titlebar.set('Login');
    titlebar.show();

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
            <button class="login-button">Login</button>
        </div>
    `;
}

login(); //remove later