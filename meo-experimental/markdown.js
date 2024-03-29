// dont be fooled 
// theres more than just markdown stuff in here
// im bad at naming things ok

function escapeHTML(content) {
    var escapedinput = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    return escapedinput;
}

function erimd(content) {
    var text = content
    .replace(/&lt;:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.webp?size=96&quality=lossless" alt="$1" width="16px" class="emoji">')
    .replace(/&lt;a:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.gif?size=96&quality=lossless" alt="$1" width="16px" class="emoji">')
    
    return text;
}

function buttonbadges(content) {
    content.querySelectorAll('p a').forEach(link => {
        link.setAttribute('target', '_blank');
        const url = link.getAttribute('href');
        const fileExtension = url.split('.').pop().toLowerCase().split('?')[0];
        const fileDomain = url.includes('tenor.com/view');
        
        if ((['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov', 'm4v'].includes(fileExtension)) || fileDomain) {
            link.classList.add('attachment');
            link.innerHTML = '<svg class="icon_ecf39b icon__13ad2" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M10.57 4.01a6.97 6.97 0 0 1 9.86 0l.54.55a6.99 6.99 0 0 1 0 9.88l-7.26 7.27a1 1 0 0 1-1.42-1.42l7.27-7.26a4.99 4.99 0 0 0 0-7.06L19 5.43a4.97 4.97 0 0 0-7.02 0l-8.02 8.02a3.24 3.24 0 1 0 4.58 4.58l6.24-6.24a1.12 1.12 0 0 0-1.58-1.58l-3.5 3.5a1 1 0 0 1-1.42-1.42l3.5-3.5a3.12 3.12 0 1 1 4.42 4.42l-6.24 6.24a5.24 5.24 0 0 1-7.42-7.42l8.02-8.02Z" class=""></path></svg><span> attachments</span>';
        } else if (url === "https://meo-32r.pages.dev/" || url === "https://meo-32r.pages.dev") {
            link.classList.add('attachment');
            link.innerHTML = '<span class="ext-link-wrapper"><span class="link-icon-wrapper"><img width="14px" class="ext-icon" src="images/links/meo_1x.png"></span>meo</span>';
        } else {
            // find a better method to do this
            const socregex = {
                'twitter': /twitter\.com\/@(\w+)/,
                'discord_user': /discord\.com\/users\/(\w+)/,
                'discord_channel': /discord\.com\/channels\/(\w+)/,
                'discord_server': /discord\.gg\/(\w+)/,
                'youtube': /youtube\.com\/@(\w+)/,
                'instagram': /instagram\.com\/(\w+)/,
                'facebook': /facebook\.com\/(\w+)/,
                'scratch': /scratch\.mit.edu\/users\/(\w+)/,
                'meower_user': /app.meower\.org\/users\/(\w+)/,
                'meower_share': /meo-32r\.pages\.dev\/share\?id=([\w-]+)/
            };
            
            const socialmedicns = {
                'twitter': 'twitter_1x.png',
                'discord_user': 'discord_1x.png',
                'discord_channel': 'discord_1x.png',
                'discord_server': 'discord_1x.png',
                'youtube': 'youtube_1x.png',
                'instagram': 'instagram_1x.png',
                'facebook': 'facebook_1x.png',
                'scratch': 'scratch_1x.png',
                'meower_user': 'meo_1x.png',
                'meower_share': 'meo_1x.png'
            };
    
            for (const [platform, regex] of Object.entries(socregex)) {
                const match = url.match(regex);
                if (match) {
                    const username = match[1];
                    link.classList.add('ext-link');
                    const icon = socialmedicns[platform];
                    link.innerHTML = `<span class="ext-link-wrapper"><span class="link-icon-wrapper"><img width="14px" class="ext-icon" src="images/links/${icon}"></span>${username}</span>`;
                }
            }
        }
    });
    
    return content.innerHTML;
}

function embed(links) {
    if (links) {
        var embeddedElements = [];

        links.forEach(link => {
            var baseURL = link.split('?')[0];
            var fileExtension = baseURL.split('.').pop().toLowerCase();
            var embeddedElement;

            if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExtension)) {
                var imgElement = document.createElement("img");
                imgElement.setAttribute("src", baseURL);
                imgElement.setAttribute("style", "max-width: 300px; max-height: 300px");
                imgElement.classList.add("embed");

                var imgLink = document.createElement("a");
                imgLink.setAttribute("href", baseURL);
                imgLink.setAttribute("target", "_blank");
                imgLink.appendChild(imgElement);

                embeddedElement = imgLink;
            } else if (['mp4', 'webm', 'mov', 'mp3', 'wav', 'ogg'].includes(fileExtension)) {
                embeddedElement = document.createElement("video");
                embeddedElement.setAttribute("src", baseURL);
                embeddedElement.setAttribute("controls", "controls");
                embeddedElement.setAttribute("style", "max-width: 300px;");
                embeddedElement.classList.add("embed");
            }

            var youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            if (youtubeRegex.test(link)) {
                var match = link.match(youtubeRegex);
                var videoId = match[4];

                embeddedElement = document.createElement("iframe");
                embeddedElement.setAttribute("width", "100%");
                embeddedElement.setAttribute("height", "315");
                embeddedElement.setAttribute("style", "max-width:500px;");
                embeddedElement.setAttribute("class", "embed");
                embeddedElement.setAttribute("src", "https://www.youtube.com/embed/" + videoId);
                embeddedElement.setAttribute("title", "YouTube video player");
                embeddedElement.setAttribute("frameborder", "0");
                embeddedElement.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
                embeddedElement.setAttribute("allowfullscreen", "");
            } else if (link.includes('open.spotify.com')) {
                var spotifyRegex = /track\/([a-zA-Z0-9]+)/;
                var match = link.match(spotifyRegex);
                if (match) {
                    var trackId = match[1];

                    embeddedElement = document.createElement("iframe");
                    embeddedElement.setAttribute("style", "border-radius: 12px;max-width:500px;");
                    embeddedElement.setAttribute("src", `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`);
                    embeddedElement.setAttribute("width", "100%");
                    embeddedElement.setAttribute("height", "80px");
                    embeddedElement.setAttribute("frameBorder", "0");
                    embeddedElement.setAttribute("allowfullscreen", "");
                    embeddedElement.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
                    embeddedElement.setAttribute("loading", "lazy");

                    embeddedElement.classList.add("embed");
                }
            } else if (link.includes('tenor.com')) {
                var tenorRegex = /\d+$/;
                var tenorMatch = link.match(tenorRegex);
                var postId = tenorMatch ? tenorMatch[0] : null;

                if (postId) {
                    embeddedElement = document.createElement('div');
                    embeddedElement.className = 'tenor-gif-embed';
                    embeddedElement.setAttribute('data-postid', postId);
                    embeddedElement.setAttribute('data-share-method', 'host');
                    embeddedElement.setAttribute('data-style', 'width: 100%; height: 100%; border-radius: 5px; max-width: 400px; aspect-ratio: 1 / 1; max-height: 400px;');

                    embeddedElement.classList.add("embed");

                    var scriptTag = document.createElement('script');
                    scriptTag.setAttribute('type', 'text/javascript');
                    scriptTag.setAttribute('src', 'embed.js');
                    embeddedElement.appendChild(scriptTag);
                }
            }

            if (embeddedElement) {
                embeddedElements.push(embeddedElement);
            }
        });

        return embeddedElements;
    }
}

