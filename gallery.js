// no robes codigo w pajero xdd

let allImages = [];

fetch('fire/images.json')
    .then(res => res.json())
    .then(images => {
        allImages = images;
        renderGallery(images);
    });

function renderGallery(images) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    images.forEach((img, idx) => {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.style.animationDelay = `${idx * 0.07}s`;

        const ext = img.split('.').pop().toLowerCase();
        let media;
        if (ext === 'mp4') {
            media = document.createElement('video');
            media.src = `fire/${img}`;
            media.controls = false;
            media.muted = true;
            media.loop = true;
            media.autoplay = true;
            media.playsInline = true;
            media.alt = img;
            media.style.width = '100%';
            media.style.display = 'block';
        } else if (ext === 'gif' || ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') {

            media = document.createElement('img');
            media.src = `fire/${img}`;
            media.alt = img;
        } else {

            return;
        }

        card.appendChild(media);
        gallery.appendChild(card);


        card.onclick = () => showModal(`fire/${img}`, img);
    });
}


function showModal(src, filename) {
    let modal = document.getElementById('img-modal');
    let modalImg = document.getElementById('modal-img');
    let downloadBtn = document.getElementById('download-btn');
    if (!modal || !modalImg || !downloadBtn) return;

    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'mp4') {

        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.autoplay = false;
        video.loop = false;
        video.style.maxWidth = '90vw';
        video.style.maxHeight = '80vh';
        video.style.borderRadius = '16px';
        video.style.boxShadow = '0 8px 32px #000';
        video.style.background = 'repeating-conic-gradient(#222 0% 25%, #333 0% 50%) 50% / 32px 32px';
        video.setAttribute('playsinline', '');
        video.setAttribute('id', 'modal-img-video');

        modalImg.style.display = 'none';
        let oldVideo = document.getElementById('modal-img-video');
        if (oldVideo) oldVideo.remove();
        modalImg.insertAdjacentElement('afterend', video);
    } else if (ext === 'gif' || ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') {

        modalImg.src = src;
        modalImg.style.display = '';
        let oldVideo = document.getElementById('modal-img-video');
        if (oldVideo) oldVideo.remove();
    } else {

        return;
    }

    modal.style.display = 'flex';


    downloadBtn.onclick = (e) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = src;
        link.download = filename || 'descarga';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalImg.src = '';
            let oldVideo = document.getElementById('modal-img-video');
            if (oldVideo) oldVideo.remove();
        }
    };
}


document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    if (!searchBox) return;
    searchBox.addEventListener('input', function() {
        const val = this.value.trim().toLowerCase();
        if (!val) {
            renderGallery(allImages);
        } else {
            const filtered = allImages.filter(img => img.toLowerCase().includes(val));
            renderGallery(filtered);
        }
    });
});