//---------------------------------------------------
// Admin Access Check
//---------------------------------------------------
const currentUser = AuthHelper.getCurrentUser();

if (!currentUser || currentUser.user_type !== "admin") {
  alert("Admin access required.");
  window.location.href = "/index";
}

const eventList = document.getElementById("eventList");

//---------------------------------------------------
// Load Events (Copied from index.js but adapted for admin table)
//---------------------------------------------------
async function loadEvents() {
  eventList.innerHTML = "<p>Loading events...</p>";

  try {
    const response = await fetch("/api/events");
    const events = await response.json();

    if (!events.length) {
      eventList.innerHTML = "<p>No events found.</p>";
      return;
    }

    // Build the table
    let html = `
      <table class="event-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Event Title</th>
            <th>Location</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
    `;

    events.forEach(ev => {
      html += `
        <tr>
          <td>${new Date(ev.starts_at).toLocaleDateString()}</td>
          <td>@ ${new Date(ev.starts_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}</td>
          <td>${ev.title}</td>
          <td>${ev.venue}</td>

          <td>
            <a class="signup-btn edit-btn" 
               href="/edit?id=${ev.id}"
               style="background:#2980b9; padding:6px 12px; display:inline-block;">
              Edit
            </a>
          </td>

          <td>
            <button class="signup-btn delete-btn" 
                    data-id="${ev.id}"
                    style="background:#c0392b; padding:6px 12px;">
              Delete
            </button>
          </td>
        </tr>
      `;
    });

    // CLOSE TABLE — was missing!
    html += `
        </tbody>
      </table>
    `;

    eventList.innerHTML = html;

  } catch (error) {
    console.error("Error loading events:", error);
    eventList.innerHTML = "<p style='color:red;'>Error loading events.</p>";
  }
}

//---------------------------------------------------
// Delete an Event
//---------------------------------------------------
async function deleteEvent(id) {
  if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) {
    return;
  }

  try {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      alert("Event deleted successfully.");
      loadEvents();
    } else {
      alert(data.error);
    }

  } catch (error) {
    console.error("Delete error:", error);
    alert("Network error while deleting event.");
  }
}

//---------------------------------------------------
// Click Handler for Delete Buttons
//---------------------------------------------------
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    deleteEvent(e.target.dataset.id);
  }
});

//---------------------------------------------------
// Initialize
//---------------------------------------------------
loadEvents();

//---------------------------------------------------
// SIDEBAR CODE (same as the other pages)
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
