//---------------------------------------------------
// Ensure Admin Access
//---------------------------------------------------
const currentUser = AuthHelper.getCurrentUser();

if (!currentUser || currentUser.user_type !== "admin") {
  alert("Admin access required.");
  window.location.href = "/index";
}

//---------------------------------------------------
// Get Event ID from URL
//---------------------------------------------------
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

if (!eventId) {
  alert("Missing event ID.");
  window.location.href = "/manage_events";
}

// Form fields
const eventName = document.getElementById("eventName");
const eventDate = document.getElementById("eventDate");
const eventTime = document.getElementById("eventTime");
const eventEndTime = document.getElementById("eventEndTime");
const eventLocation = document.getElementById("eventLocation");
const eventAbout = document.getElementById("eventAbout");
const eventCapacity = document.getElementById("availableSeats");
const saveMessage = document.getElementById("saveMessage");

//---------------------------------------------------
// Load Event Data to Pre-Fill Form
//---------------------------------------------------
async function loadEvent() {
  try {
    const res = await fetch(`/api/events/${eventId}`);
    const ev = await res.json();

    // Fill form fields
    eventName.value = ev.title;

    const start = new Date(ev.starts_at);
    const end = new Date(ev.ends_at);

    eventDate.value = start.toISOString().substring(0, 10);
    eventTime.value = start.toTimeString().substring(0, 5);
    eventEndTime.value = end.toTimeString().substring(0, 5);

    eventLocation.value = ev.venue;
    eventAbout.value = ev.description || "";
    eventCapacity.value = ev.capacity;

  } catch (err) {
    console.error("Failed to load event:", err);
    alert("Error loading event.");
  }
}

loadEvent();

//---------------------------------------------------
// Save Updated Event
//---------------------------------------------------
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const starts_at = `${eventDate.value}T${eventTime.value}`;
  const ends_at = `${eventDate.value}T${eventEndTime.value}`;

  const updatedEvent = {
    title: eventName.value,
    description: eventAbout.value,
    venue: eventLocation.value,
    starts_at,
    ends_at,
    capacity: parseInt(eventCapacity.value)
  };

  try {
    const res = await fetch(`/api/events/${eventId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent)
    });

    const data = await res.json();

    if (data.success) {
      saveMessage.textContent = "Event updated successfully!";
      setTimeout(() => {
        window.location.href = "/manage_events";
      }, 1200);
    } else {
      saveMessage.style.color = "red";
      saveMessage.textContent = data.error;
    }

  } catch (err) {
    console.error("Update error:", err);
    saveMessage.style.color = "red";
    saveMessage.textContent = "Network error updating event.";
  }
});
