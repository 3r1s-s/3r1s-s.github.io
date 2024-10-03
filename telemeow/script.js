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
    "arrow": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"></path></svg>`,
    "back": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="transform: rotate(180deg)"><path d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"></path></svg>`,
    "check": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>`,
    "add": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 8 8" fill="none"><path d="M5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1V3H1C0.447715 3 0 3.44772 0 4C0 4.55228 0.447715 5 1 5H3V7C3 7.55228 3.44772 8 4 8C4.55229 8 5 7.55228 5 7V5H7C7.55228 5 8 4.55228 8 4C8 3.44772 7.55228 3 7 3H5V1Z" fill="currentColor"/></svg>`,
    "emoji": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 9.77778C4 9.77778 5.33333 10.2222 8 10.2222C10.6667 10.2222 12 9.77778 12 9.77778C12 9.77778 11.1111 11.5556 8 11.5556C4.88889 11.5556 4 9.77778 4 9.77778Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16 8C16 12.4184 12.4183 16 8 16C3.58171 16 0 12.4184 0 8C0 3.5816 3.58171 0 8 0C12.4183 0 16 3.5816 16 8ZM8 9.33377C6.38976 9.33377 5.32134 9.14627 4 8.88932C3.69824 8.83116 3.11111 8.88932 3.11111 9.77821C3.11111 11.556 5.15332 13.7782 8 13.7782C10.8462 13.7782 12.8889 11.556 12.8889 9.77821C12.8889 8.88932 12.3018 8.83073 12 8.88932C10.6787 9.14627 9.61024 9.33377 8 9.33377ZM5.33333 7.55556C5.94699 7.55556 6.44444 6.85894 6.44444 6C6.44444 5.14106 5.94699 4.44444 5.33333 4.44444C4.71967 4.44444 4.22222 5.14106 4.22222 6C4.22222 6.85894 4.71967 7.55556 5.33333 7.55556ZM11.7778 6C11.7778 6.85894 11.2803 7.55556 10.6667 7.55556C10.053 7.55556 9.55556 6.85894 9.55556 6C9.55556 5.14106 10.053 4.44444 10.6667 4.44444C11.2803 4.44444 11.7778 5.14106 11.7778 6Z" fill="currentColor"></path></svg>`,
    "send": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z" fill="currentColor"></path></svg>`
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
                if (val === 'chat') {
                    titlebar.classList.remove('trans');
                    titlebar.classList.add('chat-trans');
                } else {
                    titlebar.classList.remove('chat-trans');
                    titlebar.classList.add('trans');
                }
            } else {
                titlebar.classList.remove('chat-trans');
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
        },

        clear() {
            storagedata = {};
            localStorage.setItem('tele-data', JSON.stringify(storagedata));
        }
    };
})();

const theme = (() => {
    return {
        get() {
            return storage.get('theme');
        },
        set(theme) {
            storage.set('theme', theme);
            setTheme();
        }
    };
})();

setTheme();

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
    storage.clear();
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
    <div class="chat favourite" onclick="chatPage('home')" id="home">
        <div class="chat-icon" style="--image: url('assets/images/home.jpg')"></div>
        <div class="chat-text">
            <span class="chat-title">Home</span>
            <span class="chat-preview">${userList.length - 1} Users Online</span>
        </div>
    </div>
    <div class="chat favourite" onclick="chatPage('inbox')" id="inbox">
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
        }
        action = `chatPage('${chatData._id}');`;

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

