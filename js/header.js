document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;

    // Get the page role from body tag (default to 'landing' if not set)
    const role = document.body.getAttribute("data-role") || "landing";

    let buttons = "";

    if (role === "jobseeker") {
        // Show only the Employer button
        buttons = `<button class="btn danger" onclick="location.href='employers-signin.html'">Employers</button>`;
    } else if (role === "employer") {
        // Show only the Jobseeker button
        buttons = `<button class="btn danger" onclick="location.href='jobseekers-signin.html'">Jobseekers</button>`;
    } else {
        // Landing page: Show both
        buttons = `
            <button class="btn secondary-white" onclick="location.href='/ai-resume-frontend/pages/jobseekers-signin.html'">Jobseekers</button>
            <button class="btn danger" onclick="location.href='/ai-resume-frontend/pages/employers-signin.html'">Employers</button>
        `;
    }

    // Inject Header
    headerContainer.innerHTML = `
        <header class="header">
            <div class="container">
                <h1 class="logo">
                    <a href="/ai-resume-frontend/">AI Resume Screening</a>
                </h1>
                <nav>
                    <ul class="nav-links">
                        <li><a href="jobs.html">Jobs</a></li>
                        <li><a href="contact.html">Contact Us</a></li>
                        ${buttons}
                    </ul>
                </nav>
            </div>
        </header>
    `;
});
