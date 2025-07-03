// no robes codigo w pajero xdd

let allImages = [];
let currentFilter = 'all';
let currentSearch = '';

function updateCounter(count) {
    const counter = document.getElementById('image-counter');
    if (counter) counter.textContent = `${count}${count === 1 ? '' : ''}`;
}

function filterImages(images, filter, search) {
    let filtered = images;
    if (filter === 'images') {
        filtered = filtered.filter(img => {
            const ext = img.split('.').pop().toLowerCase();
            return ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
        });
    } else if (filter === 'gifs') {
        filtered = filtered.filter(img => img.toLowerCase().endsWith('.gif'));
    } else if (filter === 'videos') {
        filtered = filtered.filter(img => img.toLowerCase().endsWith('.mp4'));
    }
    if (search) {
        filtered = filtered.filter(img => img.toLowerCase().includes(search));
    }
    return filtered;
}

fetch('fire/images.json')
    .then(res => res.json())
    .then(images => {
        allImages = images;
        renderGallery(filterImages(allImages, currentFilter, currentSearch));
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
    updateCounter(images.length);
}


function showModal(src, filename) {
    let modal = document.getElementById('img-modal');
    let modalImg = document.getElementById('modal-img');
    let downloadBtn = document.getElementById('download-btn');
    let videoControls = document.getElementById('video-controls');
    if (!modal || !modalImg || !downloadBtn) return;

    const ext = filename.split('.').pop().toLowerCase();
    if (ext === 'mp4') {
        const video = document.createElement('video');
        video.src = src;
        video.controls = false;
        video.autoplay = false;
        video.loop = false;
        video.style.maxWidth = '90vw';
        video.style.maxHeight = '80vh';
        video.style.borderRadius = '16px';
        video.style.boxShadow = '0 8px 32px #000';
        video.style.background = 'repeating-conic-gradient(#222 0% 25%, #333 0% 50%) 50% / 32px 32px';
        video.setAttribute('playsinline', '');
        video.setAttribute('id', 'modal-img-video');
        video.style.display = 'block';
        video.style.position = 'relative';
        video.style.zIndex = 10001;

        modalImg.style.display = 'none';
        let oldVideo = document.getElementById('modal-img-video');
        if (oldVideo) oldVideo.remove();


        if (videoControls.parentNode !== modal) {
            modal.appendChild(videoControls);
        }
        modal.appendChild(video);
        modal.appendChild(videoControls);

        removeZoomEffect(modalImg);
        modalImg.dataset.noZoom = "1";

        videoControls.style.display = '';
        setupVideoControls(video, videoControls);

        video.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    } else if (ext === 'gif' || ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp') {
        modalImg.src = src;
        modalImg.style.display = '';
        let oldVideo = document.getElementById('modal-img-video');
        if (oldVideo) oldVideo.remove();

        delete modalImg.dataset.noZoom;
        addZoomEffect(modalImg);

        if (videoControls) videoControls.style.display = 'none';
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
            removeZoomEffect(modalImg);
            if (videoControls) videoControls.style.display = 'none';
        }
    };
}


function setupVideoControls(video, controls) {
    const playpauseBtn = controls.querySelector('#playpause-btn');
    const playpauseIcon = playpauseBtn.querySelector('#playpause-icon');
    const seekBar = controls.querySelector('#seek-bar');
    const currentTimeSpan = controls.querySelector('#current-time');
    const durationSpan = controls.querySelector('#duration');
    const muteBtn = controls.querySelector('#mute-btn');
    const muteIcon = muteBtn.querySelector('#mute-icon');
    const volumeBar = controls.querySelector('#volume-bar');


    playpauseBtn.onclick = () => {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };
    function updatePlayPauseIcon() {
        playpauseIcon.setAttribute('d', video.paused
            ? 'M8 5v14l11-7z'
            : 'M6 5h4v14H6zm8 0h4v14h-4z'
        );
    }
    video.onplay = updatePlayPauseIcon;
    video.onpause = updatePlayPauseIcon;
    updatePlayPauseIcon();


    video.ontimeupdate = () => {
        seekBar.value = (video.currentTime / video.duration) * 100 || 0;
        currentTimeSpan.textContent = formatTime(video.currentTime);
    };
    seekBar.oninput = () => {
        video.currentTime = (seekBar.value / 100) * video.duration;
    };


    video.onloadedmetadata = () => {
        durationSpan.textContent = formatTime(video.duration);
        seekBar.value = (video.currentTime / video.duration) * 100 || 0;
        currentTimeSpan.textContent = formatTime(video.currentTime);
    };


    muteBtn.onclick = () => {
        video.muted = !video.muted;
        updateMuteIcon();
    };
    function updateMuteIcon() {
        muteIcon.setAttribute('d', video.muted
            ? 'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zm2.5 0c0 2.76-1.68 5.1-4.07 6.11l1.43 1.43C18.99 17.36 21 14.88 21 12s-2.01-5.36-5.14-6.54l-1.43 1.43C17.32 6.9 19 9.24 19 12zm-7-7v14l-5-5H3v-4h4l5-5z'
            : 'M3 10v4h4l5 5V5l-5 5H3z'
        );
    }
    video.onvolumechange = updateMuteIcon;
    updateMuteIcon();


    volumeBar.oninput = () => {
        video.volume = volumeBar.value;
        video.muted = video.volume == 0;
    };
    video.onvolumechange = () => {
        volumeBar.value = video.volume;
        updateMuteIcon();
    };
    volumeBar.value = video.volume;


    controls.onclick = (e) => e.stopPropagation();
}

