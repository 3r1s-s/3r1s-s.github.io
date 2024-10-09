let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
const slideThreshhold = 100;
const arrow = document.querySelector('.arrow-indicator');

window.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;

    if (touchStartX < 50) {
        arrow.style.transform = 'translateX(-50px)';
    }
}, false);

// Listen for touchmove event to update arrow position
window.addEventListener('touchmove', function(event) {
    touchEndX = event.touches[0].clientX;
    let deltaX = touchEndX - touchStartX;
    if (deltaX > 0 && touchStartX < 50) {
        arrow.style.transform = `translateX(${Math.min(deltaX, 50) - 50}px)`;
    }
}, false);

window.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].clientX;

    if (touchStartX < 50 && touchEndX - touchStartX > slideThreshhold) {
        eval(back);
    }

    arrow.style.transform = 'translateX(-100%)';
}, false);

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

function setTheme() {
    document.querySelector('html').classList = '';
    if (theme.get() === 'light') {
        document.querySelector('html').classList.add('light');
    } else if (theme.get() === 'system') {
        if (window.matchMedia) {
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
            if (systemDark.matches) {
            } else {
                document.querySelector('html').classList.add('light');
            }
        }
    } else if (theme.get() === 'catppuccin-macchiato') {
        document.querySelector('html').classList.add('catppuccin-macchiato');
    } else if (theme.get() === 'oled') {
        document.querySelector('html').classList.add('oled');
    } else if (theme.get() === 'watermelon') {
        document.querySelector('html').classList.add('watermelon');
    }

    if (page === 'settings.appearance') {
        if (document.querySelector(`.theme-option.selected`)) {            
            document.querySelector('.theme-option.selected').classList.remove('selected');
        }
        document.querySelector(`.theme-option.${theme.get()}`).classList.add('selected');
    }
}

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${size} ${sizes[i]}`;
}

function meowerEmojis(content, emojis) {
    for (const emoji of emojis) {
        content = content.replaceAll(`&lt;:${emoji._id}&gt;`, `<img src="https://uploads.meower.org/emojis/${emoji._id}" alt=":${emoji.name}:" title=":${emoji.name}:" class="emoji" onclick="emojiInfoModal(${JSON.stringify(emoji).replace(/\"/g, '&quot;')})">`);
    }
    return content;
}

function autoResize() {
    const messageInput = document.querySelector('.message-input');
    const lineHeight = 20;
  
    const lines = messageInput.value.split('\n').length;
    messageInput.style.height = lines * lineHeight + 1 + 'px';
}

// document.addEventListener("keydown", function(event) {
//     if (document.querySelector('.message-input') === document.activeElement && event.key === "Enter" && !event.shiftKey) {
//         event.preventDefault();
//         sendPost();
//      }
// });