   const form = document.getElementById("admin-login-form");
    const message = document.getElementById("login-message");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const username = document.getElementById("admin-username").value.trim();
      const password = document.getElementById("admin-password").value.trim();

      // Temporary login validation (for demonstration)
      if (username === "admin" && password === "password123") {
        localStorage.setItem("adminLoggedIn", "true");
        window.location.href = "admin_event.html"; // redirect
      } else {
        message.textContent = "Invalid username or password.";
      }
    });