// Save event to localStorage
const eventForm = document.getElementById('eventForm');
const saveMessage = document.getElementById('saveMessage');

eventForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get values from form
  const newEvent = {
    name: document.getElementById('eventName').value,
    date: document.getElementById('eventDate').value,
    time: document.getElementById('eventTime').value,
    location: document.getElementById('eventLocation').value,
    about: document.getElementById('eventAbout').value,
    org: document.getElementById('orgAbout').value,
    seats: parseInt(document.getElementById('availableSeats').value)
  };

  // Get existing events or create a new list
  let events = JSON.parse(localStorage.getItem('events')) || [];

  // Add the new event
  events.push(newEvent);

  // Save back to localStorage inside browser
  localStorage.setItem('events', JSON.stringify(events));

  saveMessage.textContent = "✅ Event saved successfully!";
  eventForm.reset();
});

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