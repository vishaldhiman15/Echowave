(() => {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  const toggleButtons = document.querySelectorAll("[data-sidebar-toggle]");

  const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

  const openSidebar = () => {
    if (!sidebar || !backdrop) return;
    sidebar.classList.remove("-translate-x-full");
    sidebar.classList.add("translate-x-0");
    backdrop.classList.remove("hidden");
    backdrop.setAttribute("aria-hidden", "false");
  };

  const closeSidebar = () => {
    if (!sidebar || !backdrop) return;
    sidebar.classList.add("-translate-x-full");
    sidebar.classList.remove("translate-x-0");
    backdrop.classList.add("hidden");
    backdrop.setAttribute("aria-hidden", "true");
  };

  if (sidebar && backdrop) {
    backdrop.addEventListener("click", () => closeSidebar());
    window.addEventListener("resize", () => {
      if (!isMobile()) {
        closeSidebar();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeSidebar();
    });
  }

  toggleButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (!sidebar) return;

      const isClosed = sidebar.classList.contains("-translate-x-full") && isMobile();
      if (isClosed) {
        openSidebar();
      } else {
        closeSidebar();
      }
    });
  });

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    link.addEventListener("click", () => {
      if (isMobile()) closeSidebar();
    });
  });

  // Highlight active nav item.
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const file = href.split("/").pop();
    const active = file === currentFile;

    link.classList.toggle("text-white", active);
    link.classList.toggle("text-subtext", !active);
    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  // Simple back/forward buttons.
  document.querySelectorAll('[data-action="back"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.back();
    });
  });

  document.querySelectorAll('[data-action="forward"]').forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.forward();
    });
  });

  // Player (real audio when available + simulated fallback).
  const playerBar = document.getElementById("player-bar");
  if (!playerBar) return;

  const playerTitle = playerBar.querySelector(".js-player-title");
  const playerArtist = playerBar.querySelector(".js-player-artist");
  const playerCover = playerBar.querySelector(".js-player-cover");
  const toggleButton = playerBar.querySelector(".js-player-toggle");
  const progressFill = playerBar.querySelector(".js-progress-bar");
  const progressTime = playerBar.querySelector(".js-progress-time");
  const progressDuration = playerBar.querySelector(".js-progress-duration");
  const progressBarContainer = playerBar.querySelector(".progress-bar");

  const audio = new Audio();
  audio.preload = "metadata";

  const playIcon =
    '<svg height="18" width="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>';
  const pauseIcon =
    '<svg height="18" width="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"></path></svg>';

  const formatTime = (value) => {
    if (!value || Number.isNaN(value)) return "0:00";
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getTrackFromEl = (trackEl) => {
    const title = trackEl?.dataset?.title || "EchoWave";
    const artist = trackEl?.dataset?.artist || "";
    const cover = trackEl?.dataset?.cover || "assets/img/cover-3.svg";
    const duration = Number(trackEl?.dataset?.duration) || 0;
    const audioUrl = trackEl?.dataset?.audio || "";
    const id = `${title}|${artist}|${cover}|${audioUrl}`;
    return { id, title, artist, cover, duration, audioUrl };
  };

  let currentTrack = null;
  let isPlaying = false;
  let timerId = null;

  // Simulation state (used when audioUrl is missing).
  let simStartMs = 0;
  let simOffsetSec = 0;

  const isAudioTrack = () => Boolean(currentTrack?.audioUrl);

  const getDuration = () => {
    if (isAudioTrack()) {
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) return d;
    }
    return currentTrack?.duration || 0;
  };

  const getSimTime = () => {
    if (!isPlaying) return simOffsetSec;
    const elapsed = (Date.now() - simStartMs) / 1000;
    return simOffsetSec + elapsed;
  };

  const getCurrentTime = () => {
    if (isAudioTrack()) return audio.currentTime || 0;
    return getSimTime();
  };

  const setToggleUI = () => {
    if (!toggleButton) return;
    toggleButton.innerHTML = isPlaying ? pauseIcon : playIcon;
    toggleButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  };

  const updateProgressUI = () => {
    if (!currentTrack) return;
    const duration = getDuration();
    const current = Math.min(duration || 0, Math.max(0, getCurrentTime()));
    const percent = duration ? (current / duration) * 100 : 0;
    if (progressFill) progressFill.style.width = `${percent}%`;
    if (progressTime) progressTime.textContent = formatTime(current);
    if (progressDuration) progressDuration.textContent = formatTime(duration);

    if (!isAudioTrack() && duration && current >= duration && isPlaying) pause();
  };

  const startTimer = () => {
    if (timerId) window.clearInterval(timerId);
    timerId = window.setInterval(updateProgressUI, 300);
  };

  const stopTimer = () => {
    if (!timerId) return;
    window.clearInterval(timerId);
    timerId = null;
  };

  const play = () => {
    if (!currentTrack) return;
    if (!playerBar.classList.contains("hidden")) {
      // already visible
    } else {
      playerBar.classList.remove("hidden");
    }

    if (isAudioTrack()) {
      try {
        if (audio.src !== currentTrack.audioUrl) {
          audio.src = currentTrack.audioUrl;
        }
        audio.play().catch(() => {
          // If playback fails (autoplay restriction / bad URL), fall back to simulation.
          currentTrack.audioUrl = "";
          isPlaying = true;
          simStartMs = Date.now();
          setToggleUI();
          updateProgressUI();
          startTimer();
        });
        isPlaying = true;
      } catch {
        currentTrack.audioUrl = "";
        isPlaying = true;
        simStartMs = Date.now();
      }
    } else {
      isPlaying = true;
      simStartMs = Date.now();
    }

    setToggleUI();
    updateProgressUI();
    startTimer();
  };

  const pause = () => {
    const current = getCurrentTime();
    if (isAudioTrack()) {
      audio.pause();
    } else {
      simOffsetSec = Math.max(0, current);
    }
    isPlaying = false;
    setToggleUI();
    updateProgressUI();
    stopTimer();
  };

  const setTrack = (track) => {
    currentTrack = { ...track };
    simOffsetSec = 0;
    simStartMs = Date.now();

    audio.pause();
    try {
      audio.currentTime = 0;
    } catch {
      // ignore
    }

    if (currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
    } else {
      audio.removeAttribute("src");
      audio.load();
    }

    if (playerTitle) playerTitle.textContent = track.title;
    if (playerArtist) playerArtist.textContent = track.artist;
    if (playerCover) playerCover.src = track.cover;

    updateProgressUI();
  };

  const playTrack = (track) => {
    const isSame = currentTrack && track.id === currentTrack.id;
    if (isSame) {
      if (isPlaying) pause();
      else play();
      return;
    }

    setTrack(track);
    play();
  };

  if (toggleButton) {
    toggleButton.addEventListener("click", (event) => {
      event.preventDefault();
      if (!currentTrack) return;
      if (isPlaying) pause();
      else play();
    });
  }

  if (progressBarContainer) {
    progressBarContainer.addEventListener("click", (event) => {
      if (!currentTrack) return;
      const rect = progressBarContainer.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const duration = getDuration();
      if (isAudioTrack() && Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = audio.duration * percent;
      } else {
        simOffsetSec = (duration || 0) * percent;
        if (isPlaying) simStartMs = Date.now();
      }
      updateProgressUI();
    });
  }

  audio.addEventListener("loadedmetadata", () => updateProgressUI());
  audio.addEventListener("timeupdate", () => updateProgressUI());
  audio.addEventListener("ended", () => {
    isPlaying = false;
    setToggleUI();
    stopTimer();
    updateProgressUI();
  });

  document.addEventListener("click", (event) => {
    const playFirst = event.target.closest("[data-play-first]");
    if (playFirst) {
      event.preventDefault();
      const firstTrackEl = document.querySelector("[data-track]");
      if (firstTrackEl) playTrack(getTrackFromEl(firstTrackEl));
      return;
    }

    const playTrigger = event.target.closest("[data-track-play]");
    if (!playTrigger) return;
    event.preventDefault();

    const trackEl = playTrigger.closest("[data-track]");
    if (!trackEl) return;

    playTrack(getTrackFromEl(trackEl));
  });

  setToggleUI();
})();