function chatPage(chatId) {
    page = chatId;

    titlebar.set('');
    titlebar.clear('chat');
    titlebar.back(`chatsPage()`);

    navigation.hide();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.innerHTML = ``;

    let name;

    getChat(chatId).then(data => {
        if (chatId === 'home') {
            name = 'Home';
        } else if (chatId === 'inbox') {
            name = 'Inbox';
        } else {
            name = data.nickname || `${data.members.find(v => v !== storage.get("username"))}`;
        }

        md.disable(['image']);

        let chatExtra;
        let chatNext;
        if (chatId === 'home') {
            chatExtra = `${userList.length - 1} Users Online`;
            chatNext = 'chatSettings("home")';
        } else if (chatId === 'inbox') {
            chatExtra = 'Placeholder';
            chatNext = 'settingsNotifications()';
        } else if (data.type === 0) {
            chatExtra = `${data.members.length - 1} Members`;
            chatNext = `chatSettings('${chatId}')`;
        } else if (data.type === 1) {
            chatExtra = userList.includes(name) ? 'Online' : 'Offline';
            chatNext = `openProfile('${name}');`;
        }

        content.innerHTML = `
            <div class="chat-page">
                <div class="chat-info" onclick="${chatNext}">
                    <span class="chat-name">${name}</span>
                    <span class="chat-extra">${chatExtra}</span>
                </div>
                <div class="message-input-wrapper">
                    <div class="message-button">${icon.add}</div>
                        <div class="message-input-container">
                            <textarea class="message-input" placeholder="Send a message to ${name}..."></textarea>
                        </div>
                    <div class="message-button">${icon.emoji}</div>
                    <div class="message-button message-send">${icon.send}</div>
                </div>
                <div class="posts">
                    ${createPost(
                        {"_id":"c1611c9f-4ea6-4a91-8488-d37c8b364e38","attachments":[],"author":{"_id":"DaGreenBoi","avatar":"HBU0vwoZrwNt7PzU5BagLHw9","avatar_color":"00ff00","flags":0,"pfp_data":29,"uuid":"1c9ac9b5-2d64-40e2-b495-6e4b261f9e9f"},"emojis":[],"error":false,"isDeleted":false,"p":"kennst du me open source version / alternative von Anton? weil ich will es kopierien und par neue sachen hinzuf\u00fcgen wie custom spiele","pinned":false,"post_id":"c1611c9f-4ea6-4a91-8488-d37c8b364e38","post_origin":"home","reactions":[],"reply_to":[{"_id":"073a568b-bb78-4a0f-b251-ead4eb46a879","attachments":[{"filename":"image.png","height":123,"id":"tG5xuMxYwlYG65v40erPfBx6","mime":"image/png","size":9270,"width":237}],"author":{"_id":"mybearworld","avatar":"MG9sbLeUcB0HDxjw2zLBDCKx","avatar_color":"ff7b00","flags":0,"pfp_data":2,"uuid":"9edcacad-791c-4071-bbbe-ae003556e1e4"},"emojis":[],"isDeleted":false,"p":"what a comment","pinned":false,"post_id":"073a568b-bb78-4a0f-b251-ead4eb46a879","post_origin":"home","reactions":[],"reply_to":[null],"stickers":[],"t":{"e":1727986769},"type":1,"u":"mybearworld"}],"stickers":[],"t":{"e":1727986904},"type":1,"u":"DaGreenBoi"}
                    )}
                    ${createPost(
                        {"_id":"4989f0e6-295b-470a-80ae-4092d3b54b60","attachments":[],"author":{"_id":"Eris","avatar":"Gi1WvwNobL0X6RpZB7pnAMNw","avatar_color":"8f75cc","flags":4,"pfp_data":23,"uuid":"d4006f3b-d054-4fd3-a4b1-82b29257cd91"},"emojis":[],"error":false,"isDeleted":false,"p":"hi","pinned":false,"post_id":"4989f0e6-295b-470a-80ae-4092d3b54b60","post_origin":"home","reactions":[],"reply_to":[],"stickers":[],"t":{"e":1727944460},"type":1,"u":"Eris"}
                    )}
                    ${createPost(
                        {"_id":"f6c23f1e-38ad-4bb7-be9a-5f09e5794873","attachments":[{"filename":"image.png","height":143,"id":"xPH2LRqt7QE4NKd26buPhYox","mime":"image/png","size":11022,"width":707}],"author":{"_id":"noodles","avatar":"smFnDSoPoX2db0UtqRg30Ptc","avatar_color":"efff14","flags":0,"pfp_data":1,"uuid":"f898ca97-2e92-460f-bd0d-2858e4a1fe42"},"emojis":[],"error":false,"isDeleted":false,"p":"...why","pinned":false,"post_id":"f6c23f1e-38ad-4bb7-be9a-5f09e5794873","post_origin":"home","reactions":[],"reply_to":[],"stickers":[],"t":{"e":1727986813},"type":1,"u":"noodles"}
                    )}
                    ${createPost(
                        {"_id":"6d9c187d-5cbb-424b-ab67-4891670bcb21","attachments":[{"filename":"image.png","height":272,"id":"UNX0TtNYuJWWzGZYnZF2GZ1x","mime":"image/png","size":19053,"width":744}],"author":{"_id":"mybearworld","avatar":"MG9sbLeUcB0HDxjw2zLBDCKx","avatar_color":"ff7b00","flags":0,"pfp_data":2,"uuid":"9edcacad-791c-4071-bbbe-ae003556e1e4"},"emojis":[],"error":false,"isDeleted":false,"p":"hmmmmmmmmmmmm","pinned":false,"post_id":"6d9c187d-5cbb-424b-ab67-4891670bcb21","post_origin":"home","reactions":[],"reply_to":[],"stickers":[],"t":{"e":1727987090},"type":1,"u":"mybearworld"}
                    )}
                    ${createPost(
                        {"_id":"ee2c2f11-f598-47ef-8385-d879a35e5106","attachments":[],"author":{"_id":"Blahaj","avatar":"CnPzASDPJBGDfI8hCbqxVGC8","avatar_color":"ff80c0","flags":0,"pfp_data":32,"uuid":"c5077399-938a-4223-830a-28fd8e21e9bf"},"emojis":[],"error":false,"isDeleted":false,"p":"meow","pinned":false,"post_id":"ee2c2f11-f598-47ef-8385-d879a35e5106","post_origin":"home","reactions":[],"reply_to":[],"stickers":[],"t":{"e":1727986748},"type":1,"u":"Blahaj"}
                    )}
                </div>
            </div>
        `;
    });
}

