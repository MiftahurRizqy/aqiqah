const cover = document.getElementById("cover");
const openButton = document.getElementById("openInvitation");
const invitation = document.getElementById("invitation");
const guestName = document.getElementById("guestName");
const invitationMusic = document.getElementById("invitationMusic");
const musicToggle = document.getElementById("musicToggle");
let invitationOpened = false;
let musicStarted = false;
let musicFadeFrame = null;
let musicManuallyStopped = false;

const params = new URLSearchParams(window.location.search);
const guest =
  params.get("to") ||
  params.get("tamu") ||
  params.get("nama") ||
  params.get("guest");

if (guest && guest.trim()) {
  guestName.textContent = guest.trim().replace(/\s+/g, " ");
}

function updateMusicButton() {
  if (!musicToggle || !invitationMusic) {
    return;
  }

  const isPlaying = !invitationMusic.paused && !invitationMusic.muted;
  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "Matikan musik" : "Putar musik");
}

function fadeVolume(targetVolume = 0.58, duration = 4200) {
  if (!invitationMusic) {
    return;
  }

  if (musicFadeFrame) {
    cancelAnimationFrame(musicFadeFrame);
  }

  const startVolume = invitationMusic.volume;
  const fadeStart = performance.now();

  function fade(now) {
    const progress = Math.min((now - fadeStart) / duration, 1);
    invitationMusic.volume = startVolume + (targetVolume - startVolume) * progress;

    if (progress < 1) {
      musicFadeFrame = requestAnimationFrame(fade);
    }
  }

  musicFadeFrame = requestAnimationFrame(fade);
}

function startMusic() {
  if (!invitationMusic) {
    return Promise.reject();
  }

  invitationMusic.muted = false;
  invitationMusic.volume = 0;

  function startPlayback() {
    if (Number.isFinite(invitationMusic.duration) && invitationMusic.duration > 20) {
      invitationMusic.currentTime = 20;
    }

    return invitationMusic.play().then(() => {
      musicStarted = true;
      fadeVolume();
      updateMusicButton();
    });
  }

  if (invitationMusic.readyState >= 1) {
    return startPlayback();
  }

  return new Promise((resolve, reject) => {
    invitationMusic.addEventListener("loadedmetadata", () => startPlayback().then(resolve).catch(reject), { once: true });
  });
}

function tryStartMusic() {
  if (!invitationMusic || musicStarted || musicManuallyStopped) {
    return;
  }

  startMusic().catch(() => {
    musicStarted = false;
    updateMusicButton();
  });
}

function stopMusic() {
  if (!invitationMusic) {
    return;
  }

  invitationMusic.pause();
  musicStarted = false;
  musicManuallyStopped = true;
  updateMusicButton();
}

function unlockMusicOnFirstGesture() {
  tryStartMusic();
  if (musicStarted) {
    window.removeEventListener("pointerdown", unlockMusicOnFirstGesture);
    window.removeEventListener("touchstart", unlockMusicOnFirstGesture);
    window.removeEventListener("keydown", unlockMusicOnFirstGesture);
  }
}

document.addEventListener("DOMContentLoaded", tryStartMusic);
window.addEventListener("load", tryStartMusic);
window.addEventListener("pointerdown", unlockMusicOnFirstGesture);
window.addEventListener("touchstart", unlockMusicOnFirstGesture, { passive: true });
window.addEventListener("keydown", unlockMusicOnFirstGesture);

if (musicToggle) {
  musicToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    if (invitationMusic && !invitationMusic.paused) {
      stopMusic();
    } else {
      musicManuallyStopped = false;
      startMusic().catch(updateMusicButton);
    }
  });
}

openButton.addEventListener("click", () => {
  invitationOpened = true;
  cover.classList.add("is-opened");
  document.body.classList.remove("locked");
  tryStartMusic();
  setTimeout(() => invitation.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
});

window.addEventListener(
  "wheel",
  (event) => {
    if (!invitationOpened && window.scrollY < cover.offsetHeight - 2 && event.deltaY > 0) {
      event.preventDefault();
    }
  },
  { passive: false }
);

let touchStartY = 0;

window.addEventListener(
  "touchstart",
  (event) => {
    touchStartY = event.touches[0].clientY;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    const swipingUp = touchStartY - event.touches[0].clientY > 0;
    if (!invitationOpened && window.scrollY < cover.offsetHeight - 2 && swipingUp) {
      event.preventDefault();
    }
  },
  { passive: false }
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal, .gallery-stack figure").forEach((element) => observer.observe(element));

const eventDate = new Date("2026-07-07T11:00:00+08:00").getTime();
const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateTimer() {
  const distance = Math.max(0, eventDate - Date.now());
  const dayValue = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hourValue = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minuteValue = Math.floor((distance / (1000 * 60)) % 60);
  const secondValue = Math.floor((distance / 1000) % 60);

  days.textContent = pad(dayValue);
  hours.textContent = pad(hourValue);
  minutes.textContent = pad(minuteValue);
  seconds.textContent = pad(secondValue);
}

updateTimer();
setInterval(updateTimer, 1000);
