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
                // Show success message (don't auto-login)
                message.textContent = "Registration successful! Redirecting to login...";
                message.style.color = "green";
                
                // Clear the form
                signupForm.reset();
                
                // Redirect to login page after delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
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