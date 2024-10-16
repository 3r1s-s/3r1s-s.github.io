function emojiModal() {

    let chatEmojis = document.createElement('div');
    chatEmojis.classList.add('chat-emojis');

    for (const chat of Object.values(chatCache)) {
        const customEmojis = chat.emojis;
        if (!customEmojis.length) continue;

        chatEmojis.innerHTML = `
        `
    }

    openModal({body: `
        <div id="emojis"></div>
        <div class="chats-row">${chatEmojis.outerHTML}</div>
    `});
}

function addemoji(emoji) {
    messageInput().setRangeText(emoji, messageInput().selectionStart, messageInput().selectionEnd, "end");
    autoresize();
    event.preventDefault();
    if (event) {
        if (!event.shiftKey) {
            closepicker();
            messageInput().focus();
        }
    }
    closemodal();
}