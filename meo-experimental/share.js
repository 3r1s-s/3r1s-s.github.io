let pfpCache = "";

async function loadsharedpost() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        return;
    }

    const api = `https://api.meower.org/posts?id=${id}`;
    console.log(api);

    try {
        const response = await fetch(api);
        const data = await response.json();

        loadpost(data);

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}


function loadpost(p) {
    if (p.u == "Discord" || p.u == "SplashBridge") {
        var rcon = p.p;
        var parts = rcon.split(': ');
        var user = parts[0];
        var content = parts.slice(1).join(': ');
    } else {
        var content = p.p;
        var user = p.u;
    }
    
    var postContainer = document.createElement("div");
    postContainer.id = p._id;
    postContainer.classList.add("post");

    var wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("wrapper");

    var pfpDiv = document.createElement("div");
    pfpDiv.classList.add("pfp");

    var pstdte = document.createElement("i");
    pstdte.classList.add("date");
    tsr = p.t.e;
    tsra = tsr * 1000;
    tsrb = Math.trunc(tsra);
    var ts = new Date();
    ts.setTime(tsrb);
    sts = ts.toLocaleString();
    pstdte.innerText = sts;

    var pstinf = document.createElement("h3");
    pstinf.innerHTML = "<span id='username'>" + user + "</span>";

    if (p.u == "Discord" || p.u == "SplashBridge") {
        var bridged = document.createElement("bridge");
        bridged.innerText = "Bridged";
        bridged.setAttribute("title", "This post has been bridged from another platform.");
        pstinf.appendChild(bridged);
    }
    pstinf.appendChild(pstdte);

    wrapperDiv.appendChild(pstinf);

    var replyregex = /@(\w+)\s+"([^"]*)"\s+\(([^)]+)\)/g;
    var match = replyregex.exec(content);
    if (match) {
        var replyid = match[3];
        var pageContainer = document.getElementById("msgs");
    
        if (pageContainer.firstChild) {
            pageContainer.insertBefore(postContainer, pageContainer.firstChild);
        } else {
            pageContainer.appendChild(postContainer);
        }
    
        loadreply(replyid).then(replycontainer => {
            var pElement = wrapperDiv.getElementsByTagName("p")[0];
            wrapperDiv.insertBefore(replycontainer, pElement);
        });
    
        content = content.replace(match[0], '').trim();
    }

    var postContentText = document.createElement("p");
    
    blist = ["", " ", "# ", "## ", "### ", "#### ", "##### ", "###### ", "\n"];
    if (!blist.includes(content)) {
        var asplc = content;
        
        
        var escapedinput = asplc
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    
        var textContent = escapedinput
            .replace(/\*\*\*\*(.*?[^\*])\*\*\*\*/g, '$1')
            .replace(/\*\*(.*?[^\*])\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?[^\*])\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<div class="code"><code>$1</code></div>')
            .replace(/``([^`]+)``/g, '<code>$1</code>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/^# (.*?$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*?$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*?$)/gm, '<h3>$1</h3>')
            .replace(/^&gt; (.*?$)/gm, '<blockquote>$1</blockquote>')
            .replace(/~~([\s\S]*?)~~/g, '<del>$1</del>')
            .replace(/(?:https?|ftp):\/\/[^\s(){}[\]]+/g, function (url) {
                return `<a href="${url.replace(/<\/?blockquote>/g, '')}" target="_blank">${url}</a>`;
            })
            .replace(/&lt;:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.webp?size=96&quality=lossless" alt="$1" width="16px" class="emoji">')
            .replace(/&lt;a:(\w+):(\d+)&gt;/g, '<img src="https://cdn.discordapp.com/emojis/$2.gif?size=96&quality=lossless" alt="$1" width="16px" class="emoji">')
            .replace(/\n/g, '<br>');
            
        var isEmoji = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(content);
        
        if (isEmoji) {
            postContentText.classList.add("big");
        }
    
        postContentText.innerHTML = textContent;

        postContentText.querySelectorAll('p a').forEach(link => {
            const url = link.getAttribute('href');
            const fileExtension = url.split('.').pop().toLowerCase();
            const fileDomain = url.includes('tenor.com/view');
            
            if ((['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm', 'mov', 'm4v'].includes(fileExtension)) || fileDomain) {
                link.classList.add('attachment');
                link.innerHTML = '<svg class="icon_ecf39b icon__13ad2" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M10.57 4.01a6.97 6.97 0 0 1 9.86 0l.54.55a6.99 6.99 0 0 1 0 9.88l-7.26 7.27a1 1 0 0 1-1.42-1.42l7.27-7.26a4.99 4.99 0 0 0 0-7.06L19 5.43a4.97 4.97 0 0 0-7.02 0l-8.02 8.02a3.24 3.24 0 1 0 4.58 4.58l6.24-6.24a1.12 1.12 0 0 0-1.58-1.58l-3.5 3.5a1 1 0 0 1-1.42-1.42l3.5-3.5a3.12 3.12 0 1 1 4.42 4.42l-6.24 6.24a5.24 5.24 0 0 1-7.42-7.42l8.02-8.02Z" class=""></path></svg><span> attachments</span>';
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

        wrapperDiv.appendChild(postContentText);

        var links = content.match(/(?:https?|ftp):\/\/[^\s(){}[\]]+/g);
        if (links) {
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
                        
                        var embeddedElement = document.createElement("iframe");
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

                        var embeddedElement = document.createElement('div');
                        embeddedElement.className = 'tenor-gif-embed';
                        embeddedElement.setAttribute('data-postid', postId);
                        embeddedElement.setAttribute('data-share-method', 'host');
                        embeddedElement.setAttribute('data-style', 'width: 100%; height: 100%; border-radius: 5px; max-width: 400px; aspect-ratio: 1 / 1; max-height: 400px;');

                        embeddedElement.classList.add("embed");

                        postContainer.appendChild(embeddedElement);
                        var scriptTag = document.createElement('script');
                        scriptTag.setAttribute('type', 'text/javascript');
                        scriptTag.setAttribute('src', 'embed.js');
                        postContainer.appendChild(scriptTag);
                    }
                }
                
                if (embeddedElement) {
                    wrapperDiv.appendChild(embeddedElement);
                }
            });
        }
    }

    loadPfp(user)
        .then(pfpElement => {
            if (pfpElement) {
                pfpDiv.appendChild(pfpElement);
                //thx stackoverflow
                pfpCache[user] = pfpElement.cloneNode(true);
            }
        });

    postContainer.appendChild(pfpDiv);  
    postContainer.appendChild(wrapperDiv);

    var pageContainer = document.getElementById("msgs");
    if (pageContainer.firstChild) {
        pageContainer.insertBefore(postContainer, pageContainer.firstChild);
    } else {
        pageContainer.appendChild(postContainer);
    }
}

function loadPfp(username) {
    return new Promise((resolve, reject) => {
        if (pfpCache[username]) {
            resolve(pfpCache[username].cloneNode(true));
        } else {
            let pfpElement; //make pfp element EXIST

            fetch(`https://api.meower.org/users/${username}`)
                .then(userResp => userResp.json())
                .then(userData => {

                    if (userData.avatar) {
                        const pfpurl = `https://uploads.meower.org/icons/${userData.avatar}`;

                        pfpElement = document.createElement("img");
                        pfpElement.setAttribute("src", pfpurl);
                        pfpElement.setAttribute("alt", "User Avatar");
                        pfpElement.classList.add("avatar");

                        if (userData.avatar_color) {
                            pfpElement.style.border = `3px solid #${userData.avatar_color}`;
                        }
                    } else if (userData.pfp_data) {
                        const pfpurl = `images/avatars/icon_${userData.pfp_data - 1}.svg`;

                        pfpElement = document.createElement("img");
                        pfpElement.setAttribute("src", pfpurl);
                        pfpElement.setAttribute("alt", "User Avatar");
                        pfpElement.classList.add("avatar");
                    } else {
                        console.error("No avatar or pfp_data available for: ", username);
                        resolve(null);
                    }

                    if (pfpElement) {
                        pfpCache[username] = pfpElement.cloneNode(true);
                    }

                    resolve(pfpElement);
                })
                .catch(error => {
                    console.error("Failed to fetch:", error);
                    resolve(null);
                });
        }
    });
}

async function loadreply(replyid) {
    try {
        const replyresp = await fetch(`https://api.meower.org/posts?id=${replyid}`, {
            headers: {token: localStorage.getItem("token")}
        });
        const replydata = await replyresp.json();

        const replycontainer = document.createElement("div");
        replycontainer.classList.add("reply");
        replycontainer.innerHTML = `<p style='font-weight:bold;margin: 10px 0 10px 0;'>${replydata.u}</p><p style='margin: 10px 0 10px 0;'>${replydata.p}</p>`;

        return replycontainer;
    } catch (error) {
        console.error("Error fetching reply:", error);
        return document.createElement("p");
    }
}

window.onload = loadsharedpost();