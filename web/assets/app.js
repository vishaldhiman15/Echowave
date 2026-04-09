const body = document.body;
const currentPage = body.dataset.page;

const navLinks = document.querySelectorAll("[data-nav]");
navLinks.forEach((link) => {
  if (link.dataset.nav === currentPage) {
    link.classList.add("is-active");
  }
});

const menuButton = document.querySelector(".js-menu");
const sidebar = document.getElementById("sidebar");
if (menuButton && sidebar) {
  menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("is-open");
  });
}

const audio = document.getElementById("audio-player");
const masterPlay = document.querySelector(".js-master-play");
const playerTitle = document.querySelector(".js-player-title");
const playerArtist = document.querySelector(".js-player-artist");
const playerCover = document.querySelector(".js-player-cover");
const progressFill = document.querySelector(".js-progress-bar");
const progressTime = document.querySelector(".js-progress-time");
const progressDuration = document.querySelector(".js-progress-duration");

let isPlaying = false;

const formatTime = (value) => {
  if (!value || Number.isNaN(value)) {
    return "0:00";
  }
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const updatePlayerUI = (track) => {
  if (playerTitle) playerTitle.textContent = track.title || "EchoWave";
  if (playerArtist) playerArtist.textContent = track.artist || "";
  if (playerCover && track.cover) playerCover.src = track.cover;
};

const setTrack = (track) => {
  updatePlayerUI(track);
  if (audio && track.audio) {
    audio.src = track.audio;
    audio.load();
  }
};

const togglePlay = () => {
  if (!audio || !audio.src) {
    isPlaying = !isPlaying;
    if (masterPlay) {
      masterPlay.textContent = isPlaying ? "Pause" : "Play";
    }
    return;
  }

  if (isPlaying) {
    audio.pause();
  } else {
    audio.play().catch(() => undefined);
  }
};

if (audio) {
  audio.addEventListener("play", () => {
    isPlaying = true;
    if (masterPlay) masterPlay.textContent = "Pause";
  });

  audio.addEventListener("pause", () => {
    isPlaying = false;
    if (masterPlay) masterPlay.textContent = "Play";
  });

  audio.addEventListener("timeupdate", () => {
    if (!progressFill) return;
    const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progressFill.style.width = `${progress}%`;
    if (progressTime) progressTime.textContent = formatTime(audio.currentTime);
    if (progressDuration) progressDuration.textContent = formatTime(audio.duration);
  });
}

if (masterPlay) {
  masterPlay.addEventListener("click", (event) => {
    event.preventDefault();
    togglePlay();
  });
}

const progressBarContainer = document.querySelector(".progress-bar");
if (progressBarContainer && audio) {
  progressBarContainer.addEventListener("click", (e) => {
    if (!audio.src) return;
    const rect = progressBarContainer.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (audio.duration) {
      audio.currentTime = percent * audio.duration;
    }
  });
}

const trackCards = document.querySelectorAll("[data-track]");
trackCards.forEach((card) => {
  const playButton = card.querySelector(".js-play");
  if (!playButton) return;

  playButton.addEventListener("click", (event) => {
    event.preventDefault();
    const track = {
      title: card.dataset.title,
      artist: card.dataset.artist,
      cover: card.dataset.cover,
      audio: card.dataset.audio || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    };
    setTrack(track);
    togglePlay();
  });
});
