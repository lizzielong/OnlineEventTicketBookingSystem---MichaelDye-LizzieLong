// Registration form handling
const signupForm = document.getElementById("signup-form");
const message = document.getElementById("register-message");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                // Store user data in localStorage
                localStorage.setItem("currentUser", JSON.stringify({
                    user_id: data.user_id,
                    name: data.name,
                    email: data.email,
                    user_type: data.user_type
                }));
                
                message.textContent = "Registration successful! Redirecting...";
                message.style.color = "green";
                
                // Redirect based on user type
                setTimeout(() => {
                    if (data.user_type === 'admin') {
                        window.location.href = '/admin_event.html';
                    } else {
                        window.location.href = '/index.html';
                    }
                }, 1000);
            } else {
                message.textContent = data.error || "Registration failed";
                message.style.color = "red";
            }
        } catch (error) {
            console.error('Registration error:', error);
            message.textContent = "Network error. Please try again.";
            message.style.color = "red";
        }
    });
}

// Menu toggle for sidebar (if you keep it)
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
}