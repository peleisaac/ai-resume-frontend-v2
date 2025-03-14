import { handleApiResponse } from "./handleApiResponse.js";

document.addEventListener("DOMContentLoaded", function () {
    // Get user role from the body tag
    const userRole = document.body.getAttribute("data-role") || "admin";

    // Function to load the sign-in form
    function loadSignInForm(type) {


        return `
            <form id="signin-form">
                <div>
                    <h2 class="title">Admin Login</h2>
                    <p class="subtitle">Access Your Account</p>
                </div>

                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter Email" required>

                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter Password" required>

                <button type="submit" class="signin-btn">SIGN IN</button>
                <p id="error-message" class="error-message"></p>
            </form>
        `;
    }

    // Inject the form into the page
    const authContainer = document.getElementById("auth-container");
    if (authContainer) {
        authContainer.innerHTML = loadSignInForm(userRole);

        // Attach event listener for form submission
        const form = document.getElementById("signin-form");
        if (form) {
            form.addEventListener("submit", handleSignIn);
        }
    }

    // Sign-in form submission handler
    function handleSignIn(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorMessage = document.getElementById("error-message");

        errorMessage.textContent = "";

        if (!email || !password) {
            errorMessage.textContent = "All fields are required.";
            return;
        }

        const data = {
            email: email,
            password: password,
            user_role: userRole // jobseeker, employer, admin
        };
        alert("Login successful");
        window.location.href = "../pages/admin-dashboard.html";
        console.log("Sending login request with data:", data);

        // fetch("/api/auth/login", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify(data)
        // })
        //     .then(handleApiResponse)
        //     .then((data) => {
        //         console.log("Login successful:", data);
        //         window.location.href = "/admin/dashboard";
        //     })
        //     .catch((error) => {
        //         console.error("Login failed:", error);
        //         errorMessage.textContent = error.message || "An error occurred. Please try again.";
        //     });
    }
});