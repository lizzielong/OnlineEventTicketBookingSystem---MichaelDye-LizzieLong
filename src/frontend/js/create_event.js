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