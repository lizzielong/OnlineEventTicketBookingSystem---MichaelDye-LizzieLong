const eventTableBody = document.getElementById("eventTableBody");

async function loadEvents() {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/events");
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
        <td><a href="event.html?id=${ev.id}" class="event-title-pill">${ev.title}</a></td>
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