function formatTime(sec) {
    sec = Math.floor(sec);
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}


function addZoomEffect(img) {
    if (img.dataset.noZoom === "1") return;
    img.classList.add('zoom-hover');
    let zoom = 1.4;
    let isTouch = window.matchMedia('(pointer: coarse)').matches;

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    let currentZoom = zoom;

    let handleMove = function(e) {
        if (window.innerWidth < 700 || isTouch) {
            img.style.transform = '';
            img.style.transformOrigin = '';
            return;
        }
        const rect = img.getBoundingClientRect();
        let px = e.clientX - rect.left;
        let py = e.clientY - rect.top;
        let safeMarginX = rect.width / (2 * currentZoom);
        let safeMarginY = rect.height / (2 * currentZoom);
        px = clamp(px, safeMarginX, rect.width - safeMarginX);
        py = clamp(py, safeMarginY, rect.height - safeMarginY);
        let x = (px / rect.width) * 100;
        let y = (py / rect.height) * 100;
        img.style.transformOrigin = `${x}% ${y}%`;
        img.style.transform = `scale(${currentZoom})`;
        img.style.zIndex = 10001;
    };

    let handleLeave = function() {
        img.style.transform = '';
        img.style.transformOrigin = '';
        img.style.zIndex = '';
    };

    let handleWheel = function(e) {
        if (window.innerWidth < 700 || isTouch) return;
        e.preventDefault();

        let delta = e.deltaY < 0 ? 0.15 : -0.15;
        currentZoom = clamp(currentZoom + delta, 1, 5);

        if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
            handleMove(e);
        }
    };

    img.addEventListener('mousemove', handleMove);
    img.addEventListener('mouseleave', handleLeave);
    img.addEventListener('wheel', handleWheel, { passive: false });
    img._zoomHandlers = { handleMove, handleLeave, handleWheel };


    if (!img._zoomHelper) {
        const helper = document.createElement('div');
        helper.textContent = 'scrollea para hacer zoom';
        helper.className = 'zoom-helper-text';
        const modal = document.getElementById('img-modal');
        if (modal) {

            modal.insertBefore(helper, modal.firstChild);
        } else {
            img.parentNode.insertBefore(helper, img);
        }
        setTimeout(() => {
            helper.classList.add('show');
        }, 10);
        img._zoomHelper = helper;
    }
    img.tabIndex = 0;
}

function removeZoomEffect(img) {
    img.classList.remove('zoom-hover');
    img.style.transform = '';
    img.style.transformOrigin = '';
    img.style.zIndex = '';
    if (img._zoomHandlers) {
        img.removeEventListener('mousemove', img._zoomHandlers.handleMove);
        img.removeEventListener('mouseleave', img._zoomHandlers.handleLeave);
        img.removeEventListener('wheel', img._zoomHandlers.handleWheel);

        img.removeEventListener('focus', img._zoomHandlers.showZoomHelper);
        img.removeEventListener('blur', img._zoomHandlers.removeZoomHelper);
        if (img._zoomHelper) {

            img._zoomHelper.classList.remove('show');
            setTimeout(() => {
                if (img._zoomHelper) {
                    img._zoomHelper.remove();
                    delete img._zoomHelper;
                }
            }, 350);
        }
        delete img._zoomHandlers;
    }
    img.removeAttribute('tabindex');
}


document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('input', function() {
            currentSearch = this.value.trim().toLowerCase();
            const filtered = filterImages(allImages, currentFilter, currentSearch);
            renderGallery(filtered);
        });
    }

    const filterBar = document.querySelector('.header-filters');
    if (filterBar) {
        filterBar.addEventListener('click', function(e) {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.getAttribute('data-filter');
                const filtered = filterImages(allImages, currentFilter, currentSearch);
                renderGallery(filtered);
            }
        });
    }


    document.querySelectorAll('.image-card').forEach((el, i) => {
      el.style.setProperty('--stagger-delay', `${i * 0.07}s`);
    });
});