document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;

    // Get the page role from body tag (default to 'landing' if not set)
    const role = document.body.getAttribute("data-role") || "landing";

    let buttons = "";

    if (role === "jobseeker") {
        buttons = `<button class="btn danger" onclick="location.href='employers-signin.html'">Employers</button>`;
    } else if (role === "employer") {
        buttons = `<button class="btn danger" onclick="location.href='jobseekers-signin.html'">Jobseekers</button>`;
    } else {
        buttons = `
            <button class="btn secondary-white" onclick="location.href='/ai-resume-frontend-v2/pages/jobseekers-signin.html'">Jobseekers</button>
            <button class="btn danger" onclick="location.href='/ai-resume-frontend-v2/pages/employers-signin.html'">Employers</button>
        `;
    }

    // Inject Header
    headerContainer.innerHTML = `
        <header class="header">
            <div class="head-container">
                <h1 class="logo">
                    <a href="/ai-resume-frontend-v2/index.html">AI Resume Screening</a>
                </h1>
                <button class="menu-btn" id="menu-btn">☰</button>
                <nav>
                    <ul class="nav-links" id="nav-links">
                        <li><a href="jobs.html">Jobs</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                        ${buttons}
                    </ul>
                </nav>
            </div>
        </header>
    `;

    // Toggle mobile menu
    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");

    menuBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents this click from triggering the document click event
        navLinks.classList.toggle("active");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
        if (!navLinks.contains(event.target) && !menuBtn.contains(event.target)) {
            navLinks.classList.remove("active");
        }
    });
});
