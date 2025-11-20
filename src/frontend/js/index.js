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

const eventTableBody = document.getElementById("eventTableBody");

async function loadEvents() {
  try {
    const response = await fetch("/api/events");
    const events = await response.json();

    if (!events.length) {
      eventTableBody.innerHTML = `
        <tr><td colspan="4" style="text-align:center;">No events available yet.</td></tr>
      `;
      return;
    }

    eventTableBody.innerHTML = "";
    events.forEach(ev => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date(ev.starts_at).toLocaleDateString()}</td>
        <td>@ ${new Date(ev.starts_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
        <td><a href="/event.html?id=${ev.id}" class="event-title-pill">${ev.title}</a></td>
        <td><span class="loc"><span class="pin" aria-hidden="true">⚲</span> ${ev.venue}</span></td>
      `;
      eventTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Failed to load events:", error);
    eventTableBody.innerHTML = `
      <tr><td colspan="4" style="text-align:center;color:red;">Error loading events</td></tr>
    `;
  }
}

loadEvents();