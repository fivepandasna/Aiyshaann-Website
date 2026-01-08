// Smooth scroll to gallery section
document
  .getElementById("scroll-trigger")
  .addEventListener("click", () => {
    document
      .getElementById("gallery")
      .scrollIntoView({ behavior: "smooth" });
  });

// Typing effect
const titles = [
  "Master of Ju Jitsu",
  "Maker of the Stars",
  "Dear Friend of Genghis Khan",
  "A Timeless Legacy",
];
let typingIndex = 0;
let charIndex = 0;
const typingEl = document.getElementById("typing");

function type() {
  if (charIndex < titles[typingIndex].length) {
    typingEl.textContent += titles[typingIndex][charIndex];
    charIndex++;
    setTimeout(type, 120);
  } else {
    setTimeout(erase, 1500);
  }
}

function erase() {
  if (charIndex > 0) {
    typingEl.textContent = titles[typingIndex].substring(
      0,
      charIndex - 1,
    );
    charIndex--;
    setTimeout(erase, 80);
  } else {
    typingIndex = (typingIndex + 1) % titles.length;
    setTimeout(type, 500);
  }
}

type(); // start typing

// Lightbox images
const images = [
  "assets/images/ju-jitsu.jpg",
  "assets/images/star.jpg",
  "assets/images/genghis.jpg",
  "assets/images/legacy.jpg",
];
const lightbox = document.getElementById("lightbox");
const leftArrow = lightbox.querySelector(".arrow.left");
const rightArrow = lightbox.querySelector(".arrow.right");

let currentIndex = 0;
let currentImgElement = null;

function showLightbox(index) {
  currentIndex = index;
  const img = document.createElement("img");
  img.src = images[currentIndex];
  img.classList.add("active");
  lightbox.appendChild(img);

  if (currentImgElement) {
    slideImage(currentImgElement, img, "right");
  }
  currentImgElement = img;

  lightbox.classList.add("show");
  document.body.style.overflow = "hidden";

  document.addEventListener("touchmove", preventScroll, {
    passive: false,
  });
}

function hideLightbox() {
  lightbox.classList.remove("show");
  if (currentImgElement) {
    currentImgElement.remove();
    currentImgElement = null;
  }
  document.body.style.overflow = "";

  document.removeEventListener("touchmove", preventScroll, {
    passive: false,
  });
}

function preventScroll(e) {
  e.preventDefault();
}

function slideImage(oldImg, newImg, direction) {
  const distance = 100;
  newImg.style.transform = `translate(${direction === "right" ? distance + "%" : "-" + distance + "%"}, -50%) scale(0.8)`;
  newImg.style.opacity = 0;
  setTimeout(() => {
    newImg.classList.add("active");
    newImg.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    newImg.style.transform = "translate(-50%, -50%) scale(1)";
    newImg.style.opacity = 1;

    oldImg.style.transition = "transform 0.5s ease, opacity 0.5s ease";
    oldImg.style.transform = `translate(${direction === "right" ? -distance + "%" : distance + "%"}, -50%) scale(0.8)`;
    oldImg.style.opacity = 0;

    setTimeout(() => {
      oldImg.remove();
    }, 500);
  }, 10);
}

function showNext() {
  const newIndex = (currentIndex + 1) % images.length;
  const newImg = document.createElement("img");
  newImg.src = images[newIndex];
  lightbox.appendChild(newImg);
  slideImage(currentImgElement, newImg, "right");
  currentIndex = newIndex;
  currentImgElement = newImg;
}

function showPrev() {
  const newIndex = (currentIndex - 1 + images.length) % images.length;
  const newImg = document.createElement("img");
  newImg.src = images[newIndex];
  lightbox.appendChild(newImg);
  slideImage(currentImgElement, newImg, "left");
  currentIndex = newIndex;
  currentImgElement = newImg;
}

