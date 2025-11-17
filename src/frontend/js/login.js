// Grab the form elements
const loginForm = document.getElementById("login-form");
const message = document.getElementById("login-message");

// Handle login using the API
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Store user data in localStorage for frontend use
      localStorage.setItem("currentUser", JSON.stringify({
        user_id: data.user_id,
        name: data.name,
        email: data.email,
        user_type: data.user_type
      }));
      
      message.textContent = "Login successful! Redirecting...";
      message.style.color = "green";
      
      // Redirect based on user type
      setTimeout(() => {window.location.href = "/index";}, 1000);
    } else {
      message.textContent = data.error || "Login failed";
      message.style.color = "red";
    }
  } catch (error) {
    console.error('Login error:', error);
    message.textContent = "Network error. Please try again.";
    message.style.color = "red";
  }
});

// Menu toggle for sidebar
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));