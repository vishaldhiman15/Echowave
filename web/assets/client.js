(() => {
  const API_BASE = "/api";
  const TOKEN_KEY = "echowave_token";

  const getToken = () => {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  };

  const setToken = (token) => {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  };

  const clearToken = () => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const formatTime = (value) => {
    const total = Number(value);
    if (!Number.isFinite(total) || total <= 0) return "0:00";
    const minutes = Math.floor(total / 60);
    const seconds = Math.floor(total % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const apiFetch = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (!isFormData && options.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const isJson = res
      .headers
      .get("content-type")
      ?.toLowerCase()
      .includes("application/json");

    const data = isJson
      ? await res.json().catch(() => null)
      : await res.text().catch(() => null);

    if (!res.ok) {
      const message =
        (data && typeof data === "object" && data.message) ||
        `Request failed (${res.status})`;
      const error = new Error(message);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  };

  const getMe = async () => {
    const token = getToken();
    if (!token) return null;

    try {
      const data = await apiFetch("/auth/me");
      return data?.user || null;
    } catch (error) {
      if (error?.status === 401) {
        clearToken();
      }
      return null;
    }
  };

  const setAuthActions = (user) => {
    document.querySelectorAll("[data-auth-actions]").forEach((slot) => {
      if (!user) return;

      const name = escapeHtml(user.name || "Account");
      slot.innerHTML = `
        <div class="flex items-center gap-3 sm:gap-4 font-bold text-[15px]">
          <div class="hidden sm:block text-subtext max-w-[160px] truncate">${name}</div>
          <button type="button" data-logout class="bg-white text-black py-2.5 px-6 sm:py-3 sm:px-8 rounded-full hover:scale-105 transition">Log out</button>
        </div>
      `;
    });

    if (!user) return;
    document.querySelectorAll("[data-preview-banner]").forEach((el) => {
      el.classList.add("hidden");
    });
  };

  const wireLogout = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-logout]");
      if (!button) return;
      event.preventDefault();
      clearToken();
      window.location.href = "index.html";
    });
  };

  const renderTrackCard = (track) => {
    const title = escapeHtml(track.title || "Untitled");
    const artist = escapeHtml(track.artist?.name || "");
    const cover = escapeHtml(
      track.coverUrl || track.album?.coverUrl || "assets/img/cover-3.svg"
    );
    const duration = Number(track.durationSec) || 0;
    const audio = escapeHtml(track.audioUrl || "");

    return `
      <div class="mcard bg-card p-4 rounded-xl cursor-pointer transition hover:-translate-y-1 group" data-track data-title="${title}" data-artist="${artist}" data-cover="${cover}" data-duration="${duration}" data-audio="${audio}">
        <div class="relative mb-4 aspect-square">
          <img src="${cover}" class="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-xl transition" alt="" />
          <button type="button" data-track-play aria-label="Play ${title}" class="pplay absolute bottom-2 right-2 rounded-full bg-spotify w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 shadow-xl text-black hover:scale-105 hover:bg-spotify-h">
            <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
          </button>
        </div>
        <div class="font-bold mb-1 truncate text-sm">${title}</div>
        <div class="text-subtext text-xs line-clamp-2">${artist}</div>
      </div>
    `;
  };

  const renderArtistCard = (artist) => {
    const name = escapeHtml(artist.name || "Artist");
    const hero = escapeHtml(artist.heroImage || "assets/img/avatar-1.svg");
    const id = artist?._id ? encodeURIComponent(String(artist._id)) : "";
    const href = id ? `artist.html?id=${id}` : "artist.html";

    return `
      <a href="${href}" class="bg-highlight hover:bg-elevated p-4 rounded-lg cursor-pointer transition duration-300 group block">
        <div class="relative mb-4 pb-[100%]">
          <img src="${hero}" class="absolute w-full h-full object-cover rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.5)]" alt="" />
        </div>
        <div class="font-bold mb-1 truncate">${name}</div>
        <div class="text-subtext text-sm">Artist</div>
      </a>
    `;
  };

  const getQueryParam = (key) => {
    try {
      return new URLSearchParams(window.location.search).get(key);
    } catch {
      return null;
    }
  };

  const renderDetailTrackRow = (track, index, { showCover = true } = {}) => {
    const title = escapeHtml(track.title || "Untitled");
    const artist = escapeHtml(track.artist?.name || "");
    const cover = escapeHtml(
      track.coverUrl || track.album?.coverUrl || "assets/img/cover-3.svg"
    );
    const duration = Number(track.durationSec) || 0;
    const audio = escapeHtml(track.audioUrl || "");
    const number = index + 1;

    const coverHtml = showCover
      ? `<img src="${cover}" alt="" class="w-10 h-10 rounded" />`
      : "";

    return `
      <div class="flex items-center gap-4 py-3 hover:bg-white/5 rounded-lg px-3 cursor-pointer" data-track data-track-play data-title="${title}" data-artist="${artist}" data-cover="${cover}" data-duration="${duration}" data-audio="${audio}">
        <div class="w-6 text-subtext font-bold">${number}</div>
        ${coverHtml}
        <div class="flex-1 min-w-0">
          <div class="font-bold truncate">${title}</div>
          <div class="text-subtext text-xs truncate">${artist}</div>
        </div>
        <div class="text-subtext text-xs">${formatTime(duration)}</div>
      </div>
    `;
  };

  const initArtistPage = async () => {
    const nameEl = document.getElementById("artist-name");
    const bioEl = document.getElementById("artist-bio");
    const heroEl = document.getElementById("artist-hero");
    const tracksEl = document.getElementById("artist-tracks");
    const albumLinkEl = document.getElementById("artist-album-link");

    if (!nameEl || !tracksEl) return;

    let artistId = (getQueryParam("id") || "").trim();
    if (!artistId) {
      try {
        const data = await apiFetch("/artists");
        const first = Array.isArray(data?.items) ? data.items[0] : null;
        artistId = first?._id ? String(first._id) : "";
      } catch {
        artistId = "";
      }
    }

    if (!artistId) {
      nameEl.textContent = "Artist";
      tracksEl.innerHTML =
        '<div class="text-subtext text-sm px-3 py-4">No artist found.</div>';
      return;
    }

    try {
      const [artistRes, tracksRes] = await Promise.all([
        apiFetch(`/artists/${encodeURIComponent(artistId)}`),
        apiFetch(`/tracks?artist=${encodeURIComponent(artistId)}`),
      ]);

      const artist = artistRes?.item || null;
      const tracks = Array.isArray(tracksRes?.items) ? tracksRes.items : [];

      if (artist) {
        nameEl.textContent = artist.name || "Artist";
        if (bioEl) bioEl.textContent = artist.bio || "";
        if (heroEl) heroEl.src = artist.heroImage || "assets/img/avatar-1.svg";
        document.title = `Spotify - ${artist.name || "Artist"}`;
      }

      tracksEl.innerHTML = tracks.length
        ? tracks
            .map((t, i) => renderDetailTrackRow(t, i, { showCover: true }))
            .join("")
        : '<div class="text-subtext text-sm px-3 py-4">No tracks yet.</div>';

      if (albumLinkEl) {
        const firstWithAlbum = tracks.find((t) => t?.album);
        const albumId =
          typeof firstWithAlbum?.album === "string"
            ? firstWithAlbum.album
            : firstWithAlbum?.album?._id
              ? String(firstWithAlbum.album._id)
              : "";
        if (albumId) {
          albumLinkEl.href = `album.html?id=${encodeURIComponent(albumId)}`;
        }
      }
    } catch {
      tracksEl.innerHTML =
        '<div class="text-subtext text-sm px-3 py-4">Artist is unavailable right now.</div>';
    }
  };

  const initAlbumPage = async () => {
    const titleEl = document.getElementById("album-title");
    const descEl = document.getElementById("album-description");
    const heroEl = document.getElementById("album-hero");
    const tracksEl = document.getElementById("album-tracks");
    if (!titleEl || !tracksEl) return;

    let albumId = (getQueryParam("id") || "").trim();
    if (!albumId) {
      try {
        const data = await apiFetch("/albums");
        const first = Array.isArray(data?.items) ? data.items[0] : null;
        albumId = first?._id ? String(first._id) : "";
      } catch {
        albumId = "";
      }
    }

    if (!albumId) {
      titleEl.textContent = "Album";
      tracksEl.innerHTML =
        '<div class="text-subtext text-sm px-3 py-4">No album found.</div>';
      return;
    }

    try {
      const data = await apiFetch(`/albums/${encodeURIComponent(albumId)}`);
      const album = data?.item || null;
      const tracks = Array.isArray(album?.tracks) ? album.tracks : [];

      if (album) {
        titleEl.textContent = album.title || "Album";
        if (descEl) descEl.textContent = album.description || "";
        if (heroEl) heroEl.src = album.coverUrl || "assets/img/cover-3.svg";
        document.title = `Spotify - ${album.title || "Album"}`;
      }

      tracksEl.innerHTML = tracks.length
        ? tracks
            .map((t, i) => renderDetailTrackRow(t, i, { showCover: false }))
            .join("")
        : '<div class="text-subtext text-sm px-3 py-4">No tracks yet.</div>';
    } catch {
      tracksEl.innerHTML =
        '<div class="text-subtext text-sm px-3 py-4">Album is unavailable right now.</div>';
    }
  };

  const initPlaylistPage = async () => {
    const titleEl = document.getElementById("playlist-title");
    const descEl = document.getElementById("playlist-description");
    const heroEl = document.getElementById("playlist-hero");
    const tracksEl = document.getElementById("playlist-tracks");
    if (!titleEl || !tracksEl) return;

    let playlistId = (getQueryParam("id") || "").trim();
    if (!playlistId) {
      try {
        const data = await apiFetch("/playlists");
        const first = Array.isArray(data?.items) ? data.items[0] : null;
        playlistId = first?._id ? String(first._id) : "";
      } catch {
        playlistId = "";
      }
    }

    if (!playlistId) {
      titleEl.textContent = "Playlist";
      tracksEl.innerHTML =
        '<div class="text-subtext text-sm px-3 py-4">No playlist found.</div>';
      return;
    }

    try {
      const data = await apiFetch(`/playlists/${encodeURIComponent(playlistId)}`);
      const playlist = data?.item || null;
      const tracks = Array.isArray(playlist?.tracks) ? playlist.tracks : [];

      if (playlist) {
        titleEl.textContent = playlist.name || "Playlist";
        if (descEl) descEl.textContent = playlist.description || "";
        if (heroEl) heroEl.src = playlist.coverUrl || "assets/img/cover-3.svg";
        document.title = `Spotify - ${playlist.name || "Playlist"}`;
      }

      tracksEl.innerHTML = tracks.length
        ? tracks
            .map((t, i) => renderDetailTrackRow(t, i, { showCover: true }))
            .join("")
        : '<div class="text-subtext text-sm px-3 py-4">No tracks yet.</div>';
    } catch {
      tracksEl.innerHTML =
        '<div class="text-subtext text-sm px-3 py-4">Playlist is unavailable right now.</div>';
    }
  };

  const initHome = async () => {
    const dynamicContainer = document.getElementById("home-dynamic-content");
    if (!dynamicContainer) return;

    try {
      const data = await apiFetch("/recommendations");
      const groups = Array.isArray(data?.groups) ? data.groups : [];

      if (!groups.length) {
         // Fallback logic
         return;
      }

      let html = "";
      groups.forEach((group) => {
         const tracks = Array.isArray(group.tracks) ? group.tracks : [];
         if (!tracks.length) return;
         
         const title = escapeHtml(group.title || "");
         html += `
          <section class="mb-10">
            <div class="flex justify-between items-center mb-5">
              <h2 class="text-2xl font-black hover:underline cursor-pointer transition">${title}</h2>
              <a href="#" class="text-subtext font-bold text-sm hover:text-white transition hover:underline">Show all</a>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              ${tracks.map(renderTrackCard).join("")}
            </div>
          </section>`;
      });

      // We should also display Artists row at the top optionally
      const artistsData = await apiFetch("/artists");
      const artists = Array.isArray(artistsData?.items) ? artistsData.items : [];
      if (artists.length > 0) {
         html = `
          <section class="mb-10">
            <div class="flex justify-between items-center mb-5">
              <h2 class="text-2xl font-black hover:underline cursor-pointer transition">Popular Artists</h2>
              <a href="artist.html" class="text-subtext font-bold text-sm hover:text-white transition hover:underline">Show all</a>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              ${artists.slice(0, 6).map(renderArtistCard).join("")}
            </div>
          </section>
         ` + html;
      }

      dynamicContainer.innerHTML = html;
    } catch {
      // Keep fallback UI
    }
  };

  const debounce = (fn, waitMs) => {
    let timer = null;
    return (...args) => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), waitMs);
    };
  };

  const renderTrackRow = (track, likedIds = new Set(), { showLike = true } = {}) => {
    const id = escapeHtml(track._id || "");
    const title = escapeHtml(track.title || "Untitled");
    const artist = escapeHtml(track.artist?.name || "");
    const cover = escapeHtml(
      track.coverUrl || track.album?.coverUrl || "assets/img/cover-3.svg"
    );
    const duration = Number(track.durationSec) || 0;
    const audio = escapeHtml(track.audioUrl || "");

    const liked = likedIds.has(String(track._id));
    const likeLabel = liked ? "Liked" : "Like";

    const likeButton = showLike
      ? `<button type="button" class="text-subtext text-xs font-bold hover:text-white transition" data-like-track="${id}" data-liked="${liked ? "1" : "0"}">${likeLabel}</button>`
      : "";

    return `
      <div class="flex items-center gap-4 py-3 hover:bg-white/5 rounded-lg px-3" data-track data-title="${title}" data-artist="${artist}" data-cover="${cover}" data-duration="${duration}" data-audio="${audio}">
        <button type="button" data-track-play class="shrink-0 w-9 h-9 rounded-full bg-spotify text-black font-bold flex items-center justify-center hover:scale-105 transition" aria-label="Play ${title}">
          <svg height="18" width="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
        </button>
        <img src="${cover}" alt="" class="w-10 h-10 rounded" />
        <div class="flex-1 min-w-0">
          <div class="font-bold truncate">${title}</div>
          <div class="text-subtext text-xs truncate">${artist}</div>
        </div>
        <div class="hidden sm:block text-subtext text-xs w-12 text-right">${formatTime(duration)}</div>
        ${likeButton}
      </div>
    `;
  };

  const initSearch = async () => {
    const input = document.getElementById("search-input");
    const resultsSection = document.getElementById("search-results-section");
    const results = document.getElementById("search-results");
    if (!input || !resultsSection || !results) return;

    const doSearch = debounce(async () => {
      const query = String(input.value || "").trim();
      if (!query) {
        resultsSection.classList.add("hidden");
        results.innerHTML = "";
        return;
      }

      try {
        const data = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
        const tracks = Array.isArray(data?.tracks) ? data.tracks : [];

        if (!tracks.length) {
          resultsSection.classList.remove("hidden");
          results.innerHTML =
            '<div class="text-subtext text-sm px-3 py-4">No results</div>';
          return;
        }

        resultsSection.classList.remove("hidden");
        results.innerHTML = tracks
          .slice(0, 20)
          .map((track) => renderTrackRow(track, new Set(), { showLike: false }))
          .join("");
      } catch {
        resultsSection.classList.remove("hidden");
        results.innerHTML =
          '<div class="text-subtext text-sm px-3 py-4">Search is unavailable right now.</div>';
      }
    }, 250);

    input.addEventListener("input", doSearch);
  };

  const setFormError = (el, message) => {
    if (!el) return;
    if (!message) {
      el.textContent = "";
      el.classList.add("hidden");
      return;
    }
    el.textContent = message;
    el.classList.remove("hidden");
  };

  const initLogin = () => {
    const form = document.getElementById("login-form");
    if (!form) return;

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const errorEl = document.getElementById("auth-error");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setFormError(errorEl, "");

      try {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: email?.value || "",
            password: password?.value || "",
          }),
        });

        if (data?.token) setToken(data.token);
        window.location.href = "library.html";
      } catch (error) {
        setFormError(errorEl, error.message || "Login failed");
      }
    });
  };

  const initSignup = () => {
    const form = document.getElementById("signup-form");
    if (!form) return;

    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const name = document.getElementById("name");
    const errorEl = document.getElementById("auth-error");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setFormError(errorEl, "");

      try {
        const data = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            name: name?.value || "",
            email: email?.value || "",
            password: password?.value || "",
          }),
        });

        if (data?.token) setToken(data.token);
        window.location.href = "index.html";
      } catch (error) {
        setFormError(errorEl, error.message || "Sign up failed");
      }
    });
  };

  const initLibrary = async (user) => {
    const loggedOut = document.querySelector("[data-auth-logged-out]");
    const loggedIn = document.querySelector("[data-auth-logged-in]");
    if (!loggedOut || !loggedIn) return;

    if (!user) {
      loggedOut.classList.remove("hidden");
      loggedIn.classList.add("hidden");
      return;
    }

    loggedOut.classList.add("hidden");
    loggedIn.classList.remove("hidden");

    const userNameEl = loggedIn.querySelector(".js-user-name");
    if (userNameEl) userNameEl.textContent = user.name || "";

    const myTracksList = document.getElementById("my-tracks");
    const likedTracksList = document.getElementById("liked-tracks");
    const libraryError = document.getElementById("library-error");

    const uploadForm = document.getElementById("upload-track-form");
    const uploadStatus = document.getElementById("upload-status");

    const uploadTitle = document.getElementById("upload-title");
    const uploadArtist = document.getElementById("upload-artist");
    const uploadAlbum = document.getElementById("upload-album");
    const uploadCover = document.getElementById("upload-cover");
    const uploadAudio = document.getElementById("upload-audio");

    let likedIds = new Set();

    const refreshLists = async () => {
      setFormError(libraryError, "");

      try {
        const [mine, liked] = await Promise.all([
          apiFetch("/tracks/mine"),
          apiFetch("/tracks/liked"),
        ]);

        const myItems = Array.isArray(mine?.items) ? mine.items : [];
        const likedItems = Array.isArray(liked?.items) ? liked.items : [];
        likedIds = new Set(likedItems.map((t) => String(t._id)));

        if (myTracksList) {
          myTracksList.innerHTML = myItems.length
            ? myItems.map((t) => renderTrackRow(t, likedIds)).join("")
            : '<div class="text-subtext text-sm px-3 py-4">No uploads yet.</div>';
        }

        if (likedTracksList) {
          likedTracksList.innerHTML = likedItems.length
            ? likedItems.map((t) => renderTrackRow(t, likedIds)).join("")
            : '<div class="text-subtext text-sm px-3 py-4">No liked songs yet.</div>';
        }
      } catch (error) {
        setFormError(libraryError, error.message || "Failed to load Library");
      }

      // Load user playlists
      try {
        const pData = await apiFetch("/playlists");
        const allPlaylists = Array.isArray(pData?.items) ? pData.items : [];
        const myPlaylists = allPlaylists.filter(p => p.owner?._id === user._id);
        const playlistsContainer = document.getElementById("my-playlists-sidebar");
        
        if (playlistsContainer) {
          playlistsContainer.innerHTML = myPlaylists.map(p => `
            <a href="playlist.html?id=${p._id}" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition">
              <div class="w-10 h-10 rounded bg-[#282828] flex items-center justify-center shrink-0">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              </div>
              <div class="min-w-0">
                <div class="font-semibold text-sm text-white truncate">${escapeHtml(p.name)}</div>
                <div class="text-[11px] text-subtext">Playlist</div>
              </div>
            </a>
          `).join("");
        }
      } catch (e) {
        // ignore
      }
    };

    // Attach Create Playlist Global listener
    document.addEventListener("click", async (event) => {
      const btn = event.target.closest('[data-action="create-playlist"]');
      if (!btn) return;
      event.preventDefault();
      try {
         const data = await apiFetch("/playlists", {
           method: "POST",
           body: JSON.stringify({ name: "" })
         });
         if (data?.item) {
            window.location.href = \`playlist.html?id=\${data.item._id}\`;
         }
      } catch (e) {
         console.error("Failed to create playlist", e);
      }
    });

    if (uploadForm) {
      uploadForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        setFormError(uploadStatus, "");

        const title = String(uploadTitle?.value || "").trim();
        const artistName = String(uploadArtist?.value || "").trim();
        const albumTitle = String(uploadAlbum?.value || "").trim();
        const audioFile = uploadAudio?.files?.[0] || null;
        const coverFile = uploadCover?.files?.[0] || null;

        if (!title || !artistName || !audioFile) {
          setFormError(uploadStatus, "Title, Artist, and Audio are required.");
          return;
        }

        const submitButton = uploadForm.querySelector('button[type="submit"]');
        if (submitButton) submitButton.disabled = true;

        try {
          const audioForm = new FormData();
          audioForm.append("file", audioFile);
          const audioUploadRes = await apiFetch("/upload/audio", {
            method: "POST",
            body: audioForm,
          });

          let coverUrl = "";
          if (coverFile) {
            const coverForm = new FormData();
            coverForm.append("file", coverFile);
            const coverUploadRes = await apiFetch("/upload/image", {
              method: "POST",
              body: coverForm,
            });
            coverUrl = String(coverUploadRes?.url || "");
          }

          await apiFetch("/tracks", {
            method: "POST",
            body: JSON.stringify({
              title,
              artistName,
              albumTitle,
              audioUrl: String(audioUploadRes?.url || ""),
              coverUrl,
            }),
          });

          setFormError(uploadStatus, "Uploaded successfully.");
          uploadForm.reset();
          await refreshLists();
        } catch (error) {
          setFormError(uploadStatus, error.message || "Upload failed");
        } finally {
          if (submitButton) submitButton.disabled = false;
        }
      });
    }

    document.addEventListener("click", async (event) => {
      const button = event.target.closest("[data-like-track]");
      if (!button) return;

      const trackId = button.getAttribute("data-like-track") || "";
      if (!trackId) return;

      const currentlyLiked = button.getAttribute("data-liked") === "1";

      try {
        if (currentlyLiked) {
          await apiFetch(`/tracks/${encodeURIComponent(trackId)}/like`, {
            method: "DELETE",
          });
          await refreshLists();
        } else {
          await apiFetch(`/tracks/${encodeURIComponent(trackId)}/like`, {
            method: "POST",
          });
          await refreshLists();
        }
      } catch {
        // ignore
      }
    });

    await refreshLists();
  };

  (async () => {
    const user = await getMe();
    setAuthActions(user);
    wireLogout();

    initLogin();
    initSignup();
    await initHome();
    await initSearch();
    await initArtistPage();
    await initAlbumPage();
    await initPlaylistPage();
    await initLibrary(user);
  })();
})();
