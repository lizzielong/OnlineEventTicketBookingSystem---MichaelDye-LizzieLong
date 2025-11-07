// Get current user from localStorage
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("user"));
}

// Check if user is logged in
function isLoggedIn() {
  return localStorage.getItem("user") !== null;
}

// Logout function
function logout() {
  localStorage.removeItem("user");
  window.location.href = "login.html";
}