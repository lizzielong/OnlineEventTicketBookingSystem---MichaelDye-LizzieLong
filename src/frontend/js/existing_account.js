  // Grab the form elements
    const loginForm = document.getElementById("login-form");
    const message = document.getElementById("login-message");
    const adminBtn = document.getElementById("admin-login");

    // Demo user and admin credentials
    const demoUser = { email: "user@example.com", password: "user123" };
    const admin = { email: "admin@example.com", password: "admin123" };

    // Handle normal user login
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (email === demoUser.email && password === demoUser.password) {
        localStorage.setItem("loggedInUser", email);
        localStorage.setItem("userRole", "user");
        window.location.href = "index.html"; // normal users go to homepage
      } else if (email === admin.email && password === admin.password) {
        localStorage.setItem("loggedInUser", email);
        localStorage.setItem("userRole", "admin");
        window.location.href = "admin_event.html"; // admins go to event manager
      } else {
        message.textContent = "Invalid email or password.";
      }
    });

    // Quick Admin Login button (for testing)
    adminBtn.addEventListener("click", () => {
      localStorage.setItem("loggedInUser", "admin@example.com");
      localStorage.setItem("userRole", "admin");
      window.location.href = "admin_event.html";
    });

    // Menu toggle for sidebar
    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));