  // Grab the table body
  const eventTableBody = document.getElementById('eventTableBody');

  // Load events from localStorage
  const events = JSON.parse(localStorage.getItem('events')) || [];

  // If there are no events, show a message
  if (events.length === 0) {
    eventTableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;">No events available yet.</td>
      </tr>
    `;
  } else {
    // Otherwise, loop through each event and create a new row
    events.forEach(ev => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${ev.date}</td>
        <td>@ ${ev.time}</td>
        <td><span class="event-title-pill">${ev.name}</span></td>
        <td><span class="loc"><span class="pin" aria-hidden="true">⚲</span> ${ev.location}</span></td>
      `;
      eventTableBody.appendChild(row);
    });
  }