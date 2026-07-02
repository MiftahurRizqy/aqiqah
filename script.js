const cover = document.getElementById("cover");
const openButton = document.getElementById("openInvitation");
const invitation = document.getElementById("invitation");
const guestName = document.getElementById("guestName");
const invitationMusic = document.getElementById("invitationMusic");
let invitationOpened = false;
let musicStarted = false;

const params = new URLSearchParams(window.location.search);
const guest =
  params.get("to") ||
  params.get("tamu") ||
  params.get("nama") ||
  params.get("guest");

if (guest && guest.trim()) {
  guestName.textContent = guest.trim().replace(/\s+/g, " ");
}

function fadeInMusic() {
  if (!invitationMusic || musicStarted) {
    return;
  }

  musicStarted = true;
  invitationMusic.muted = false;
  invitationMusic.volume = 0;

  function startPlayback() {
    if (Number.isFinite(invitationMusic.duration) && invitationMusic.duration > 20) {
      invitationMusic.currentTime = 20;
    }

    const playPromise = invitationMusic.play();

    if (playPromise) {
      playPromise
        .then(() => {
          const targetVolume = 0.58;
          const fadeDuration = 4200;
          const fadeStart = performance.now();

          function fade(now) {
            const progress = Math.min((now - fadeStart) / fadeDuration, 1);
            invitationMusic.volume = targetVolume * progress;

            if (progress < 1) {
              requestAnimationFrame(fade);
            }
          }

          requestAnimationFrame(fade);
        })
        .catch(() => {
          musicStarted = false;
        });
    }
  }

  if (invitationMusic.readyState >= 1) {
    startPlayback();
  } else {
    invitationMusic.addEventListener("loadedmetadata", startPlayback, { once: true });
  }
}

function unlockMusicOnFirstGesture() {
  fadeInMusic();
  if (musicStarted) {
    window.removeEventListener("pointerdown", unlockMusicOnFirstGesture);
    window.removeEventListener("touchstart", unlockMusicOnFirstGesture);
    window.removeEventListener("keydown", unlockMusicOnFirstGesture);
  }
}

document.addEventListener("DOMContentLoaded", fadeInMusic);
window.addEventListener("load", fadeInMusic);
window.addEventListener("pointerdown", unlockMusicOnFirstGesture);
window.addEventListener("touchstart", unlockMusicOnFirstGesture, { passive: true });
window.addEventListener("keydown", unlockMusicOnFirstGesture);

openButton.addEventListener("click", () => {
  invitationOpened = true;
  cover.classList.add("is-opened");
  document.body.classList.remove("locked");
  fadeInMusic();
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
