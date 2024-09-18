let user = 'eriiis';
let url = 'https://lastfm-last-played.biancarosa.com.br/' + user + '/latest-song';
let title = document.querySelector('.listening').querySelector('.song-title');
let album = document.querySelector('.listening').querySelector('.song-album');
let artist = document.querySelector('.listening').querySelector('.song-artist');
let songcover = document.querySelector('.listening').querySelector('.cover');

function fetchData() {
    fetch(url)
        .then(function (response) {
            return response.json()
        }).then(function (json) {
            title.innerHTML = json['track']['name'];
            album.innerHTML = json['track']['album']['#text'];
            artist.innerHTML = json['track']['artist']['#text'];
            
            if (json['track']['image']['2']['#text'] === ''){
                songcover.src = 'assets/images/cover.png';
            } else {
                songcover.style.setProperty('--cover', `url('${json['track']['image']['1']['#text'].replace(/64s/, '256s')}')`);
            }
        });
}

function moveCover() {
    songcover.style.setProperty('--rotate', `${Math.floor(Math.random() * 360)}deg`);
}

fetchData();
moveCover();
setInterval(() => { fetchData(); }, 10000);
setInterval(() => { moveCover(); }, 50000);