function createButtonContainer(p) {
    var buttonContainer = document.createElement("div");
    buttonContainer.classList.add("buttonContainer");
    buttonContainer.innerHTML = `
    <div class='toolbarContainer'>
        <div class='toolButton' onclick='sharepost()'>
            <svg viewBox='0 0 20 20' fill='currentColor' width='19' height='19'><path d='M12.9297 3.25007C12.7343 3.05261 12.4154 3.05226 12.2196 3.24928L11.5746 3.89824C11.3811 4.09297 11.3808 4.40733 11.5739 4.60245L16.5685 9.64824C16.7614 9.84309 16.7614 10.1569 16.5685 10.3517L11.5739 15.3975C11.3808 15.5927 11.3811 15.907 11.5746 16.1017L12.2196 16.7507C12.4154 16.9477 12.7343 16.9474 12.9297 16.7499L19.2604 10.3517C19.4532 10.1568 19.4532 9.84314 19.2604 9.64832L12.9297 3.25007Z'></path><path d='M8.42616 4.60245C8.6193 4.40733 8.61898 4.09297 8.42545 3.89824L7.78047 3.24928C7.58466 3.05226 7.26578 3.05261 7.07041 3.25007L0.739669 9.64832C0.5469 9.84314 0.546901 10.1568 0.739669 10.3517L7.07041 16.7499C7.26578 16.9474 7.58465 16.9477 7.78047 16.7507L8.42545 16.1017C8.61898 15.907 8.6193 15.5927 8.42616 15.3975L3.43155 10.3517C3.23869 10.1569 3.23869 9.84309 3.43155 9.64824L8.42616 4.60245Z'></path></svg>
        </div>
        <div class='toolButton' onclick='reportModal("${p._id}")'>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M20 6.00201H14V3.00201C14 2.45001 13.553 2.00201 13 2.00201H4C3.447 2.00201 3 2.45001 3 3.00201V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.00201C21 6.45001 20.553 6.00201 20 6.00201Z"></path></svg>
        </div>
        <div class='toolButton' onclick='pingusr(event)'>
            <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.486 2 2 6.486 2 12C2 17.515 6.486 22 12 22C14.039 22 15.993 21.398 17.652 20.259L16.521 18.611C15.195 19.519 13.633 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12V12.782C20 14.17 19.402 15 18.4 15L18.398 15.018C18.338 15.005 18.273 15 18.209 15H18C17.437 15 16.6 14.182 16.6 13.631V12C16.6 9.464 14.537 7.4 12 7.4C9.463 7.4 7.4 9.463 7.4 12C7.4 14.537 9.463 16.6 12 16.6C13.234 16.6 14.35 16.106 15.177 15.313C15.826 16.269 16.93 17 18 17L18.002 16.981C18.064 16.994 18.129 17 18.195 17H18.4C20.552 17 22 15.306 22 12.782V12C22 6.486 17.514 2 12 2ZM12 14.599C10.566 14.599 9.4 13.433 9.4 11.999C9.4 10.565 10.566 9.399 12 9.399C13.434 9.399 14.6 10.565 14.6 11.999C14.6 13.433 13.434 14.599 12 14.599Z"></path></svg>
        </div>
        <div class='toolButton' onclick='reply(event)'>
            <svg width='24' height='24' viewBox='0 0 24 24'><path d='M10 8.26667V4L3 11.4667L10 18.9333V14.56C15 14.56 18.5 16.2667 21 20C20 14.6667 17 9.33333 10 8.26667Z' fill='currentColor'></path></svg>
        </div>
    </div>
    `;
    
    if (p.u === localStorage.getItem("uname")) {
        var nwbtn = document.createElement("div");
        nwbtn.classList.add("toolButton");
        nwbtn.setAttribute("onclick", `openUpdate("Not finished yet :(")`);
        nwbtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.2929 9.8299L19.9409 9.18278C21.353 7.77064 21.353 5.47197 19.9409 4.05892C18.5287 2.64678 16.2292 2.64678 14.817 4.05892L14.1699 4.70694L19.2929 9.8299ZM12.8962 5.97688L5.18469 13.6906L10.3085 18.813L18.0201 11.0992L12.8962 5.97688ZM4.11851 20.9704L8.75906 19.8112L4.18692 15.239L3.02678 19.8796C2.95028 20.1856 3.04028 20.5105 3.26349 20.7337C3.48669 20.9569 3.8116 21.046 4.11851 20.9704Z" fill="currentColor"></path></svg>
        `;
        buttonContainer.querySelector('.toolbarContainer').prepend(nwbtn);
        var nwbtn = document.createElement("div");
        nwbtn.classList.add("toolButton");
        nwbtn.setAttribute("onclick", `deletePost("${p._id}")`);
        nwbtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15 3.999V2H9V3.999H3V5.999H21V3.999H15Z"></path><path fill="currentColor" d="M5 6.99902V18.999C5 20.101 5.897 20.999 7 20.999H17C18.103 20.999 19 20.101 19 18.999V6.99902H5ZM11 17H9V11H11V17ZM15 17H13V11H15V17Z"></path></svg>
        `;
        buttonContainer.querySelector('.toolbarContainer').prepend(nwbtn);
    }

    if (localStorage.getItem("permissions") === "1") {
        var nwbtn = document.createElement("div");
        nwbtn.classList.add("toolButton");
        nwbtn.setAttribute("onclick", `modPostModal("${p._id}")`);
        nwbtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.00001C15.56 6.00001 12.826 2.43501 12.799 2.39801C12.421 1.89801 11.579 1.89801 11.201 2.39801C11.174 2.43501 8.44 6.00001 5 6.00001C4.447 6.00001 4 6.44801 4 7.00001V14C4 17.807 10.764 21.478 11.534 21.884C11.68 21.961 11.84 21.998 12 21.998C12.16 21.998 12.32 21.96 12.466 21.884C13.236 21.478 20 17.807 20 14V7.00001C20 6.44801 19.553 6.00001 19 6.00001ZM15 16L12 14L9 16L10 13L8 11H11L12 8.00001L13 11H16L14 13L15 16Z"></path></svg>
        `;
        buttonContainer.querySelector('.toolbarContainer').prepend(nwbtn);
    }

    return buttonContainer;
}