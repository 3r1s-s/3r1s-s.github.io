function emojiModal() {

    let chatEmojis = document.createElement('div');
    chatEmojis.classList.add('chat-emojis');

    let chatsRow = document.createElement('div');
    chatsRow.classList.add('chats-row');

    for (const chat of Object.values(chatCache)) {
        const customEmojis = chat.emojis;
        if (!customEmojis.length) continue;

        const emojisInner = document.createElement('div');
        emojisInner.classList.add('emojis-inner');

        const chatButton = document.createElement('div');
        chatButton.classList.add('chat-emoji-button');
        chatButton.id = chat._id;
        chatButton.style.backgroundImage = `url('https://uploads.meower.org/icons/${chat.icon}')`;

        chatsRow.appendChild(chatButton);
    }

    openModal({
    bodyStyle: `overflow: hidden;height: 100%;`,
    body: `
    <div class="emojis-outer">
        ${chatEmojis.outerHTML}
        ${chatsRow.outerHTML}
    </div>
    `});

    document.querySelectorAll('.chat-emoji-button').forEach(button => {
        button.onclick = function() {
            emojiPage(chatCache[button.id].emojis);
        };
    });

    if (Object.values(chatCache).find(chat => chat.emojis.length > 0)) {
        emojiPage(Object.values(chatCache).find(chat => chat.emojis.length > 0).emojis);
    }
}

function emojiPage(customEmojis) {
    const emojis = document.querySelector('.chat-emojis');
    emojis.innerHTML = '';

    const emojisInner = document.createElement('div');
    emojisInner.classList.add('emojis-inner');

    for (const emoji of customEmojis) {
        const emojiDiv = document.createElement('div');
        emojiDiv.classList.add('emoji-button');
        emojiDiv.style.backgroundImage = `url('https://uploads.meower.org/emojis/${emoji._id}')`;
        emojiDiv.onclick = function() {
            addEmoji('<:' + emoji._id + '>');
        };
        emojisInner.appendChild(emojiDiv);
    }
    emojis.appendChild(emojisInner);
}

function addEmoji(emoji) {
    messageInput().setRangeText(emoji, messageInput().selectionStart, messageInput().selectionEnd, "end");
    autoResize();
    event.preventDefault();
    if (event) {
        if (!event.shiftKey) {
            closeModal();
            messageInput().focus();
        }
    }
    closeModal();
}