document.querySelectorAll(".card img").forEach((card, index) => {
  card.addEventListener("click", () => showLightbox(index));
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) hideLightbox();
});
rightArrow.addEventListener("click", (e) => {
  e.stopPropagation();
  showNext();
});
leftArrow.addEventListener("click", (e) => {
  e.stopPropagation();
  showPrev();
});

// Mouse tracking for header glow effect
const header = document.querySelector("header");
header.addEventListener("mousemove", (e) => {
  const rect = header.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  header.style.setProperty("--mouse-x", `${x}%`);
  header.style.setProperty("--mouse-y", `${y}%`);
});

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("show")) return;
  if (e.key === "ArrowRight") {
    showNext();
  }
  if (e.key === "ArrowLeft") {
    showPrev();
  }
  if (e.key === "Escape") {
    hideLightbox();
  }
});

// Touch swipe support
let startX = 0;
lightbox.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});
lightbox.addEventListener("touchend", (e) => {
  let endX = e.changedTouches[0].clientX;
  let diff = endX - startX;
  if (Math.abs(diff) > 50) {
    if (diff < 0) showNext();
    else showPrev();
  }
});

// Fetch Clash Royale Stats
const CR_API_URL = "/api/clashroyale";

fetch(CR_API_URL)
  .then((res) => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
  })
  .then((data) => {
    document.getElementById("cr-loading").style.display = "none";
    document.getElementById("cr-data").style.display = "block";

    if (data.trophies !== undefined && data.trophies !== null) {
      const trophiesEl = document.getElementById("cr-trophies");
      trophiesEl.innerHTML = `
        <span class="trophy-display">
          <img src="https://cdns3.royaleapi.com/cdn-cgi/image/w=64,h=64,format=auto/static/img/ui/trophy.png" alt="Trophy" class="trophy-icon">
          ${data.trophies.toLocaleString()}
        </span>
      `;
    } else {
      document.getElementById("cr-trophies").textContent = "N/A";
    }

    const deckList = document.getElementById("cr-deck");
    deckList.innerHTML = "";

    // Rarity adjustment for display level
    const rarityAdjustment = {
      common: 0,
      rare: 2,
      epic: 5,
      legendary: 8,
      champion: 10,
    };

    if (Array.isArray(data.currentDeck) && data.currentDeck.length) {
      data.currentDeck.forEach((card) => {
        const li = document.createElement("li");
        li.className = "cr-card";

        const img = document.createElement("img");

        // Check if card has an active evolution
        const hasEvolution =
          card.evolutionLevel && card.evolutionLevel > 0;

        if (hasEvolution && card.evoIconUrl) {
          // Use evolution icon if evolution is active
          img.src = card.evoIconUrl;
        } else if (card.iconUrl) {
          // Use regular icon
          img.src = card.iconUrl;
        } else {
          // Fallback: construct URL from card name
          const cardUrl = card.name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/\./g, "");
          img.src = `https://api-assets.clashroyale.com/cards/300/${cardUrl}.png`;
        }

        img.alt = card.name + (hasEvolution ? " (Evolution)" : "");
        img.onerror = function () {
          // Fallback if image fails to load
          this.style.display = "none";
        };

        const name = document.createElement("div");
        name.className = "cr-card-name";
        name.textContent = card.name + (hasEvolution ? " ⚡" : "");

        // Calculate display level based on rarity
        const rarity = (card.rarity || "common").toLowerCase();
        const adjustment = rarityAdjustment[rarity] || 0;
        const displayLevel = card.level + adjustment;

        const level = document.createElement("div");
        level.className = "cr-card-level";
        level.textContent = `Level ${displayLevel}`;

        li.appendChild(img);
        li.appendChild(name);
        li.appendChild(level);
        deckList.appendChild(li);
      });
    } else {
      deckList.innerHTML = "<li>No deck data available</li>";
    }
  })
  .catch((err) => {
    console.error("Failed to load Clash Royale data:", err);
    document.getElementById("cr-loading").style.display = "none";
    document.getElementById("cr-error").style.display = "block";
  });
