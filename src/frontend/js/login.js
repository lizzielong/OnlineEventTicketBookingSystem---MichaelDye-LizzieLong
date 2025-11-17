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

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

// Sidebar toggle functionality
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });
    
    // Close when clicking on a link inside sidebar
    sidebar.addEventListener("click", (e) => {
        if (e.target.tagName === 'A') {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        }
    });
    
    // Close when clicking on overlay or outside
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });
    
    // Close when clicking outside the sidebar (backup method)
    document.addEventListener("click", (e) => {
        if (sidebar.classList.contains("open") && 
            !sidebar.contains(e.target) && 
            e.target !== menuToggle &&
            e.target !== overlay) {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        }
    });
}