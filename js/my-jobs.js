document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const tabs = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const savedJobsList = document.getElementById('saved-jobs-list');
    const appliedJobsList = document.getElementById('applied-jobs-list');
    const noSavedJobsMsg = document.getElementById('no-saved-jobs');
    const noAppliedJobsMsg = document.getElementById('no-applied-jobs');
    const savedSearchInput = document.getElementById('saved-search');
    const savedSearchBtn = document.getElementById('saved-search-btn');
    const appliedSearchInput = document.getElementById('applied-search');
    const appliedSearchBtn = document.getElementById('applied-search-btn');
    const statusFilter = document.getElementById('status-filter');
    const dateFilter = document.getElementById('date-filter');
    const filterBtn = document.getElementById('filter-btn');
    const modal = document.getElementById('job-modal');
    const closeModal = document.querySelector('.modal .close');
    const jobDetailContent = document.getElementById('job-detail-content');
    const applyButton = document.getElementById('apply-button');
    const removeSavedButton = document.getElementById('remove-saved-button');
    const toastContainer = document.getElementById('toast-container');


    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show active content
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabId}-jobs`).classList.add('active');
        });
    });

    let savedJobs = [];
    let appliedJobs = [];

    function init() {
        // fetchSavedJobs();
        fetchAppliedJobs();
    }

    async function fetchSavedJobs() {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.user_id) {
                console.warn("Please sign in to view saved jobs.");
                return;
            }

            const response = await fetch("https://ai-resume-backend.axxendcorp.com/api/v1/saved-jobs", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch saved jobs.");
            const data = await response.json();
            savedJobs = data.saved_jobs || [];
            // loadSavedJobs();
        } catch (error) {
            console.error("Error fetching saved jobs:", error);
        }
    }

    async function fetchAppliedJobs() {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.user_id) {
                console.warn("Please sign in to view applied jobs.");
                return;
            }

            appliedJobsList.innerHTML = '<div class="loading-spinner"></div>';
            const response = await fetch("https://ai-resume-backend.axxendcorp.com/api/v1/applications", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                }
            });

            if (!response.ok) throw new Error("Failed to fetch applied jobs.");
            const data = await response.json();
            
            appliedJobs = data.applications.map(app => {
                if (!app.job_details) {
                    return {
                        id: app.application_id,
                        title: "Application in Process",
                        company: "Not specified",
                        location: "Not specified",
                        salary: "Not specified",
                        type: "Not specified",
                        applied: app.created_at,
                        status: app.status.toLowerCase(),
                        description: "Application is being processed.",
                        requirements: ["No details available at this time"]
                    };
                }
                return {
                    id: app.application_id,
                    title: app.job_details.title || "No Title",
                    company: app.job_details.company_name || "Not specified",
                    location: app.job_details.city && app.job_details.region ? `${app.job_details.city}, ${app.job_details.region}` : "Not specified",
                    salary: app.job_details.salary ? `$${app.job_details.salary}` : "Not specified",
                    type: app.job_details.contract_type || "Not specified",
                    applied: app.created_at,
                    status: app.status.toLowerCase(),
                    description: app.job_details.description || "No description available.",
                    requirements: app.job_details.requirements ?
                        (typeof app.job_details.requirements === 'string' ? app.job_details.requirements.split('. ') : app.job_details.requirements) :
                        ["No requirements specified"]
                };
            });
            loadAppliedJobs();
        } catch (error) {
            console.error("Error fetching applied jobs:", error);
        }
    }

    function loadSavedJobs() {
        savedJobsList.innerHTML = savedJobs.length === 0 ? "<p>No saved jobs found.</p>" : savedJobs.map(job => `<div>${job.title}</div>`).join('');
    }

    function loadAppliedJobs() {
        appliedJobsList.innerHTML = ''; // Clear previous content
    
        if (appliedJobs.length === 0) {
            noAppliedJobsMsg.style.display = 'block';
        } else {
            noAppliedJobsMsg.style.display = 'none';
            appliedJobs.forEach(job => {
                const jobCard = createJobCard(job, 'applied');
                appliedJobsList.appendChild(jobCard);
            });
        }
    }
    

    init();

    // Create Job Card
    function createJobCard(job, type) {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.dataset.jobId = job.id;
        console.log("Creating job card for:", job);

        // Common job details
        let cardContent = `
        <div class="job-card-header">
            <h3>${job.title || "No Title"}</h3>
            <div class="company-info">
                <span class="company-name">${job.company || "Not specified"}</span>
                <span class="job-location">${job.location || "Not specified"}</span>
            </div>
        </div>
        <div class="job-card-body">
            <div class="job-details">
                <div class="detail">
                    <span class="label">Salary:</span>
                    <span class="value">${job.salary || "Not specified"}</span>
                </div>
                <div class="detail">
                    <span class="label">Type:</span>
                    <span class="value">${job.type || "Not specified"}</span>
                </div>
                <div class="detail">
                    <span class="label">${type === 'saved' ? 'Posted:' : 'Applied:'}</span>
                    <span class="value">${type === 'saved' ?
                (job.posted ? formatDate(job.posted) : "Not specified") :
                (job.applied ? calculateTimeAgo(new Date(job.applied)) : "Not specified")}</span>
                </div>
            </div>
        </div>
    `;

        // Add status badge for applied jobs
        if (type === 'applied' && job.status) {
            // Convert status to display format
            const displayStatus = job.status.replace('_', ' ');
            cardContent += `
            <div class="job-status">
                <span class="status-badge ${job.status}">${capitalizeFirstLetter(displayStatus)}</span>
            </div>
        `;
        }

        // Add action buttons
        cardContent += `
        <div class="job-card-footer">
            <button class="btn primary view-job-btn">View Details</button>
            ${type === 'saved' ?
                `<button class="btn secondary-blue apply-btn">Apply</button>` :
                ''
            }
        </div>
    `;

        jobCard.innerHTML = cardContent;

        // Add event listeners
        jobCard.querySelector('.view-job-btn').addEventListener('click', () => openJobDetails(job, type));

        if (type === 'saved') {
            jobCard.querySelector('.apply-btn').addEventListener('click', () => {
                window.location.href = `jobseekers-apply.html?jobId=${job.id}`;
            });
        }

        return jobCard;
    }

    // Open Job Details Modal
    function openJobDetails(job, type) {
        // Populate modal content
        let modalContent = `
        <h2>${job.title || "No Title"}</h2>
        <div class="company-info">
            <span class="company-name">${job.company || "Not specified"}</span>
            <span class="job-location">${job.location || "Not specified"}</span>
        </div>
        <div class="job-info">
            <div class="info-item">
                <span class="label">Salary:</span>
                <span class="value">${job.salary || "Not specified"}</span>
            </div>
            <div class="info-item">
                <span class="label">Type:</span>
                <span class="value">${job.type || "Not specified"}</span>
            </div>
            <div class="info-item">
                <span class="label">${type === 'saved' ? 'Posted:' : 'Applied:'}</span>
                <span class="value">${type === 'saved' ?
                (job.posted ? formatDate(job.posted) : "Not specified") :
                (job.applied ? calculateTimeAgo(new Date(job.applied)) : "Not specified")}</span>
            </div>
            ${type === 'applied' && job.status ?
                `<div class="info-item">
                    <span class="label">Status:</span>
                    <span class="value status-badge ${job.status}">${capitalizeFirstLetter(job.status.replace('_', ' '))}</span>
                </div>` :
                ''
            }
        </div>
        <div class="job-description">
            <h3>Description</h3>
            <p>${job.description || "No description available."}</p>
        </div>
        <div class="job-requirements">
            <h3>Requirements</h3>
            <ul>
                ${Array.isArray(job.requirements) ?
                job.requirements.map(req => `<li>${req}</li>`).join('') :
                `<li>No requirements specified</li>`}
            </ul>
        </div>
    `;

        jobDetailContent.innerHTML = modalContent;

        // Update buttons based on job type
        if (type === 'saved') {
            applyButton.style.display = 'block';
            removeSavedButton.style.display = 'block';
            applyButton.onclick = () => {
                window.location.href = `jobseekers-apply.html?jobId=${job.id}`;
            };
            removeSavedButton.onclick = () => {
                removeSavedJob(job.id);
                closeJobModal();
            };
        } else {
            applyButton.style.display = 'none';
            removeSavedButton.style.display = 'none';
        }

        // Show modal
        modal.style.display = 'block';
    }
    // Close Job Modal
    function closeJobModal() {
        modal.style.display = 'none';
    }

    // Remove a saved job
    function removeSavedJob(jobId) {
        savedJobs = savedJobs.filter(job => job.id !== jobId);
        loadSavedJobs();
        showToast('Job removed from saved list');
    }

    // Show toast notification
    function showToast(message, type = '') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        // Show the toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove the toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Helper Functions
    function jobMatchesSearch(job, searchTerm) {
        searchTerm = searchTerm.toLowerCase();
        return (
            job.title.toLowerCase().includes(searchTerm) ||
            job.company.toLowerCase().includes(searchTerm) ||
            job.location.toLowerCase().includes(searchTerm)
        );
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Calculate "time ago" for application date
    function calculateTimeAgo(date) {
        const now = new Date();
        const diff = Math.abs(now - date);
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getPastDate(timeframe) {
        const today = new Date();
        switch (timeframe) {
            case 'today':
                return new Date(today.setHours(0, 0, 0, 0));
            case 'week':
                return new Date(today.setDate(today.getDate() - 7));
            case 'month':
                return new Date(today.setMonth(today.getMonth() - 1));
            default:
                return new Date(0); // Beginning of time
        }
    }

    // Event Listeners
    // Search saved jobs
    savedSearchBtn.addEventListener('click', () => {
        const searchTerm = savedSearchInput.value.trim();
        loadSavedJobs(searchTerm);
    });

    savedSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = savedSearchInput.value.trim();
            loadSavedJobs(searchTerm);
        }
    });

    // Search applied jobs
    appliedSearchBtn.addEventListener('click', () => {
        const searchTerm = appliedSearchInput.value.trim();
        const filters = {
            status: statusFilter.value,
            date: dateFilter.value
        };
        loadAppliedJobs(searchTerm, filters);
    });

    appliedSearchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = appliedSearchInput.value.trim();
            const filters = {
                status: statusFilter.value,
                date: dateFilter.value
            };
            loadAppliedJobs(searchTerm, filters);
        }
    });

    // Apply filters
    filterBtn.addEventListener('click', () => {
        const searchTerm = appliedSearchInput.value.trim();
        const filters = {
            status: statusFilter.value,
            date: dateFilter.value
        };
        loadAppliedJobs(searchTerm, filters);
    });

    // Close modal when clicking on X or outside the modal
    closeModal.addEventListener('click', closeJobModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeJobModal();
        }
    });

    // Keyboard accessibility for modal
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeJobModal();
        }
    });

    // Initialize page on load
    init();
});