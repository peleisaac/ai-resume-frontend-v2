document.addEventListener("DOMContentLoaded", async function () {
    // Load sidebar dynamically
    loadSidebar();

    // Initialize job posting form
    // setupJobPostingForm();

    // Toggle mobile sidebar
    setupSidebarToggle();

    // Initialize job listings if we're on that page
    initializeCurrentPageContent();

    setTimeout(highlightActiveLink, 100); // Short delay to ensure sidebar is loaded

    fetchUserDetails();
});




function loadSidebar() {
    // Directly insert the sidebar HTML instead of fetching it
    const sidebarHTML = `<aside class="sidebar">
    <!-- Employer Profile Section -->
    <div class="employer-profile">
        <div class="profile-image">
            <img src="../assets/lady.jpg" alt="Employer Profile">
        </div>
        <div class="profile-info">
            <h3 id="dashboard-name">Loading...</h3>
            <p id="dashboard-role">Loading...</p>
        </div>
    </div>

    <!-- Navigation Links -->
    <nav class="dashboard-nav">
        <ul>
            <li>
                <a href="/ai-resume-frontend/pages/employer-dashboard.html" class="nav-item">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" />
                        </svg>
                    </span>
                    <span>Dashboard</span>
                </a>
            </li>
            <li>
                <a href="/ai-resume-frontend/pages/employer-new-job.html" class="nav-item active">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </span>
                    <span>New Job</span>
                </a>
            </li>
            <li>
                <a href="/ai-resume-frontend/pages/employer-job-listings.html" class="nav-item">
                    <span class="icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </span>
                    <span>Job Listings</span>
                </a>
            </li>

        </ul>
        <div class="sidebar-footer">
            <a href="#" id="logout-btn" class="nav-item logout-btn">
                <span class="icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </span>
                <span>Logout</span>
            </a>
        </div>
    </nav>
</aside>`;

    const sidebarContainer = document.getElementById("sidebar");
    if (sidebarContainer) {
        sidebarContainer.innerHTML = sidebarHTML;
        console.log("Sidebar manually inserted into #sidebar.");
        setupSidebarNavigation();
        setupLogoutButton();
        highlightActiveLink();
    }
}

