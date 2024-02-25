document.getElementById('imagein').addEventListener('change', function (e) {
    const ogimage = document.getElementById('ogimage');
    const compressedimage = document.getElementById('compressedimage');
    ogimage.src = URL.createObjectURL(e.target.files[0]);
    ogimage.style.display = 'block';
    compressedimage.style.display = 'block';

    cmprsimg();
});

document.getElementById('compressionslider').addEventListener('input', function () {
    const compressionval = document.getElementById('compressionval');
    compressionval.textContent = this.value + '%';

    cmprsimg();
});

function cmprsimg() {
    const ogimage = document.getElementById('ogimage');
    const compressionval = document.getElementById('compressionslider').value;
    const usewebp = document.getElementById('webpcheck').checked;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = ogimage.width;
    canvas.height = ogimage.height;

    ctx.drawImage(ogimage, 0, 0, canvas.width, canvas.height);

    const mimeType = usewebp ? 'image/webp' : 'image/jpeg';
    const quality = usewebp ? 1 : compressionval / 100;

    const compressedimageData = canvas.toDataURL(mimeType, quality);

    const compressedimage = document.getElementById('compressedimage');
    compressedimage.src = compressedimageData;
}