function createPost(data) {
    
    let attachments = document.createElement('div');
    attachments.classList.add('post-attachments');
    if (data.attachments) {        
        data.attachments.forEach(attachment => {
            const g = attach(attachment);
            attachments.appendChild(g);
        });
    }

    let post = `
        <div class="post" id="${data._id}">
            <div class="avatar-outer">
                <div class="avatar" style="--image: url('https://uploads.meower.org/icons/${data.author.avatar}'); --color: ${data.author.avatar_color}" onclick="openProfile('${data.author._id}')"></div>
            </div>
            <div class="post-wrapper">
                <div class="post-info">
                    <span class="post-author" onclick="openProfile('${data.author._id}')">${data.author._id}</span><span class="post-date">${timeAgo(data.t.e)}</span>
                </div>
                <div class="post-content">${md.render(data.p)}</div>
                ${attachments.outerHTML}
                <div class="post-reactions"></div>
            </div>
        </div>
        `;

    return post;
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
                <div class="menu-button" onclick="settingsAppearance()"><span>Appearance</span>${icon.arrow}</div>
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

function settingsAppearance() {
    page = `settings.appearance`;

    titlebar.set(`Appearance`);
    titlebar.clear(false);
    titlebar.back(`settingsPage()`);

    navigation.show();
    content.classList.remove('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
        <div class="settings">
            <div class="theme-preview">
            </div>
            <div class="theme-options">
                <div class="theme-option dark" onclick="theme.set('dark')" style="--app-500: #1a1825;">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>Dark</span>
                    </div>
                </div>
                <div class="theme-option light" onclick="theme.set('light')">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>Light</span>
                    </div>
                </div>
                <div class="theme-option catppuccin-macchiato" onclick="theme.set('catppuccin-macchiato')">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>Twilight</span>
                    </div>
                </div>
                <div class="theme-option oled" onclick="theme.set('oled')">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>OLED</span>
                    </div>
                </div>
                <div class="theme-option watermelon" onclick="theme.set('watermelon')">
                    <div class="theme-colour">
                    </div>
                    <div class="theme-name">
                        <span>Watermelon</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTheme();
}

main();