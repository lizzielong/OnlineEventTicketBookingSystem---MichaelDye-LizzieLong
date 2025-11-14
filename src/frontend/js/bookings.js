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