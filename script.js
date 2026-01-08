console.log("welcome to javascript");

let audio = new Audio();
let allSongs = []; // MASTER playlist songs
let visibleSongs = []; // FILTERED songs (shown on left)
let currentSong = null;
let currentIndex = 0;

/* =========================
   TIME FORMATTER
========================= */
function secondsToMinutes(seconds) {
  if (isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/* =========================
   PLAY SONG
========================= */
function playSong(song, index) {
  if (!song) return;

  currentSong = song;
  currentIndex = index;

  audio.src = song;
  audio.play();
  play.src = "elements/pause.svg";

  const songName = song
    .split("/")
    .pop()
    .replace(".mp3", "")
    .split(" ")
    .slice(0, 3)
    .join(" ");

  document.querySelector(".songinfo").innerHTML = songName;
}

/* =========================
   FETCH PLAYLIST DATA
========================= */
async function getAllPlaylists() {
  const res = await fetch("/api/songs");
  return await res.json();
}

/* =========================
   LOAD PLAYLIST CARDS
========================= */
async function loadPlaylists() {
  const data = await getAllPlaylists();
  const container = document.querySelector(".playlist-container");

  container.innerHTML = "";

  Object.keys(data).forEach((folder) => {
    const playlistData = data[folder];
    const playlistSongs = Array.isArray(playlistData)
      ? playlistData
      : playlistData.songs;

    const cover = playlistData.cover || "elements/default-cover.jpg";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="play-btn">
        <div class="play-icon"></div>
      </div>
      <img src="${cover}" alt="${folder}">
      <h2>${folder}</h2>
      <p>${playlistSongs.length} songs</p>
    `;

    card.addEventListener("click", () => {
      loadSongsFromFolder(folder, playlistSongs);
    });

    container.appendChild(card);
  });
}

/* =========================
   RENDER SONGS (LEFT PANEL)
========================= */
function renderSongs(songArray, folder) {
  const songUL = document.querySelector(".song-list ul");
  songUL.innerHTML = "";

  songArray.forEach((song, index) => {
    const songName = song.split("/").pop().replace(".mp3", "");

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="info">
        <div class="song-name">${songName}</div>
        <div class="artist-name">${folder}</div>
      </div>
      <div class="playnow">
        <span>Play now</span>
        <img class="invert" src="elements/play.svg" alt="">
      </div>
    `;

    li.addEventListener("click", () => {
      playSong(song, index);
    });

    songUL.appendChild(li);
  });
}

/* =========================
   LOAD SONGS FROM PLAYLIST
========================= */
function loadSongsFromFolder(folder, folderSongs) {
  if (!Array.isArray(folderSongs)) return;

  allSongs = folderSongs; // MASTER
  visibleSongs = [...allSongs]; // SHOW ALL
  currentIndex = 0;

  document.getElementById("searchInput").value = ""; // clear search
  renderSongs(visibleSongs, folder);

  if (allSongs.length > 0) {
    playSong(allSongs[0], 0);
  }
}

/* =========================
   SEARCH FILTER
========================= */
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  visibleSongs = allSongs.filter((song) => song.toLowerCase().includes(query));

  renderSongs(visibleSongs, ""); // artist name not needed in search
});

/* =========================
   MAIN
========================= */
async function main() {
  await loadPlaylists();

  play.addEventListener("click", () => {
    if (!currentSong) return;
    if (audio.paused) {
      audio.play();
      play.src = "elements/pause.svg";
    } else {
      audio.pause();
      play.src = "elements/play.svg";
    }
  });

  previous.addEventListener("click", () => {
    if (currentIndex > 0) {
      playSong(allSongs[currentIndex - 1], currentIndex - 1);
    }
  });

  next.addEventListener("click", () => {
    if (currentIndex < allSongs.length - 1) {
      playSong(allSongs[currentIndex + 1], currentIndex + 1);
    }
  });

  audio.addEventListener("ended", () => {
    if (currentIndex < allSongs.length - 1) {
      playSong(allSongs[currentIndex + 1], currentIndex + 1);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    document.querySelector(".songtime").innerHTML = `00:00 / ${secondsToMinutes(
      audio.duration
    )}`;
  });

  audio.addEventListener("timeupdate", () => {
    if (isNaN(audio.duration)) return;

    document.querySelector(".songtime").innerHTML = `${secondsToMinutes(
      audio.currentTime
    )} / ${secondsToMinutes(audio.duration)}`;

    const percent = (audio.currentTime / audio.duration) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    document.querySelector(".seekbar-progress").style.width = percent + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    audio.currentTime = (clickX / rect.width) * audio.duration;
  });

  const hamburger = document.querySelector(".hamburger img");
  const leftMenu = document.querySelector(".left");

  let isOpen = false;

  hamburger.addEventListener("click", () => {
    if (!isOpen) {
      // Open menu
      leftMenu.style.left = "0";
      hamburger.src = "elements/cross.svg";
      isOpen = true;
    } else {
      // Close menu
      leftMenu.style.left = "-100%";
      hamburger.src = "elements/hamburger.svg";
      isOpen = false;
    }
  });
}

main();
