/* ============================================================
   Mikay Clean Co. - script.js
   Plain Vanilla JavaScript (no libraries).

   What this file does:
   1. Selects elements with document.querySelector()
   2. Listens for clicks with addEventListener()
   3. Shows/hides the dropdowns with classList.toggle("show")
   4. Provides ONE reusable setupDropdown() function for both
      Services and Projects so they work independently

   Bonus features in here:
   - Click outside closes an open dropdown (.contains)
   - Escape key closes it
   - Arrow toggles between ▼ and ▲, aria-expanded stays in sync
   - Opening one dropdown closes the other
   - Hamburger + accordion mobile menu (classList.toggle("open"))
   - Prev/next + active-card highlight for the carousel
   ============================================================ */

/* ============================================================
   STEP 1 - Select elements with document.querySelector()
   We grab every element we need ONCE, before adding listeners.
   ============================================================ */
const hamburger   = document.querySelector("#hamburger");       // hamburger button
const mobileMenu  = document.querySelector("#mobileMenu");      // full-width mobile panel
const carousel    = document.querySelector("#carousel");        // horizontal card scroller
const carouselPrev = document.querySelector(".carousel-btn.prev"); // previous button
const carouselNext = document.querySelector(".carousel-btn.next"); // next button
const mobileLinks = document.querySelectorAll(".mobile-menu a");    // links inside the mobile menu

/* A simple registry (array) of every dropdown we create.
   We use it for "close the other dropdown" + "close on outside click". */
const dropdowns = [];

/* ============================================================
   HELPERS - shared by all dropdowns
   ============================================================ */

/* Is this dropdown currently open? (checks for the .show class) */
function isOpen(dd) {
  return dd.menu.classList.contains("show");
}

/* Close a single dropdown:
   removes the .show class, restores the ▼ arrow, and sets
   aria-expanded back to false so assistive tech stays in sync. */
function closeMenu(dd) {
  dd.menu.classList.remove("show");
  dd.button.classList.remove("open");
  dd.arrow.textContent = "\u25BC";            // ▼
  dd.button.setAttribute("aria-expanded", "false");
}

/* BONUS 3 - "Opening one closes the other."
   Loop through every dropdown we made (Services + Projects).
   If it is open and it is NOT the one we just clicked, close it,
   so two panels never overlap. */
function closeOtherDropdowns(activeDd) {
  dropdowns.forEach(function (dd) {
    if (dd !== activeDd && isOpen(dd)) {
      closeMenu(dd);
    }
  });
}

/* ============================================================
   STEP 4 - One reusable function, called for each dropdown

   setupDropdown(buttonSelector, menuSelector, options)
     - buttonSelector : CSS id of the <button>, e.g. "#servicesBtn"
     - menuSelector   : CSS id of the <ul>,   e.g. "#servicesMenu"
     - options        : { accordion: true } makes the SAME function
                        power the mobile accordions (items push down
                        instead of floating). Desktop needs no options.

   Because we call this function twice (Services + Projects), the two
   dropdowns get identical behavior but stay fully independent.
   ============================================================ */
function setupDropdown(buttonSelector, menuSelector, options) {
  options = options || {};

  /* STEP 1 (again) - select the button and menu inside this function */
  const button = document.querySelector(buttonSelector);
  const menu = document.querySelector(menuSelector);

  /* The little ▼ arrow lives inside the button (a <span class="arrow">) */
  const arrow = button.querySelector(".arrow");

  /* Package the three values into one object we can pass around */
  const dd = { button: button, menu: menu, arrow: arrow, accordion: Boolean(options.accordion) };

  /* STEP 2 - listen for a click on the dropdown button */
  button.addEventListener("click", function (event) {
    /* stopPropagation() stops this click from reaching the document
       listener below (BONUS 1), which would otherwise instantly close
       the menu we just opened. */
    event.stopPropagation();

    /* BONUS 3 - desktop only: close the other dropdown first */
    if (!dd.accordion) {
      closeOtherDropdowns(dd);
    }

    /* STEP 3 - classList.toggle("show").
       Going to open?  -> adds "show"    -> menu becomes visible
       Going to close? -> removes "show" -> menu hides again            */
    const goingToOpen = !isOpen(dd);
    menu.classList.toggle("show", goingToOpen);

    /* BONUS 2 - keep the arrow and aria-expanded in sync with the state:
       if open, arrow flips to ▲ and aria-expanded="true" */
    if (goingToOpen) {
      button.classList.add("open");
      arrow.textContent = "\u25B2";                 // ▲
      button.setAttribute("aria-expanded", "true");
    } else {
      closeMenu(dd);
    }
  });

  /* Remember this dropdown so the registry helpers above can use it */
  dropdowns.push(dd);

  return dd;
}

