//---------------------------------------------------
// Elements
//---------------------------------------------------
const listContainer = document.getElementById("booking-list");

// Get logged-in user (frontend memory)
const currentUser = JSON.parse(localStorage.getItem("currentUser"));


//---------------------------------------------------
// Load all bookings from backend
//---------------------------------------------------
async function loadBookings() {
  try {
    const res = await fetch("/api/my-bookings");
    const bookings = await res.json();

    renderBookings(bookings);

  } catch (err) {
    console.error("Error loading bookings:", err);
    listContainer.innerHTML = `<p style="color:red;">Failed to load bookings.</p>`;
  }
}


//---------------------------------------------------
// Render bookings into HTML
//---------------------------------------------------
function renderBookings(bookings) {
  listContainer.innerHTML = "";

  if (!bookings.length) {
    listContainer.innerHTML = "<p>You have no bookings yet.</p>";
    return;
  }

  bookings.forEach(b => {
    const div = document.createElement("div");
    div.classList.add("booking-item");

    div.innerHTML = `
      <h3>${b.event_title}</h3>
      <p>Seats booked: ${b.quantity}</p>
      <button class="release-btn" data-id="${b.id}">Release Seat</button>
    `;

    listContainer.appendChild(div);
  });
}


//---------------------------------------------------
// Release ONE seat = delete ONE booking row
//---------------------------------------------------
listContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("release-btn")) {

    const bookingId = e.target.dataset.id;

    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (data.success) {
      alert("Seat released.");
      loadBookings(); // refresh UI
    } else {
      alert(data.error);
    }
  }
});


//---------------------------------------------------
// Initialize Page
//---------------------------------------------------
loadBookings();


//---------------------------------------------------
// Sidebar Code
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
