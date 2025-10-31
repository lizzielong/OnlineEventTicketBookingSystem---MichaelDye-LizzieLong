// events.js

document.addEventListener("DOMContentLoaded", () => {
  const eventList = document.getElementById("event-list");

  // Temporary mock data (you’ll replace this with a backend fetch later)
  const events = [
    {
      id: 1,
      title: "Campus Concert",
      description: "Live music on the quad.",
      venue: "Main Quad",
      starts_at: "2025-10-25T19:00:00Z",
      capacity: 100
    },
    {
      id: 2,
      title: "Guest Lecture",
      description: "Tech talk in the auditorium.",
      venue: "Auditorium A",
      starts_at: "2025-10-20T18:30:00Z",
      capacity: 200
    },
    {
      id: 3,
      title: "Homecoming Event",
      description: "Food, games, and AU community fun!",
      venue: "Student Center",
      starts_at: "2025-11-02T17:00:00Z",
      capacity: 300
    }
  ];

  // Display the events as cards
  events.forEach(event => {
    const card = document.createElement("div");
    card.className = "event-card";
    card.innerHTML = `
      <h3>${event.title}</h3>
      <p>${event.description}</p>
      <p><strong>Location:</strong> ${event.venue}</p>
      <p><strong>Date:</strong> ${new Date(event.starts_at).toLocaleString()}</p>
      <p><strong>Capacity:</strong> ${event.capacity}</p>
      <button onclick="viewEvent(${event.id})">View Details</button>
    `;
    eventList.appendChild(card);
  });
});

// When the user clicks "View Details"
function viewEvent(id) {
  window.location.href = `event.html?id=${id}`;
}
