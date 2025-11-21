//---------------------------------------------------
// Ensure Admin Access
//---------------------------------------------------
const currentUser = AuthHelper.getCurrentUser();

if (!currentUser || currentUser.user_type !== "admin") {
  alert("Admin access required.");
  window.location.href = "/index";
}

//---------------------------------------------------
// Load all bookings (Admin route)
//---------------------------------------------------
const reportTableBody = document.getElementById("reportTableBody");

async function loadReport() {
  reportTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>`;

  try {
    const res = await fetch("/api/bookings");
    const bookings = await res.json();

    if (!bookings.length) {
      reportTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No bookings found.</td></tr>`;
      return;
    }

    reportTableBody.innerHTML = "";

    bookings.forEach(b => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${b.user_name}</td>
        <td>${b.user_email}</td>
        <td>${b.event_title}</td>
        <td>${new Date(b.event_date).toLocaleDateString()}</td>
        <td>${b.quantity}</td>
        <td>${new Date(b.created_at).toLocaleString()}</td>
      `;

      reportTableBody.appendChild(tr);
    });

  } catch (error) {
    console.error("Failed to load booking report:", error);
    reportTableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Error loading report.</td></tr>`;
  }
}

loadReport();

//---------------------------------------------------
// Sidebar (same as other pages)
//---------------------------------------------------
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
        overlay.classList.toggle("active");
    });

    sidebar.addEventListener("click", (e) => {
        if (e.target.tagName === 'A') {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        }
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("open");
        overlay.classList.remove("active");
    });

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
