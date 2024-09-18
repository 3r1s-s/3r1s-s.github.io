let user = 'eriiis';
let url = 'https://lastfm-last-played.biancarosa.com.br/' + user + '/latest-song';
let title = document.querySelector('.listening').querySelector('.song-title');
let album = document.querySelector('.listening').querySelector('.song-album');
let artist = document.querySelector('.listening').querySelector('.song-artist');
let songcover = document.querySelector('.listening').querySelector('.cover');

const songText = document.querySelector('.song-title');
let containerWidth = document.querySelector('.song-outer-first').offsetWidth;
let textWidth = songText.offsetWidth;

function fetchData() {
    if (true) {
        songcover.style.setProperty('--cover', `url('https://lastfm.freetls.fastly.net/i/u/256s/9da8be34590e6d59fe131e96693f0475.jpg')`);
        title.innerHTML = 'This is a really really really long name';
        title.setAttribute('style', `--title: 'This is a really really really long name'`);
        album.innerHTML = 'album';
        artist.innerHTML = 'artist';
        containerWidth = document.querySelector('.song-outer-first').offsetWidth;
        textWidth = songText.offsetWidth;
        return
    }
    fetch(url)
        .then(function (response) {
            return response.json()
        }).then(function (json) {
            title.innerHTML = json['track']['name'];
            title.setAttribute('style', `--title: ${json['track']['name']}`);
            album.innerHTML = json['track']['album']['#text'];
            artist.innerHTML = json['track']['artist']['#text'];
            
            if (json['track']['image']['2']['#text'] === ''){
                songcover.src = 'assets/images/cover.png';
            } else {
                songcover.style.setProperty('--cover', `url('${json['track']['image']['1']['#text'].replace(/64s/, '256s')}')`);
            }
        });
        containerWidth = document.querySelector('.song-outer-first').offsetWidth;
        textWidth = songText.offsetWidth;
        scrollText();
}

function moveCover() {
    songcover.style.setProperty('--rotate', `${Math.floor(Math.random() * 360)}deg`);
}

function scrollText() {
    if (textWidth > containerWidth) {
        const scrollDuration = textWidth / 50;
        songText.style.animation = `scroll-text ${scrollDuration}s linear infinite`;
    }
}

// songText.addEventListener('animationiteration', () => {
//     songText.style.animationPlayState = 'paused';
//     setTimeout(() => {
//         songText.style.animationPlayState = 'running';
//     }, 5000);
// });

fetchData();
moveCover();
// scrollText();
setInterval(() => { fetchData(); }, 20000);
setInterval(() => { moveCover(); }, 50000);