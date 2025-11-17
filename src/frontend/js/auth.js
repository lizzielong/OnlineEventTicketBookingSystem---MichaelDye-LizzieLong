// Global authentication helper functions
class AuthHelper {
    static getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    static isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.user_type === 'admin';
    }

    static async logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('currentUser');
            window.location.href = '/login';
        }
    }

    static async checkAuthStatus() {
        try {
            const response = await fetch('/api/current_user');
            const data = await response.json();
            
            if (data.logged_in) {
                // Update localStorage with fresh data from server
                localStorage.setItem("currentUser", JSON.stringify({
                    user_id: data.user_id,
                    name: data.name,
                    email: data.email,
                    user_type: data.user_type
                }));
                return true;
            } else {
                localStorage.removeItem('currentUser');
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }
}

// Auto-check auth status when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await AuthHelper.checkAuthStatus();
    updateNavigationUI();
});

// Update navigation based on login status
function updateNavigationUI() {
    // Sidebar navigation elements
    const loginNav = document.getElementById('login-nav');
    const logoutNav = document.getElementById('logout-nav');
    const adminNav = document.getElementById('admin-nav');
    const userStatusSidebar = document.getElementById('user-status-sidebar');

    const currentUser = AuthHelper.getCurrentUser();

    if (currentUser) {
        // User is logged in
        if (loginNav) loginNav.style.display = 'none';
        if (logoutNav) logoutNav.style.display = 'block';
        if (userStatusSidebar) {
            userStatusSidebar.innerHTML = `Logged in as:<br><strong>${currentUser.name}</strong><br>(${currentUser.email})<br><small>Role: ${currentUser.user_type}</small>`;
            userStatusSidebar.style.display = 'block';
        }
        
        // Show admin links if user is admin
        const isAdmin = currentUser.user_type === 'admin';
        if (adminNav) adminNav.style.display = isAdmin ? 'block' : 'none';
    } else {
        // User is not logged in
        if (loginNav) loginNav.style.display = 'block';
        if (logoutNav) logoutNav.style.display = 'none';
        if (adminNav) adminNav.style.display = 'none';
        if (userStatusSidebar) {
            userStatusSidebar.innerHTML = 'Not logged in';
            userStatusSidebar.style.display = 'block';
        }
    }
}

// Make function globally available for onclick events
window.AuthHelper = AuthHelper;