/* ============================================================
   SETUP - create every dropdown with the reusable function.

   Both desktop dropdowns use their own button + menu ids,
   so Services and Projects each toggle on their own.
   The two accordion instances reuse the same function with
   { accordion: true } for the mobile menu.
   ============================================================ */
setupDropdown("#servicesBtn", "#servicesMenu");
setupDropdown("#projectsBtn", "#projectsMenu");
setupDropdown("#servicesAccBtn", "#servicesAccMenu", { accordion: true });
setupDropdown("#projectsAccBtn", "#projectsAccMenu", { accordion: true });

/* ============================================================
   BONUS 1 - Click anywhere OUTSIDE an open dropdown to close it

   The document hears EVERY click on the page. For each dropdown we
   check:
     - it is currently open, AND
     - the click was NOT on its button, AND
     - the click was NOT inside its menu
   If all three are true, the click was somewhere else → close it.

   The .contains() method checks whether an element is inside another.
   ============================================================ */
document.addEventListener("click", function (event) {
  dropdowns.forEach(function (dd) {
    const clickedOnButton = dd.button.contains(event.target);
    const clickedInsideMenu = dd.menu.contains(event.target);
    if (isOpen(dd) && !clickedOnButton && !clickedInsideMenu) {
      closeMenu(dd);
    }
  });
});

/* ============================================================
   BONUS 2 (keyboard) - the Escape key closes any open dropdown
   (and also closes the mobile menu for good measure).
   ============================================================ */
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    dropdowns.forEach(function (dd) {
      if (isOpen(dd)) {
        closeMenu(dd);
      }
    });
    closeMobileMenu();
  }
});

/* ============================================================
   BONUS 4 - Responsive mobile menu (hamburger button)

   The hamburger uses addEventListener + classList.toggle("open") to
   show and hide the full-width mobile panel. Inside that panel the
   Services/Projects accordions are powered by the same
   setupDropdown() function above — because their menu CSS is static
   (not position:absolute), their items push the content down instead
   of floating over it.
   ============================================================ */

/* Small helper that closes the mobile panel from any listener */
function closeMobileMenu() {
  if (hamburger && mobileMenu) {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", function () {
    /* classList.toggle("open") - add it if missing, remove it if present.
       The second argument captures whether the panel is now open. */
    const isPanelOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("open", isPanelOpen);
    hamburger.setAttribute("aria-expanded", String(isPanelOpen));
  });
}

/* Tapping any link inside the mobile menu closes the whole panel.
   (Otherwise the menu would stay open covering the page.) */
mobileLinks.forEach(function (link) {
  link.addEventListener("click", closeMobileMenu);
});

/* ============================================================
   CAROUSEL - "Why Mikay Clean Co." card scroller

   - The prev/next buttons scroll the container by one card width.
   - A scroll listener highlights the card nearest the center by
     toggling the .active class (which CSS makes larger + glowing).
   ============================================================ */
if (carousel) {
  /* Grab all the cards as a real array so we can loop over them */
  const cards = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-card"));

  /* How far one click should scroll: card width + the gap between cards */
  function oneStep() {
    const firstCard = carousel.querySelector(".carousel-card");
    if (!firstCard) return 320;
    const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
    return firstCard.offsetWidth + gap;
  }

  /* Prev / next buttons scroll smoothly by that distance */
  if (carouselPrev) {
    carouselPrev.addEventListener("click", function () {
      carousel.scrollBy({ left: -oneStep(), behavior: "smooth" });
    });
  }
  if (carouselNext) {
    carouselNext.addEventListener("click", function () {
      carousel.scrollBy({ left: oneStep(), behavior: "smooth" });
    });
  }

  /* Find and highlight the card closest to the middle of the carousel:
     1. work out the carousel's mid-point in pixels,
     2. for each card measure the distance of its center from that point,
     3. the closest card wins the .active class. */
  function highlightCenterCard() {
    const scrollCenter = carousel.clientWidth / 2;
    const carouselLeft = carousel.getBoundingClientRect().left;

    let bestCard = cards[0];
    let bestDistance = Infinity;

    cards.forEach(function (card) {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left - carouselLeft + rect.width / 2;
      const distance = Math.abs(cardCenter - scrollCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestCard = card;
      }
    });

    cards.forEach(function (card) {
      card.classList.toggle("active", card === bestCard);
    });
  }

  /* Run the highlight on every scroll/resize and once at page load */
  carousel.addEventListener("scroll", highlightCenterCard, { passive: true });
  window.addEventListener("resize", highlightCenterCard);
  highlightCenterCard();
}