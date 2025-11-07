// Menu toggle functionality
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
}

// Check if we're on login page and attach handler
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
}

// Check if we're on signup page and attach handler  
const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", handleSignup);
}

// Login function
async function handleLogin(event) {
  event.preventDefault();
  
  const formData = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem("user", JSON.stringify(result));
      window.location.href = "index.html";
    } else {
      alert("Login failed: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

// Signup function
async function handleSignup(event) {
  event.preventDefault();
  
  const formData = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (result.success) {
      alert("Account created successfully! Please login.");
      window.location.href = "login.html";
    } else {
      alert("Error: " + result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}