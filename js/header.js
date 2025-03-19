document.addEventListener("DOMContentLoaded", function () {
    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;

    // Inject CSS dynamically into <head>
    const loaderStyles = document.createElement("style");
    loaderStyles.innerHTML = `
        #loader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(6, 6, 6, 0.3);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 20px;
            z-index: 9999;
        }

        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-top-color: red;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        #loader-text {
            font-size: 22px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(loaderStyles);

    // Inject Loader into the page
    const loader = document.createElement("div");
    loader.id = "loader";
    loader.innerHTML = `<div class="spinner"></div><span id="loader-text">0%</span>`;
    document.body.appendChild(loader);
    loader.style.display = "none"; // Hide initially

    function showLoader(targetUrl) {
        const loaderText = document.getElementById("loader-text");
        loader.style.display = "flex";
        let progress = 0;

        const interval = setInterval(() => {
            progress += 20;
            loaderText.textContent = progress + "%";

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loader.style.display = "none";
                    window.location.href = targetUrl;
                }, 500);
            }
        }, 200);
    }

    // Function to handle navigation with loader
    function handleNavigation(e, url) {
        e.preventDefault();
        showLoader(url);
        return false; // Prevent default and stop propagation
    }

    // Inject Header HTML
    const role = document.body.getAttribute("data-role") || "landing";
    let buttons = "";

    if (role === "jobseeker") {
        buttons = `<button class="btn danger" data-target="ai-resume-frontend-v2/pages/employers-signin.html">Employers</button>`;
    } else if (role === "employer") {
        buttons = `<button class="btn danger" data-target="ai-resume-frontend-v2/pages/jobseekers-signin.html">Jobseekers</button>`;
    } else {
        buttons = `
            <button class="btn secondary-white" data-target="ai-resume-frontend-v2/pages/jobseekers-signin.html">Jobseekers</button>
            <button class="btn danger" data-target="ai-resume-frontend-v2/pages/employers-signin.html">Employers</button>
        `;
    }

    headerContainer.innerHTML = `
        <header class="header">
            <div class="head-container">
                <h1 class="logo">
                    <a href="../index.html" data-target="../index.html">AI Resume Screening</a>
                </h1>
                <button class="menu-btn" id="menu-btn">☰</button>
                <nav>
                    <ul class="nav-links" id="nav-links">
                        <li><a href="ai-resume-frontend-v2/pages/jobs.html" data-target="ai-resume-frontend-v2/pages/jobs.html">Jobs</a></li>
                        <li><a href="ai-resume-frontend-v2/pages/contact.html" data-target="ai-resume-frontend-v2/pages/contact.html">Contact Us</a></li>
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
        event.stopPropagation();
        navLinks.classList.toggle("active");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
        if (!navLinks.contains(event.target) && !menuBtn.contains(event.target)) {
            navLinks.classList.remove("active");
        }
    });

    // Add click event listeners to all navigation elements
    document.querySelectorAll('a[data-target], button[data-target]').forEach(el => {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            const targetUrl = this.getAttribute('data-target');
            if (targetUrl && !targetUrl.includes('#')) {
                showLoader(targetUrl);
            }
        });
    });
});
