const server = 'wss://server.meower.org?v=1';
const home = 'https://eris.pages.dev/telemeow';

let page = '';
let back = '';

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
    "home": `<svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5258 0.204649C11.2291 -0.0682165 10.7709 -0.0682161 10.4742 0.204649L0.249923 9.68588C-0.266994 10.1612 0.0714693 11.0197 0.775759 11.0197L3.48971 11.0197V18.6923C3.48971 19.542 4.18295 20.2308 5.03811 20.2308H16.9619C17.8171 20.2308 18.5103 19.542 18.5103 18.6923V11.0197L21.2242 11.0197C21.9285 11.0197 22.267 10.1612 21.7501 9.68588L11.5258 0.204649Z" fill="currentColor"/></svg> `,
    "settings": `<svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M0.644169 15.2044C0.751639 15.4175 0.866389 15.627 0.988219 15.8323C1.34503 16.445 1.76284 17.0223 2.23048 17.545C2.3967 17.7307 2.65856 17.7968 2.89375 17.7126L5.25826 16.8621C5.96645 16.608 6.74841 17.07 6.87902 17.8018L7.32018 20.2764C7.36418 20.5227 7.55119 20.7167 7.79454 20.7688C8.86201 20.9976 9.95753 21.057 11.0418 20.9452C11.427 20.9061 11.8095 20.8457 12.1863 20.7643C12.375 20.7232 12.5303 20.5969 12.6121 20.4275C12.6441 20.37 12.6671 20.3068 12.6794 20.2397L13.132 17.7739C13.1978 17.4162 13.4191 17.1252 13.7102 16.9498C13.7478 16.9275 13.7867 16.9072 13.8264 16.8889C14.1041 16.7654 14.426 16.7408 14.7301 16.8496L17.0889 17.6938C17.2068 17.7362 17.3318 17.7406 17.4482 17.7107C17.5805 17.6872 17.7044 17.6208 17.7983 17.5172C18.2857 16.9783 18.7189 16.3833 19.0875 15.7497C19.4503 15.1137 19.748 14.4403 19.9703 13.7471C20.0128 13.6142 20.0083 13.4742 19.9629 13.3481C19.9307 13.2315 19.8646 13.1245 19.7685 13.043L17.8596 11.4179C17.6114 11.2067 17.4714 10.912 17.4409 10.6065C17.4371 10.563 17.4355 10.5194 17.4361 10.4758C17.444 10.1379 17.5847 9.80337 17.8591 9.56905L19.7638 7.94348C19.8146 7.90007 19.857 7.84958 19.8904 7.7944C19.9978 7.63842 20.0299 7.43844 19.9706 7.25291C19.8534 6.88733 19.7151 6.52704 19.5572 6.17466C19.1114 5.17572 18.5115 4.2528 17.7787 3.43934C17.612 3.25429 17.3509 3.18886 17.1161 3.27382L14.7569 4.12827C14.0592 4.38082 13.2679 3.93321 13.1344 3.19155L12.6871 0.714256C12.6423 0.468053 12.4542 0.273849 12.2106 0.22246C11.5182 0.0764882 10.803 0.00250031 10.088 0.000608251C9.88769 -0.0015584 9.68739 0.002064 9.48735 0.0114648C8.92415 0.0369819 8.36389 0.107332 7.81778 0.222459C7.78135 0.230146 7.74615 0.241028 7.71249 0.2548C7.5098 0.328781 7.35888 0.505679 7.31996 0.723547L6.8788 3.19817C6.81394 3.56157 6.58834 3.85866 6.29097 4.03446C5.98991 4.2061 5.61923 4.25412 5.27153 4.12827L2.91237 3.27382C2.70694 3.1995 2.48138 3.24016 2.31657 3.37545C2.2857 3.39886 2.25676 3.42543 2.23026 3.45505C1.81793 3.91588 1.44433 4.4192 1.11714 4.95183C1.05788 5.04799 1.00019 5.14513 0.944072 5.24319C0.878302 5.35619 0.814661 5.4704 0.753186 5.58577C0.464267 6.12611 0.222113 6.69081 0.0338354 7.26739C0.0213426 7.30567 0.0127871 7.34455 0.00802709 7.38352C-0.0257478 7.59364 0.0518458 7.809 0.218337 7.94974L2.13633 9.56992C2.41146 9.80242 2.55518 10.1364 2.56469 10.4743C2.56917 10.8294 2.42529 11.1857 2.13611 11.4301L0.218115 13.0503C0.0484589 13.1937 -0.0289685 13.4145 0.00982709 13.6284C0.0147983 13.6634 0.0228404 13.6982 0.0340542 13.7326C0.198098 14.235 0.403035 14.7283 0.644169 15.2044ZM10 14.5C12.2091 14.5 14 12.7091 14 10.5C14 8.29086 12.2091 6.5 10 6.5C7.79086 6.5 6 8.29086 6 10.5C6 12.7091 7.79086 14.5 10 14.5Z" fill="currentColor"></path></svg>`,
    "arrow": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"></path></svg>`,
    "back": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="transform: rotate(180deg)"><path d="M9.3 5.3a1 1 0 0 0 0 1.4l5.29 5.3-5.3 5.3a1 1 0 1 0 1.42 1.4l6-6a1 1 0 0 0 0-1.4l-6-6a1 1 0 0 0-1.42 0Z"></path></svg>`,
    "check": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="m10 15.586-3.293-3.293-1.414 1.414L10 18.414l9.707-9.707-1.414-1.414z"></path></svg>`,
    "add": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 8 8" fill="none"><path d="M5 1C5 0.447715 4.55228 0 4 0C3.44772 0 3 0.447715 3 1V3H1C0.447715 3 0 3.44772 0 4C0 4.55228 0.447715 5 1 5H3V7C3 7.55228 3.44772 8 4 8C4.55229 8 5 7.55228 5 7V5H7C7.55228 5 8 4.55228 8 4C8 3.44772 7.55228 3 7 3H5V1Z" fill="currentColor"/></svg>`,
    "send": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8.2738 8.49222L1.99997 9.09877L0.349029 14.3788C0.250591 14.691 0.347154 15.0322 0.595581 15.246C0.843069 15.4597 1.19464 15.5047 1.48903 15.3613L15.2384 8.7032C15.5075 8.57195 15.6781 8.29914 15.6781 8.00007C15.6781 7.70101 15.5074 7.4282 15.2384 7.29694L1.49839 0.634063C1.20401 0.490625 0.852453 0.535625 0.604941 0.749376C0.356493 0.963128 0.259941 1.30344 0.358389 1.61563L2.00932 6.89563L8.27093 7.50312C8.52405 7.52843 8.71718 7.74125 8.71718 7.99531C8.71718 8.24938 8.52406 8.46218 8.27093 8.4875L8.2738 8.49222Z" fill="currentColor"></path></svg>`,
    "emoji": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M4 9.77778C4 9.77778 5.33333 10.2222 8 10.2222C10.6667 10.2222 12 9.77778 12 9.77778C12 9.77778 11.1111 11.5556 8 11.5556C4.88889 11.5556 4 9.77778 4 9.77778Z" fill="currentColor"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16 8C16 12.4184 12.4183 16 8 16C3.58171 16 0 12.4184 0 8C0 3.5816 3.58171 0 8 0C12.4183 0 16 3.5816 16 8ZM8 9.33377C6.38976 9.33377 5.32134 9.14627 4 8.88932C3.69824 8.83116 3.11111 8.88932 3.11111 9.77821C3.11111 11.556 5.15332 13.7782 8 13.7782C10.8462 13.7782 12.8889 11.556 12.8889 9.77821C12.8889 8.88932 12.3018 8.83073 12 8.88932C10.6787 9.14627 9.61024 9.33377 8 9.33377ZM5.33333 7.55556C5.94699 7.55556 6.44444 6.85894 6.44444 6C6.44444 5.14106 5.94699 4.44444 5.33333 4.44444C4.71967 4.44444 4.22222 5.14106 4.22222 6C4.22222 6.85894 4.71967 7.55556 5.33333 7.55556ZM11.7778 6C11.7778 6.85894 11.2803 7.55556 10.6667 7.55556C10.053 7.55556 9.55556 6.85894 9.55556 6C9.55556 5.14106 10.053 4.44444 10.6667 4.44444C11.2803 4.44444 11.7778 5.14106 11.7778 6Z" fill="currentColor"></path></svg>`,
    "more": `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" clip-rule="evenodd"></path></svg>`,
    "reply": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z" fill="currentColor"></path></svg>`,
    "mention": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg>`,
    "report": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg>`,
    "share": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z"></path><path d="M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z"></path></svg>`,
    "crown": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6.51284 21H17.4872C18.3315 21 19.1412 20.6761 19.7382 20.0996C20.3352 19.5231 20.6706 18.7412 20.6706 17.9259C20.6706 17.3526 20.1718 16.9011 19.6094 16.9011H4.39056C3.82819 16.9011 3.32942 17.3526 3.32942 17.9259C3.32942 18.7412 3.66481 19.5231 4.26182 20.0996C4.85883 20.6761 5.66854 21 6.51284 21Z" fill="currentColor"/><path d="M16.8946 9.38729L20.2857 7.10763L21.3073 6.38758C21.4871 6.2591 21.7043 6.18876 21.9279 6.18661C22.1516 6.18446 22.3702 6.25061 22.5526 6.37561C22.735 6.50061 22.8719 6.67808 22.9436 6.88266C22.9816 6.99116 23.0003 7.10434 22.9996 7.2175C23.0031 7.34228 22.9829 7.46738 22.9393 7.5865L22.8716 7.77292L20.8934 14.1242C20.7621 14.5427 20.3382 14.8486 19.8853 14.8517H4.11466C3.6618 14.8486 3.2379 14.5427 3.10658 14.1242L1.12837 7.77291L1.06072 7.5865C1.01709 7.46738 0.996927 7.34227 1.00038 7.21748C0.999667 7.10433 1.01836 6.99115 1.0564 6.88266C1.12813 6.67808 1.26497 6.50061 1.44737 6.37561C1.62977 6.25061 1.84841 6.18446 2.07206 6.18661C2.29571 6.18876 2.51295 6.2591 2.69273 6.38758L3.71429 7.10764L7.10536 9.38729L10.1517 4.97048C10.5708 4.36283 11.2618 4 12 4C12.7382 4 13.4292 4.36283 13.8483 4.97048L16.8946 9.38729Z" fill="currentColor"/></svg>`,
    "heart": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 8.53881C22 5.47978 19.5298 3 16.4831 3C14.6335 3 13.0014 3.91659 12 5.31757C10.9986 3.91659 9.36651 3 7.51747 3C4.47023 3 2 5.47922 2 8.53881C2 8.97212 2.05479 9.39197 2.14873 9.79666C2.91473 14.5749 8.20688 19.6159 12 21C15.7926 19.6159 21.0853 14.5749 21.8502 9.79722C21.9452 9.39253 22 8.97268 22 8.53881Z" fill="currentColor"/></svg>`,
    "star": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.785 3.10866L15.9287 7.45093L20.7219 8.14933C22.3552 8.38578 23.0066 10.3917 21.8259 11.5442L18.3559 14.925L19.1748 19.6995C19.4536 21.3249 17.7467 22.5651 16.2873 21.7978L11.9998 19.5429L7.71237 21.7978C6.25138 22.5651 4.5461 21.3249 4.82327 19.6995L5.6438 14.925L2.17531 11.5442C0.993053 10.3917 1.64447 8.38578 3.27771 8.14933L8.07253 7.45093L10.2147 3.10866C10.946 1.63045 13.0537 1.63045 13.785 3.10866Z" fill="currentColor"/></svg>`,
    "verified": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.92893 4.9289C4.18766 5.67017 4.03197 6.76834 3.99926 8.68599C2.66642 10.0651 2 10.9517 2 12C2 13.0483 2.66642 13.9349 3.99927 15.314C4.03197 17.2316 4.18767 18.3298 4.92893 19.071C5.6702 19.8123 6.76834 19.968 8.68595 20.0007C10.0651 21.3336 10.9517 22 12 22C13.0483 22 13.9349 21.3336 15.3141 20.0007C17.2317 19.968 18.3298 19.8123 19.0711 19.071C19.8123 18.3298 19.968 17.2316 20.0007 15.314C21.3336 13.9349 22 13.0483 22 12C22 10.9517 21.3336 10.0651 20.0007 8.68599C19.968 6.76834 19.8123 5.67017 19.0711 4.9289C18.3298 4.18762 17.2316 4.03193 15.314 3.99923C13.9349 2.66641 13.0483 2 12 2C10.9517 2 10.0651 2.66641 8.68602 3.99923C6.76837 4.03193 5.67021 4.18762 4.92893 4.9289ZM15.3254 8.37541C15.6001 7.99371 16.1639 7.88526 16.5849 8.13281C17.0067 8.38036 17.1269 8.89062 16.8534 9.27266C16.8534 9.27266 12.4214 15.4577 12.3005 15.6246C12.0947 15.907 11.7811 16 11.536 16C11.3152 16 11.0931 15.9275 10.9182 15.7808L8.2925 13.5835C7.92317 13.2747 7.90059 12.7532 8.24187 12.4189C8.58316 12.085 9.15937 12.0643 9.52869 12.3734L11.3604 13.9062L15.3254 8.37541Z" fill="currentColor"/></svg>`,
    "reply": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M21.7 7.3a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L18.58 9H13a7 7 0 0 0-7 7v4a1 1 0 1 1-2 0v-4a9 9 0 0 1 9-9h5.59l-3.3-3.3a1 1 0 0 1 1.42-1.4l5 5Z"></path></svg>`,
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
        back(backAction) {
            if (backAction) {
                titlebar.querySelector('.titlebar .titlebar-back').style.display = 'flex';
                titlebar.querySelector('.titlebar .titlebar-back').setAttribute('onclick', `${backAction}`)
                titlebar.querySelector('.titlebar .titlebar-back').innerHTML = `${icon.back}`
                back = `${backAction}`;
            } else {
                titlebar.querySelector('.titlebar .titlebar-back').style.display = 'none';
                back = '';
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

String.prototype.sanitize = function() {
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
};

String.prototype.highlight = function() {
    return this.replace(/(?:^|(?<=\s|<p>))@([\w-]+)(?![^<]*?<\/code>)/g, '<span id="username" class="highlight" onclick="openProfile(\'$1\')">@$1</span>')
};

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
    if (storage.get("username") !== "eri") {
        chatList += `
        <div class="warning">
            <div class="warning-text">
                <span>This is INCOMPLETE!</span>
                <small>Also you shouldn't be seeing this you little rascal.</small>
            </div>
        </div>
        `;
    }

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
        nickname = nickname.sanitize();
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
            if (data.nickname) {
                name = data.nickname.sanitize();
            } else {
                name = `${data.members.find(v => v !== storage.get("username"))}`;
            }
        }

        md.disable(['image']);

        let chatExtra;
        let chatNext;
        if (chatId === 'home') {
            chatExtra = `${userList.length - 1} Users Online`;
            chatNext = `homeModal();`;
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
                    <span class="chat-extra">
                        <span class="userlist">${chatExtra}</span>
                        <span class="typing-indicator"></span>
                    </span>
                </div>
                <div class="message-container">
                    <div class="message-input-wrapper">
                        <div class="message-button">${icon.add}</div>
                        <div class="message-input-container">
                            <textarea class="message-input" oninput="autoResize()" placeholder="Send a message to ${name}..."></textarea>
                        </div>
                        <div class="message-button">${icon.emoji}</div>
                        <div class="message-button message-send" onclick="sendPost();">${icon.send}</div>
                    </div>
                </div>
                <div class="posts">

                </div>
                <div class="skeleton-posts">

                </div>
            </div>
        `;

        loadPosts(1);
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

    let reactions = document.createElement('div');
    reactions.classList.add('post-reactions');
    if (data.reactions) {        
        data.reactions.forEach(reaction => {
            reactions.innerHTML += `
                <div class="reaction ${reaction.user_reacted ? 'reacted' : ''}">
                    <span class="reaction-count">${reaction.count}</span>
                    <span class="reaction-type">${reaction.emoji}</span>
                </div>
            `;
        });
    }

    let replies = document.createElement('div');
    replies.classList.add('post-replies');
    if (data.reply_to) {        
        data.reply_to.forEach(reply => {
            replies.innerHTML += `
                <div class="reply">
                    ${icon.reply}
                    <div class="reply-inner">
                        <div class="reply-avatar" style="--image: url(https://uploads.meower.org/icons/${reply.author.avatar})"></div>
                        <span class="reply-user">${reply.author._id}</span>
                        <span class="reply-content">${reply.p}</span>
                    </div>
                </div>
            `;
        });
    }

    if (data.author._id === 'Server') {
        let post = `
        <div class="post" id="${data._id}">
            <div class="avatar-outer">
            </div>
            <div class="post-wrapper">
                ${replies.outerHTML}
                <div class="post-content" style="opacity: 0.5">${data.emojis ? meowerEmojis(md.render(data.p), data.emojis).highlight() : md.render(data.p).highlight()}</div>
                ${attachments.outerHTML}
                ${reactions.outerHTML}
            </div>
        </div>
        `;

    return post;
    }

    let post = `
        <div class="post" id="${data._id}">
            <div class="avatar-outer">
                <div class="avatar" style="--image: url('https://uploads.meower.org/icons/${data.author.avatar}'); --color: ${data.author.avatar_color}" onclick="openProfile('${data.author._id}')"></div>
            </div>
            <div class="post-wrapper">
                <div class="post-info">
                    <span class="post-author" onclick="openProfile('${data.author._id}')">${data.author._id}</span><span class="post-date">${new Date(Math.trunc(data.t.e * 1000)).toLocaleString([], { month: '2-digit', day: '2-digit', year: '2-digit', hour: 'numeric', minute: 'numeric' })}</span>
                </div>
                ${replies.outerHTML}
                <div class="post-content">${data.emojis ? meowerEmojis(md.render(data.p), data.emojis).highlight() : md.render(data.p).highlight()}</div>
                ${attachments.outerHTML}
                ${reactions.outerHTML}
            </div>
            <div class="post-buttons">
                <div class="post-button" onclick="postModal('${data._id}')">${icon.more}</div>
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
        const newlineregex = /\n/g;
        const lastfmregex = /\|lastfm:([^|]+)\|/;
        const match = data.quote.match(regex);
        
        pronouns = match ? match[1] : "";
        let lastfmuser = data.quote.match(lastfmregex);
        lastfmuser = lastfmuser ? lastfmuser[1] : "";
        quote = data.quote.replace(regex, '');
        editquote = data.quote.replace(regex, '').replace(lastfmregex, '').replace(newlineregex, '');
        quote = md.render(quote).replace(/<a(.*?)>/g, '<a$1 target="_blank">');

        if (userList.includes(storage.get('username'))) {
            attention = 'online';
            recent = 'Online';
        } else {
            recent = `Last Seen: ${timeAgo(data.last_seen)}`;
        }

        content.innerHTML = `
            <div class="settings">
                <div class="profile-settings" style="--modal-accent: #${data.avatar_color};">
                    <div class="modal-banner" style="--banner-color: #${data.avatar_color}"></div>
                    <div class="edit-profile-icon" style="--image: url('https://uploads.meower.org/icons/${data.avatar}')">
                    <div class="edit-profile-overlay">Edit</div>
                    </div>
                    <div class="modal-header"><span>${data._id}</span><span class="pronouns">${pronouns}</span></div>
                    <span class="edit-profile-title">Pronouns</span>
                    <input type="text" class="edit-profile-quote" value="${pronouns}">
                    <span class="edit-profile-title">Quote</span>
                    <textarea class="edit-profile-quote">${editquote}</textarea>
                    <span class="edit-profile-title">Last.fm Username</span>
                    <input type="text" class="edit-profile-quote" value="${lastfmuser}">
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