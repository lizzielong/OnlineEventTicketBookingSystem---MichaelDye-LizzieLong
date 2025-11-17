// ========== SETTINGS FOR THIS EVENT ==========
const eventName = "Combined Worship Night"; // You’ll change this per event page

// Get references to HTML elements
const bookBtn = document.querySelector(".book-btn");
const seatsAvailable = document.getElementById("seatsAvailable");
const userStatus = document.querySelector(".user-status");

// Get saved bookings from localStorage, or empty array if none exist yet
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

// Save back to localStorage
function saveBookings() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

// Show or hide the “I’m going!” box based on user’s booking
function updateStatusBox() {
  const currentBooking = bookings.find(b => b.name === eventName);

  if (currentBooking && currentBooking.seatsBooked > 0) {
    userStatus.style.display = "block";
    userStatus.innerHTML = `
      <p>I'm going!</p>
      <p>Seats booked: ${currentBooking.seatsBooked}</p>
      <button class="release-btn">Release Seat</button>
    `;

    document
      .querySelector(".release-btn")
      .addEventListener("click", releaseSeat);
  } else {
    userStatus.style.display = "none";
    userStatus.innerHTML = "";
  }
}

// Function that runs when user clicks “Save Seat”
function bookSeat() {
  let currentSeats = parseInt(seatsAvailable.textContent);

  if (currentSeats > 0) {
    seatsAvailable.textContent = currentSeats - 1;

    // Either update existing booking or add a new one
    let existingBooking = bookings.find(b => b.name === eventName);
    if (existingBooking) {
      existingBooking.seatsBooked += 1;
    } else {
      bookings.push({ name: eventName, seatsBooked: 1 });
    }

    saveBookings();
    updateStatusBox();
  } else {
    alert("Sorry, no seats left.");
  }
}

// Function that runs when user clicks “Release Seat”
function releaseSeat() {
  let existingBooking = bookings.find(b => b.name === eventName);

  if (existingBooking && existingBooking.seatsBooked > 0) {
    existingBooking.seatsBooked -= 1;
    seatsAvailable.textContent =
      parseInt(seatsAvailable.textContent) + 1;

    // If zero seats left, remove from the booking list
    if (existingBooking.seatsBooked === 0) {
      bookings = bookings.filter(b => b.name !== eventName);
    }

    saveBookings();
    updateStatusBox();
  }
}

// Attach button click listener
bookBtn.addEventListener("click", bookSeat);

// Run this once when the page loads (to restore any saved state)
updateStatusBox();

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

// Sidebar toggle functionality
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });
    
    // Close when clicking on a link inside sidebar
    sidebar.addEventListener("click", (e) => {
        if (e.target.tagName === 'A') {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        }
    });
    
    // Close when clicking on overlay or outside
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
    
    // Close when clicking outside the sidebar (backup method)
    document.addEventListener("click", (e) => {
        if (sidebar.classList.contains("open") && 
            !sidebar.contains(e.target) && 
            e.target !== menuToggle &&
            e.target !== overlay) {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        }
    });
}