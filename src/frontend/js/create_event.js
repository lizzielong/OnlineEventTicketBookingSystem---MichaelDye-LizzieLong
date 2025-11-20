//---------------------------------------------------
// Handle Create Event Form Submission
//---------------------------------------------------
// Ensure AuthHelper has finished loading
const currentUser = AuthHelper.getCurrentUser();

if (!currentUser || currentUser.user_type !== "admin") {
  alert("Admin access required.");
  window.location.href = "/index";
}

const eventForm = document.getElementById("eventForm");
const saveMessage = document.getElementById("saveMessage");

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Read form values
  const title = document.getElementById("eventName").value;
  const date = document.getElementById("eventDate").value;
  const startTime = document.getElementById("eventTime").value;
  const endTime = document.getElementById("eventEndTime").value;
  const venue = document.getElementById("eventLocation").value;
  const description = document.getElementById("eventAbout").value;
  const capacity = parseInt(document.getElementById("availableSeats").value);

  // Must combine date + time into ISO format
  const starts_at = `${date}T${startTime}`;
  const ends_at = `${date}T${endTime}`;

  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        venue,
        starts_at,
        ends_at,
        capacity
      })
    });

    const data = await res.json();

    if (data.success) {
      saveMessage.textContent = "Event created successfully!";
      eventForm.reset();

      // Redirect to admin page or home
      setTimeout(() => {
        window.location.href = "/index";
      }, 1500);
    } else {
      saveMessage.style.color = "red";
      saveMessage.textContent = data.error;
    }
  } catch (err) {
    console.error("Error creating event:", err);
    saveMessage.style.color = "red";
    saveMessage.textContent = "Network error creating event.";
  }
});

// SIDEBAR CODE (unchanged)
