// Load saved bookings from localStorage
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
const listContainer = document.getElementById("booking-list");

function saveBookings() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function displayBookings() {
  listContainer.innerHTML = ""; // clear current list

  if (bookings.length === 0) {
    listContainer.innerHTML = "<p>You have no bookings yet.</p>";
  } else {
    bookings.forEach(event => {
      const div = document.createElement("div");
      div.classList.add("booking-item");
      div.innerHTML = `
        <h3>${event.name}</h3>
        <p>Seats booked: ${event.seatsBooked}</p>
        <button class="release-btn" data-name="${event.name}">Release Seat</button>
      `;
      listContainer.appendChild(div);
    });
  }
}

// Handle “Release Seat” button clicks
listContainer.addEventListener("click", e => {
  if (e.target.classList.contains("release-btn")) {
    const name = e.target.dataset.name;
    let event = bookings.find(b => b.name === name);

    if (event) {
      if (event.seatsBooked > 1) {
        // just decrease one seat
        event.seatsBooked -= 1;
        alert(`You released one seat for "${name}".`);
      } else {
        // remove entire event if no seats left
        bookings = bookings.filter(b => b.name !== name);
        alert(`You have no seats left for "${name}".`);
      }

      saveBookings();
      displayBookings();
    }
  }
});

// Initial render
displayBookings();

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