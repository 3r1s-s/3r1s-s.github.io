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
    "arrow": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"></path></svg>`,
    "back": `<svg style="transform: rotate(180deg)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"></path></svg>`,
    "check": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>`,
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
            titlebar.querySelector('.titlebar .title').textContent = title;
        },
        back(back) {
            if (back) {
                titlebar.querySelector('.titlebar .titlebar-back').style.display = 'flex';
                titlebar.querySelector('.titlebar .titlebar-back').setAttribute('onclick', `${back}`)
                titlebar.querySelector('.titlebar .titlebar-back').innerHTML = `${icon.back}`

            } else {
                titlebar.querySelector('.titlebar .titlebar-back').style.display = 'none';
            }
        },
        clear(val) {
            if (val) {
                titlebar.classList.add('trans');
            } else {
                titlebar.classList.remove('trans');
            }
        }
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
    titlebar.clear(true);
    titlebar.show();
    titlebar.back();

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
    titlebar.clear(false);
    titlebar.show();
    titlebar.back();
    
    navigation.show();
    content.scrollTo(0,0);
    content.style = ``;
    content.classList.remove('max');

    content.innerHTML = `
        <div class="chats">
        </div>
    `;

    chatList();
}

async function chatList() {
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
    let sortedChats = [];
    let favedChats = Object.values(chatCache).filter(chat => favoritedChats.includes(chat._id)).sort((a, b) => {
        return b.last_active - a.last_active;
    });
    let unfavedChats = Object.values(chatCache).filter(chat => !favoritedChats.includes(chat._id)).sort((a, b) => {
        return b.last_active - a.last_active;
    });
    sortedChats = favedChats.concat(unfavedChats);

    for (let chatData of sortedChats) {
        let nickname;
        let icon;
        let attention = '';
        let action = '';
        let isfave = favoritedChats.includes(chatData._id) ? 'favourite' : '';

        nickname = chatData.nickname || `${chatData.members.find(v => v !== storage.get("username"))}`;
        nickname = nickname.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        if (chatData.type === 0) {
            if (chatData.icon) {
                icon = `https://uploads.meower.org/icons/${chatData.icon}`;
            } else {
                icon = 'assets/images/chat.jpg';
            }
        } else {
            const user = chatData.members.find(v => v !== storage.get("username"));
            userData = await getUser(`${user}`);
            icon = `https://uploads.meower.org/icons/${userData.avatar}`;
            if (userList.includes(user)) {
                attention = 'online';
            }
            action = `openProfile('${user}')`;
        }

        chatList += `
            <div class="chat ${isfave}" onclick="${action}" id="${chatData._id}">
                <div class="chat-icon ${attention}" style="--image: url('${icon}')"></div>
                <div class="chat-text">
                    <span class="chat-title">${nickname}</span>
                    <span class="chat-preview">Placeholder</span>
                </div>
            </div>
        `;
    }

    document.querySelector('.chats').innerHTML = chatList;
}
function settingsPage() {
    page = 'settings';
    document.querySelectorAll('.active').forEach(element => element.classList.remove('active'));
    document.querySelector('.nav').getElementsByClassName('nav-item')[1].classList.add('active');
    titlebar.set('Settings');
    titlebar.clear(false);
    titlebar.show();
    titlebar.back();

    navigation.show();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
        <div class="settings">
            <div class="settings-options">
                <div class="menu-button" onclick="settingsGeneral()"><span>General</span>${icon.arrow}</div>
                <div class="menu-button" onclick="settingsProfile()"><span>Profile</span>${icon.arrow}</div>
                <div class="menu-button"><span>Account</span>${icon.arrow}</div>
                <div class="menu-button"><span>Appearance</span>${icon.arrow}</div>
                <div class="menu-button"><span>Notifications</span>${icon.arrow}</div>
                <div class="menu-button"><span>Language</span>${icon.arrow}</div>
                <div class="menu-button"><span>Plugins</span>${icon.arrow}</div>
            </div>
            <div class="settings-options">
                <div class="menu-button" onclick="logout()"><span>Log Out</span>${icon.arrow}</div>
            </div>
            <div class="settings-about">
            <span style="font-weight: 600;">TeleMeow</span>
            <span>0.0.0</span>
            </div>
            <div class="settings-about">
            <span style="font-weight: 600;">ErisUI 1</span>
            </div>
        </div>
    `;
}

function settingsGeneral() {
    page = `settings.general`;
    titlebar.set(`General`);
    titlebar.clear(false);
    titlebar.back(`settingsPage()`);

    navigation.show();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
        <div class="settings">
            <span class="settings-options-title">Chat</span>
            <div class="settings-options">
                <div class="menu-button checked"><span>Invisible Typing</span><div class="toggle">${icon.check}</div></div>
                <div class="menu-button"><span>Special Embeds</span><div class="toggle">${icon.check}</div></div>
                <div class="menu-button"><span>Don't Send On Enter</span><div class="toggle">${icon.check}</div></div>
                <div class="menu-button"><span>Hide Blocked User Messages</span><div class="toggle">${icon.check}</div></div>
            </div>
            <span class="settings-options-title">Accessibility</span>
            <div class="settings-options">
                <div class="menu-button"><span>Reduce Motion</span><div class="toggle">${icon.check}</div></div>
                <div class="menu-button"><span>Always Underline Links</span><div class="toggle">${icon.check}</div></div>
            </div>
        </div>
    `;
}

function settingsProfile() {
    page = `settings.profile`;

    let quote;
    let pronouns;
    let attention = '';
    let recent;

    getUser(storage.get('username')).then(data => {
        titlebar.set(``);
        titlebar.clear(true);
        titlebar.back(`settingsPage()`);
    
        navigation.show();
        content.classList.remove('max');
        content.scrollTo(0,0);
        content.style = `background: var(--modal-400);`;

        md.disable(['image']);
        const regex = /\[(.*?)\]/;
        const newlineregex = /\n\n\[(.*?)\]/;
        const match = data.quote.match(regex);
        
        pronouns = match ? match[1] : "";
        quote = data.quote.replace(regex, '');
        editquote = data.quote.replace(newlineregex, '');
        quote = md.render(quote).replace(/<a(.*?)>/g, '<a$1 target="_blank">');

        if (userList.includes(storage.get('username'))) {
            attention = 'online';
            recent = 'Online';
        } else {
            recent = `Last Seen: ${timeAgo(data.last_seen)}`;
        }

        content.innerHTML = `
            <div class="settings">
                <div class="profile-settings">
                    <div class="modal-banner" style="--banner-color: #${data.avatar_color}"></div>
                    <div class="edit-profile-icon" style="--image: url('https://uploads.meower.org/icons/${data.avatar}')">
                    <div class="edit-profile-overlay">Edit</div>
                    </div>
                    <div class="modal-header"><span>${data._id}</span><span class="pronouns">${pronouns}</span></div>
                    <span class="edit-profile-title">Pronouns</span>
                    <input type="text" class="edit-profile-quote" value="${pronouns}">
                    <span class="edit-profile-title">Quote</span>
                    <textarea class="edit-profile-quote">${editquote}</textarea>
                    <div class="profile-section info"><span>Joined: ${new Date(data.created * 1000).toLocaleDateString()}</span><span class="divider"></span><span>${recent}</span></div>
                </div>
            </div>
        `;
    });
}

main();