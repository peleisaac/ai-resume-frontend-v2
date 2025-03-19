function initializeJobPage() {
    // State variables
    let allJobs = [];
    let filteredJobs = [];
    let currentPage = 1;
    let jobsPerPage = 10;
    let currentFilters = {
        search: '',
        location: '',
        jobType: '',
        experience: ''
    };

    // DOM elements
    const jobsListElement = document.getElementById('jobs-list');
    const jobCountElement = document.getElementById('job-count-number');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    const pageNumbersElement = document.getElementById('page-numbers');
    const searchInput = document.getElementById('job-search');
    const searchButton = document.getElementById('search-btn');
    const locationFilter = document.getElementById('location');
    const jobTypeFilter = document.getElementById('job-type');
    const experienceFilter = document.getElementById('experience');
    const filterButton = document.getElementById('filter-btn');
    const jobModal = document.getElementById('job-modal');
    const closeModalButton = document.querySelector('.close');
    const jobDetailContent = document.getElementById('job-detail-content');
    const applyButton = document.getElementById('apply-btn');
    const saveJobButton = document.getElementById('save-job-btn');

    // Fetch jobs data
    async function fetchJobs() {
        try {
            const response = await fetch(`../models/jobs.json?t=${new Date().getTime()}`, { cache: "no-store" });
            if (!response.ok) {
                throw new Error('Failed to fetch jobs data');
            }

            allJobs = await response.json();
            filteredJobs = [...allJobs];

            console.log('Fetched jobs:', allJobs);

            renderJobs();
            renderPagination();
        } catch (error) {
            console.error('Error fetching jobs:', error);
            jobsListElement.innerHTML = `
                <div class="error-message">
                    <p>Failed to load jobs. Please try again later.</p>
                    <button class="btn secondary-blue" onclick="fetchJobs()">Retry</button>
                </div>
            `;
        }
    }

    // Render jobs list
    function renderJobs() {
        if (filteredJobs.length === 0) {
            jobsListElement.innerHTML = `
                <div class="no-jobs-message">
                    <p>No jobs match your search criteria. Try adjusting your filters.</p>
                </div>
            `;
            return;
        }

        // Calculate pagination
        const startIndex = (currentPage - 1) * jobsPerPage;
        const endIndex = Math.min(startIndex + jobsPerPage, filteredJobs.length);
        const jobsToDisplay = filteredJobs.slice(startIndex, endIndex);

        // Build HTML
        let jobsHTML = '';

        jobsToDisplay.forEach(job => {
            const postedDate = new Date(job.postedDate);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - postedDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let timeAgo;
            if (diffDays === 0) {
                timeAgo = 'Today';
            } else if (diffDays === 1) {
                timeAgo = '1 day ago';
            } else if (diffDays < 7) {
                timeAgo = `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                timeAgo = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
            } else {
                const months = Math.floor(diffDays / 30);
                timeAgo = `${months} ${months === 1 ? 'month' : 'months'} ago`;
            }

            jobsHTML += `
                <div class="job-card" data-job-id="${job.id}">
                    <div class="job-header">
                        <div>
                            <h3 class="job-title">${job.title}</h3>
                            <div class="company-name">${job.company}</div>
                        </div>
                        <div class="salary">${job.salary}</div>
                    </div>
                    <div class="job-details">
                        <div class="job-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${job.location}
                        </div>
                        <div class="job-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                            ${job.type}
                        </div>
                        <div class="job-detail">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            ${job.experience}
                        </div>
                    </div>
                    <div class="job-description">
                        ${job.shortDescription}
                    </div>
                    <div class="job-tags">
                        ${job.skills.map(skill => `<span class="job-tag">${skill}</span>`).join('')}
                    </div>
                    <div class="posted-date">Posted ${timeAgo}</div>
                </div>
            `;
        });

        jobsListElement.innerHTML = jobsHTML;

        // Add event listeners for job cards
        document.querySelectorAll('.job-card').forEach(card => {
            card.addEventListener('click', () => {
                const jobId = card.getAttribute('data-job-id');
                openJobDetails(jobId);
            });
        });
    }

    // Update job count display
    function updateJobCount() {
        jobCountElement.textContent = filteredJobs.length;
    }

    // Render pagination controls
    function renderPagination() {
        const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

        prevPageButton.classList.toggle('disabled', currentPage === 1);
        nextPageButton.classList.toggle('disabled', currentPage === totalPages || totalPages === 0);

        let pagesHTML = '';
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pagesHTML += `<span class="${i === currentPage ? 'current' : ''}">${i}</span>`;
        }

        pageNumbersElement.innerHTML = pagesHTML;

        document.querySelectorAll('#page-numbers span').forEach(span => {
            span.addEventListener('click', () => {
                if (!span.classList.contains('current')) {
                    currentPage = parseInt(span.textContent);
                    renderJobs();
                    renderPagination();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    // Apply filters
    function applyFilters() {
        currentFilters = {
            search: searchInput.value.toLowerCase(),
            location: locationFilter.value,
            jobType: jobTypeFilter.value,
            experience: experienceFilter.value
        };

        filteredJobs = allJobs.filter(job => {
            const searchMatch = !currentFilters.search ||
                job.title.toLowerCase().includes(currentFilters.search) ||
                job.company.toLowerCase().includes(currentFilters.search) ||
                job.shortDescription.toLowerCase().includes(currentFilters.search) ||
                job.skills.some(skill => skill.toLowerCase().includes(currentFilters.search));

            const locationMatch = !currentFilters.location || job.location.toLowerCase().includes(currentFilters.location);
            const jobTypeMatch = !currentFilters.jobType || job.type.toLowerCase() === currentFilters.jobType;
            const experienceMatch = !currentFilters.experience || job.experience.toLowerCase().includes(currentFilters.experience);

            return searchMatch && locationMatch && jobTypeMatch && experienceMatch;
        });

        currentPage = 1;
        updateJobCount();
        renderJobs();
        renderPagination();
    }

    // Open job details modal
    function openJobDetails(jobId) {
        const job = allJobs.find(job => job.id.toString() === jobId);
        if (!job) return;

        jobDetailContent.innerHTML = `
            <div class="job-detail-header">
                <h2>${job.title}</h2>
                <div class="company-detail">
                    <div class="company-name">${job.company}</div>
                    <div class="company-location">${job.location}</div>
                </div>
                <div class="job-highlight">
                    <div class="salary">${job.salary}</div>
                    <div class="job-type">${job.type}</div>
                    <div class="experience-level">${job.experience}</div>
                </div>
            </div>
            
            <div class="job-description-full">
                <h3>Job Description</h3>
                ${job.fullDescription}
            </div>
            
            <div class="job-requirements">
                <h3>Requirements</h3>
                <ul>
                    ${job.requirements.map(req => `<li>${req}</li>`).join('')}
                </ul>
            </div>
            
            <div class="job-benefits">
                <h3>Benefits</h3>
                <ul>
                    ${job.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>
            
            <div class="job-skills">
                <h3>Required Skills</h3>
                <div class="job-tags">
                    ${job.skills.map(skill => `<span class="job-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `;

        applyButton.setAttribute('data-job-id', job.id);
        saveJobButton.setAttribute('data-job-id', job.id);

        jobModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Close job details modal
    function closeJobDetails() {
        jobModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Apply for job
    function applyForJob(jobId) {
        const isLoggedIn = checkUserLoggedIn();
        if (!isLoggedIn) {
            window.location.href = `../pages/jobseekers-signin.html?redirect=jobs&jobId=${jobId}`;
            return;
        }
        alert('Application functionality would be implemented here!');
    }

    // Save job
    function saveJob(jobId) {
        const isLoggedIn = checkUserLoggedIn();
        if (!isLoggedIn) {
            window.location.href = '../pages/jobseekers-signin.html?redirect=jobs';
            return;
        }
        alert('Job saved to your profile!');
    }

    // Check if user is logged in
    function checkUserLoggedIn() {
        return false;
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', () => {
        fetchJobs();

        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderJobs();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        nextPageButton.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderJobs();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        searchButton.addEventListener('click', applyFilters);
        filterButton.addEventListener('click', applyFilters);

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });

        closeModalButton.addEventListener('click', closeJobDetails);
        window.addEventListener('click', (e) => {
            if (e.target === jobModal) {
                closeJobDetails();
            }
        });

        applyButton.addEventListener('click', () => {
            const jobId = applyButton.getAttribute('data-job-id');
            applyForJob(jobId);
        });

        saveJobButton.addEventListener('click', () => {
            const jobId = saveJobButton.getAttribute('data-job-id');
            saveJob(jobId);
        });
    });
}
