//---------------------------------------------------
// Get Event ID from URL
//---------------------------------------------------
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

if (!eventId) {
  alert("No event selected.");
  throw new Error("Missing event ID");
}

// Elements
const titleEl = document.getElementById("event-title");
const dateEl = document.getElementById("event-date");
const descEl = document.getElementById("event-description");
const seatsAvailableEl = document.getElementById("seatsAvailable");
const userStatus = document.querySelector(".user-status");
const bookBtn = document.getElementById("book-btn");

// Logged-in user (from localStorage)
const currentUser = JSON.parse(localStorage.getItem("currentUser"));


//---------------------------------------------------
// Load Event Details + User Booking + Seats
//---------------------------------------------------
async function loadEvent() {
  try {
    // -------- 1. Get event details --------
    const eventRes = await fetch(`/api/events/${eventId}`);
    const event = await eventRes.json();

    titleEl.textContent = event.title;

    dateEl.textContent =
      `${new Date(event.starts_at).toLocaleDateString()} • ` +
      `${new Date(event.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    descEl.textContent = event.description || "No description available.";

    // -------- 2. Get user's bookings for this event --------
    const bookingRes = await fetch("/api/my-bookings");
    const myBookings = await bookingRes.json();

    // User's bookings for THIS event
    const myEventBookings = myBookings.filter(b => b.event_id == eventId);

    // Total seats this user booked
    const mySeatCount = myEventBookings.reduce((sum, b) => sum + b.quantity, 0);

    // -------- 3. Available seats (total capacity minus total booked) --------
    const totalBookedForEvent = myBookings
      .filter(b => b.event_id == eventId)
      .reduce((sum, b) => sum + b.quantity, 0);

    const availableSeats = event.capacity - totalBookedForEvent;

    seatsAvailableEl.textContent = availableSeats;

    // -------- 4. Update "I'm going" box --------
    updateStatusBox(myEventBookings, mySeatCount);

  } catch (err) {
    console.error("Error loading event:", err);
  }
}


//---------------------------------------------------
// Update “I'm Going!” Box
//---------------------------------------------------
function updateStatusBox(myBookings, mySeatCount) {
  if (!mySeatCount || mySeatCount <= 0) {
    userStatus.style.display = "none";
    userStatus.innerHTML = "";
    return;
  }

  userStatus.style.display = "block";
  userStatus.innerHTML = `
    <p>I'm going!</p>
    <p>Seats booked: ${mySeatCount}</p>
    <button id="release-btn" class="release-btn">Release Seat</button>
  `;

  // Release ONE seat (delete ONE booking row)
  document.getElementById("release-btn").addEventListener("click", () => {
    const oneBooking = myBookings[0]; // delete first booking
    cancelBooking(oneBooking.id);
  });
}


//---------------------------------------------------
// Book ONE Seat (POST to Backend)
//---------------------------------------------------
async function bookSeat() {
  if (!currentUser) {
    alert("Please log in first.");
    return;
  }

  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: eventId,
        quantity: 1
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Seat booked!");
      loadEvent(); // refresh UI
    } else {
      alert(data.error);
    }

  } catch (err) {
    console.error("Booking error:", err);
  }
}


//---------------------------------------------------
// Cancel ONE Seat (DELETE one booking row)
//---------------------------------------------------
async function cancelBooking(bookingId) {
  try {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (data.success) {
      alert("Seat released.");
      loadEvent(); // refresh UI
    } else {
      alert(data.error);
    }

  } catch (err) {
    console.error("Cancel error:", err);
  }
}


//---------------------------------------------------
// Event Listeners
//---------------------------------------------------
bookBtn.addEventListener("click", bookSeat);


//---------------------------------------------------
// Initialize Page
//---------------------------------------------------
loadEvent();


//---------------------------------------------------
// Sidebar Code (unchanged)
//---------------------------------------------------
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });

    sidebar.addEventListener("click", (e) => {
        if (e.target.tagName === 'A') {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        }
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });

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
