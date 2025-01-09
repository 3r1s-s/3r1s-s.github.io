const posts = document.querySelector('.posts');

function createPost(data) {
    const post = document.createElement('div');
    post.className = 'post';
    post.id = `${data.id}`;

    post.innerHTML = `
        <div class="post-user">
            <img src="https://api.wasteof.money/users/${data.user}/picture" alt="profile picture" class="profile-icon pointer">
            <div class="user-info">
                <span class="display-name pointer" onclick="navigate('/user')">${data.name}</span>
                <span class="username no-select">@${data.user}</span>
                <span class="date no-select">${data.date}</span>
            </div>
            <div class="post-right">
                <span class="post-option-icon pointer" onclick='openDropdown(${data.id})'>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path></svg>
                </span>
            </div>
        </div>
        <div class="post-content">
            <span>${markdown(data.content)}</span>
        </div>
        <div class="post-quotes"></div>
        <div class="post-attachments"></div>
        <div class="post-options">
            ${createPostOption('love', data.loves).outerHTML}
            ${createPostOption('repost', data.reposts).outerHTML}
            ${createPostOption('comments', data.comments).outerHTML}
        </div>
        <div class="dropdown" id="dropdown-${data.id}">
            <span class="dropdown-option pointer">
                <span class="dropdown-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                </span>
                <span>Delete</span>
            </span>
            <span class="dropdown-option pointer">
                <span class="dropdown-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
                </span>
                <span>Edit</span>
            </span>
            <span class="dropdown-option pointer">
                <span class="dropdown-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
                </span>
                <span>Pin</span>
            </span>
            <span class="dropdown-option pointer red">
                <span class="dropdown-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clip-rule="evenodd"></path></svg>
                </span>
                <span>Report</span>
            </span>
        </div>
    `;

    const postQuotes = post.querySelector('.post-quotes');
    data.quotes.forEach(quote => {
        postQuotes.appendChild(createPost(quote));
    });

    const postAttachments = post.querySelector('.post-attachments');
    data.attachments.forEach(attachment => {
        const element = document.createElement('img');
        element.src = attachment;
        element.alt = 'attachment';
        element.className = 'attachment';
        postAttachments.appendChild(element);
    });

    return post;
}

function createPostOption(type, count) {
    const option = document.createElement('div');
    option.className = `post-option ${type} inactive`;

    let icon;
    if (type === 'love') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>`;
    } else if (type === 'comments') {
        icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>`;
    } else if (type === 'repost') {
        icon = `<svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.6 3.4l-.8-.8c-.5-.6-.4-1.5.3-1.8.4-.3 1-.2 1.4.2a509.8 509.8 0 012.7 2.7c.5.4.5 1.2.1 1.6l-2.8 2.9c-.5.5-1.3.5-1.8-.1-.3-.5-.2-1 .2-1.5l.8-1H7a4.3 4.3 0 00-4.1 4.7 2036.2 2036.2 0 01.2 8h2.4c.5 0 .8.2 1 .6.2.4.2.9 0 1.2-.2.4-.6.6-1 .6H1.8c-.7 0-1.2-.5-1.2-1.1v-.2V10c0-1.3.3-2.5 1-3.6 1.3-2 3.2-3 5.6-3h4.4zM12.3 18.3h4.6c2.3 0 4.2-2 4.2-4.3V5.9c0-.2 0-.2-.2-.2h-2.3c-.6 0-1-.3-1.2-.8a1.2 1.2 0 011.1-1.6h3.6c.8 0 1.3.5 1.3 1.3v9c0 1.1-.1 2.2-.6 3.2a6.4 6.4 0 01-5.6 3.7l-4.6.1h-.2l.7.8c.4.4.5.9.3 1.3-.3.8-1.3 1-1.9.4L9 20.6l-.4-.5c-.3-.4-.3-1 0-1.4l2.9-3c.6-.6 1.7-.3 2 .6 0 .4 0 .7-.3 1l-.9 1z" fill="currentColor"></path></svg>`;
    }

    option.innerHTML = `
        <span class="post-option-icon pointer">
            ${icon}
        </span>
        <span>${count}</span>
    `;

    return option;
}

function openDropdown(id) {
    const dropdown = document.querySelector(`.dropdown#dropdown-${id}`);
    dropdown.classList.toggle('open');
}

document.addEventListener('click', function(event) {
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target) && !event.target.closest('.post-option-icon')) {
            dropdown.classList.remove('open');
        }
    });
});

function markdown(text) {
    return text
        .replace(/@([a-zA-Z0-9_]+)/g, '<span class="mention pointer">@$1</span>')
        .replace(/#([a-zA-Z0-9_]+)/g, '<span class="hashtag">#$1</span>');
}

function navigate(link) {
    window.location.href = link;
}