async function fetchUserDetails() {
    const user = JSON.parse(localStorage.getItem("user"));

    let nameElement = document.getElementById("dashboard-name");
    let roleElement = document.getElementById("dashboard-role");

    if (!nameElement || !roleElement) {
        console.warn("Dashboard elements not found. Skipping update.");
        return;
    }

    // First, try to update from localStorage
    if (user) {
        nameElement.textContent = user.first_name || "Jobseeker";
        roleElement.textContent = user.user_role || "Jobseeker";
    }

    // If user data is missing or incomplete, fetch from API
    if (!user || !user.user_id || !user.token) {
        console.warn("User not found in localStorage. Redirecting to login...");
        window.location.href = "/ai-resume-frontend/pages/jobseeker-signin.html"; // Redirect if user is missing
        return;
    }

    try {
        const response = await fetch(`https://ai-resume-backend.axxendcorp.com/api/v1/user/${user.user_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${user.token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            nameElement.textContent = data.user.first_name || "Jobseeker";
            roleElement.textContent = data.user.user_role || "Jobseeker";

            // Save updated details in localStorage for future use
            localStorage.setItem("user", JSON.stringify(data.user));
        } else {
            throw new Error(data.message || "Failed to fetch user details");
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    }
}



function setupLogoutButton() {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function(event) {
            event.preventDefault();
            
            // Clear user data from localStorage
            localStorage.removeItem("user");
            
            // Redirect to login page
            window.location.href = "/ai-resume-frontend/pages/employers-signin.html";
            
            console.log("User logged out successfully");
        });
    }
}

function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll(".nav-item");

    sidebarLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            const targetPage = this.getAttribute("href");
            history.pushState({}, "", targetPage);

            loadContent(targetPage);
            updateActiveLink(this, sidebarLinks);
        });
    });
}

function loadContent(page) {
    fetch(page)
        .then(response => response.text())
        .then(html => {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = html;

            const newContent = tempDiv.querySelector(".main-content").innerHTML;
            document.querySelector(".main-content").innerHTML = newContent;

            document.title = tempDiv.querySelector("title").innerText;

            // Initialize appropriate functionality based on page
            initializeCurrentPageContent();
        })
        .catch(error => console.error("Error loading content:", error));
}

function initializeCurrentPageContent() {
    // Setup job posting form for new job page
    // setupJobPostingForm();

    // Initialize job listings if we're on the job listings page
    if (window.location.pathname.includes("employer-job-listings.html")) {
        console.log("Initializing job listings page");
        initializeJobListings();
    }
}

function initializeJobListings() {
    // Check if the necessary job-related scripts are loaded
    if (typeof window.loadJobListings === 'function') {
        // If the function already exists, call it
        window.loadJobListings();
    } else {
        // If not, dynamically load the necessary scripts
        loadJobScripts().then(() => {
            // After scripts are loaded, call the function
            if (typeof window.loadJobListings === 'function') {
                window.loadJobListings();
            } else {
                console.error("loadJobListings function not found even after loading scripts");
            }
        });
    }
}

function loadJobScripts() {
    return new Promise((resolve, reject) => {
        // Load job-data.js first
        const jobDataScript = document.createElement('script');
        jobDataScript.src = '../js/job-data.js';
        jobDataScript.onload = function () {
            // Then load job-listings.js
            const jobListingsScript = document.createElement('script');
            jobListingsScript.src = '../js/job-listings.js';
            jobListingsScript.onload = function () {
                // Finally load job-filters.js
                const jobFiltersScript = document.createElement('script');
                jobFiltersScript.src = '../js/job-filters.js';
                jobFiltersScript.onload = function () {
                    // Add a small delay to ensure scripts are parsed and executed
                    setTimeout(() => {
                        resolve();
                    }, 100);
                };
                jobFiltersScript.onerror = reject;
                document.head.appendChild(jobFiltersScript);
            };
            jobListingsScript.onerror = reject;
            document.head.appendChild(jobListingsScript);
        };
        jobDataScript.onerror = reject;
        document.head.appendChild(jobDataScript);
    });
}

function highlightActiveLink() {
    // Get the current path (e.g., "employer-new-job.html")
    const currentPath = window.location.pathname;
    const sidebarLinks = document.querySelectorAll(".nav-item");

    sidebarLinks.forEach(link => {
        link.classList.remove("active");
        // Get the href value (e.g., "employer-new-job.html")
        const linkPath = link.getAttribute("href");

        // Check if the current path ends with or matches the link path
        if (currentPath === linkPath || currentPath.endsWith(linkPath.split('/').pop())) {
            link.classList.add("active");
        }
    });
}

function updateActiveLink(activeLink, sidebarLinks) {
    sidebarLinks.forEach(link => link.classList.remove("active"));
    activeLink.classList.add("active");
}


function setupSidebarToggle() {
    document.addEventListener("click", function (event) {
        const toggleSidebarBtn = document.querySelector(".toggle-sidebar");
        const sidebar = document.querySelector(".sidebar");

        if (toggleSidebarBtn && sidebar && event.target === toggleSidebarBtn) {
            sidebar.classList.toggle("active");
        }
    });
}

window.addEventListener('popstate', function () {
    // Get the current URL path to determine which page to load
    const currentPath = window.location.pathname;

    // Only fetch if it's one of your application pages
    if (currentPath.includes('/ai-resume-frontend/pages/employer-dashboard.html') ||
        currentPath.includes('/ai-resume-frontend/pages/employer-new-job.html') ||
        currentPath.includes('/ai-resume-frontend/pages/employer-job-listings.html')) {

        // Load the content for the current URL
        loadContent(currentPath);

        // Update the active link in the sidebar
        highlightActiveLink();
    }
});
