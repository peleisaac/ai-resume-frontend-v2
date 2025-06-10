// State variables
let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
let jobsPerPage = 10;
let currentFilters = {
  search: "",
  location: "",
  jobType: "",
  category: "",
};

// DOM elements
const jobsListElement = document.getElementById("jobs-list");
const jobCountElement = document.getElementById("job-count-number");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const pageNumbersElement = document.getElementById("page-numbers");
const searchInput = document.getElementById("job-search");
const searchButton = document.getElementById("search-btn");
const locationFilter = document.getElementById("location");
const jobTypeFilter = document.getElementById("job-type");
const categoryFilter = document.getElementById("category");
const filterButton = document.getElementById("filter-btn");
const jobModal = document.getElementById("job-modal");
const closeModalButton = document.querySelector(".close");
const jobDetailContent = document.getElementById("job-detail-content");
const applyButton = document.getElementById("apply-btn");
const saveJobButton = document.getElementById("save-job-btn");

// Normalize and deduplicate filter values
function normalizeAndDeduplicate(items) {
  const seen = new Set();
  const normalizationMap = {
    fulltime: "Full Time",
    "full time": "Full Time",
    "full-time": "Full Time",
    parttime: "Part Time",
    "part time": "Part Time",
    "part-time": "Part Time",
    remote: "Remote",
    onsite: "On-site",
    "on-site": "On-site",
    hybrid: "Hybrid",
    contract: "Contract",
    freelance: "Freelance",
    internship: "Internship",
  };
  return items
    .map((item) => item?.toString().trim().toLowerCase().replace(/\s+/g, " "))
    .map((item) => normalizationMap[item] || capitalizeWords(item))
    .filter((item) => item && !seen.has(item) && seen.add(item));
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, (l) => l.toUpperCase());
}

function populateDropdown(selectId, optionsArray, defaultOptionText) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">${defaultOptionText}</option>`;
  optionsArray.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.toLowerCase();
    opt.textContent = option;
    select.appendChild(opt);
  });
}

// API endpoints for fetching jobs
async function fetchJobs() {
  try {
    const response = await fetch(apiEndpoints.jobs);
    if (!response.ok) throw new Error("Failed to fetch jobs data");

    const data = await response.json();
    allJobs = data.jobs || [];
    filteredJobs = [...allJobs];

    const contractTypes = normalizeAndDeduplicate(
      allJobs.map((job) => job.contract_type)
    );
    const locations = normalizeAndDeduplicate(allJobs.map((job) => job.region));
    const categories = normalizeAndDeduplicate(
      allJobs.map((job) => job.category || "")
    );

    populateDropdown("job-type", contractTypes, "All Types");
    populateDropdown("location", locations, "All Locations");
    populateDropdown("category", categories, "All Categories");

    updateJobCount();
    renderJobs();
    renderPagination();

    // Success toast
    Toast.success(`${data.message}`);
  } catch (error) {
    console.error("Error fetching jobs:", error);

    // Error toast
    Toast.error("Failed to load jobs. Please try again later.", "Error");

    jobsListElement.innerHTML = `
      <div class="error-message">
        <p>Failed to load jobs. Please try again later.</p>
        <button class="btn secondary-blue" onclick="fetchJobs()">Retry</button>
      </div>`;
  }
}

function renderJobs() {
  if (filteredJobs.length === 0) {
    jobsListElement.innerHTML = `
      <div class="no-jobs-message">
        <p>No jobs match your search criteria. Try adjusting your filters.</p>
      </div>`;
    return;
  }

  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = Math.min(startIndex + jobsPerPage, filteredJobs.length);
  const jobsToDisplay = filteredJobs.slice(startIndex, endIndex);

  let jobsHTML = jobsToDisplay
    .map((job) => {
      const postedDate = new Date(job.created_at);
      const diffDays = Math.floor(
        (new Date() - postedDate) / (1000 * 60 * 60 * 24)
      );
      const timeAgo =
        diffDays === 0
          ? "Today"
          : diffDays < 7
          ? `${diffDays} day(s) ago`
          : `${Math.floor(diffDays / 7)} week(s) ago`;
      return `
      <div class="job-card" data-job-id="${job.job_id}">
        <div class="job-header">
          <div><h3 class="job-title">${
            job.title
          }</h3><div class="company-name">${job.company_name}</div></div>
          <div class="salary">${job.salary}</div>
        </div>
        <div class="job-details">
          <div class="job-detail">${job.region}</div>
          <div class="job-detail">${job.contract_type}</div>
          <div class="job-detail">${job.experience}</div>
        </div>
        <div class="job-description">${job.description}</div>
        <div class="job-tags">${job.required_skills
          .map(
            (skill) =>
              `<span class="job-tag" style="background: var(--light-blue-color); color: white;">${skill}</span>`
          )
          .join("")}</div>
        <div class="posted-date">Posted ${timeAgo}</div>
      </div>`;
    })
    .join("");

  jobsListElement.innerHTML = jobsHTML;
  document.querySelectorAll(".job-card").forEach((card) => {
    card.addEventListener("click", () => openJobDetails(card.dataset.jobId));
  });
}

function updateJobCount() {
  jobCountElement.textContent = filteredJobs.length;
}

function renderPagination() {
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  prevPageButton.classList.toggle("disabled", currentPage === 1);
  nextPageButton.classList.toggle(
    "disabled",
    currentPage === totalPages || totalPages === 0
  );

  let pagesHTML = "";
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

  for (let i = startPage; i <= endPage; i++) {
    pagesHTML += `<span class="${
      i === currentPage ? "current" : ""
    }">${i}</span>`;
  }
  pageNumbersElement.innerHTML = pagesHTML;
  document.querySelectorAll(".page-numbers span").forEach((span) => {
    span.addEventListener("click", () => {
      currentPage = parseInt(span.textContent);
      renderJobs();
      renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function applyFilters() {
  currentFilters = {
    search: searchInput.value.toLowerCase(),
    location: locationFilter.value,
    jobType: jobTypeFilter.value,
    category: categoryFilter.value,
  };

  filteredJobs = allJobs.filter((job) => {
    return (
      (!currentFilters.search ||
        job.title.toLowerCase().includes(currentFilters.search) ||
        job.company_name.toLowerCase().includes(currentFilters.search) ||
        job.description.toLowerCase().includes(currentFilters.search) ||
        job.required_skills.some((skill) =>
          skill.toLowerCase().includes(currentFilters.search)
        )) &&
      (!currentFilters.location ||
        job.region.toLowerCase() === currentFilters.location) &&
      (!currentFilters.jobType ||
        job.contract_type.toLowerCase() === currentFilters.jobType) &&
      (!currentFilters.category ||
        job.category?.toLowerCase() === currentFilters.category)
    );
  });

  currentPage = 1;
  updateJobCount();
  renderJobs();
  renderPagination();
}

function openJobDetails(jobId) {
  const job = allJobs.find((job) => String(job.job_id) === String(jobId));
  if (!job) return;

  jobDetailContent.innerHTML = `
    <div class="job-detail-header">
      <h2>${job.title}</h2>
      <div class="company-detail"><div class="company-name">${
        job.company_name
      }</div><div class="company-location">${job.region}</div></div>
      <div class="job-highlight"><div class="salary">${
        job.salary
      }</div><div class="job-type">${
    job.contract_type
  }</div><div class="experience-level">${job.experience}</div></div>
    </div>
    <div class="job-description-full"><h3>Job Description</h3>${
      job.description
    }</div>
    <div class="job-requirements"><h3>Requirements</h3><ul>${job.requirements
      .map((req) => `<li>${req}</li>`)
      .join("")}</ul></div>
    <div class="job-benefits"><h3>Benefits</h3><ul>${job.benefits
      .map((benefit) => `<li>${benefit}</li>`)
      .join("")}</ul></div>
    <div class="job-skills"><h3>Required Skills</h3><div class="job-tags">${job.required_skills
      .map(
        (skill) =>
          `<span class="job-tag" style="background: var(--light-blue-color); color: white;">${skill}</span>`
      )
      .join("")}</div></div>`;

  applyButton.setAttribute("data-job-id", job.job_id);
  saveJobButton.setAttribute("data-job-id", job.job_id);
  jobModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeJobDetails() {
  jobModal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Function to check if user is logged in
function checkUserLoggedIn() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  return !!(token && user?.user_id);
}

// Function to apply for a job
async function applyForJob(jobId) {
  if (!checkUserLoggedIn()) {
    Toast.warning("Please sign in to apply for jobs", "Sign In Required");
    // Add delay before navigation
    setTimeout(() => {
      window.location.href = `../pages/jobseekers-signin.html?redirect=jobs&jobId=${jobId}`;
    }, 1000); // 2 second delay
    return;
  }

  try {
    // Find the job to get employer_id
    const job = allJobs.find((job) => String(job.job_id) === String(jobId));
    if (!job) {
      Toast.error("Job not found", "Error");
      return;
    }

    // Show loading toast
    Toast.info("Submitting your application...", "Please wait");

    // Call the service function
    const result = await JobService.applyForJob(jobId, job.employer_id);

    // Show success toast
    Toast.success("Application submitted successfully!", "Success");

    // Optionally close the modal
    closeJobDetails();
  } catch (error) {
    console.error("Error applying for job:", error);

    // Show specific error message
    if (error.message.includes("Authentication")) {
      Toast.error("Please sign in again", "Authentication Error");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        window.location.href = "../pages/jobseekers-signin.html";
      }, 1000);
    } else if (error.message.includes("already applied")) {
      Toast.warning("You have already applied for this job", "Already Applied");
    } else {
      Toast.error(
        error.message || "Failed to submit application",
        "Application Error"
      );
    }
  }
}

async function saveJob(jobId) {
  if (!checkUserLoggedIn()) {
    Toast.warning("Please sign in to save jobs", "Sign In Required");
    // Add delay before navigation
    setTimeout(() => {
      window.location.href = "../pages/jobseekers-signin.html?redirect=jobs";
    }, 1000); // 2 second delay
    return;
  }

  try {
    // Show loading toast
    Toast.info("Saving job...", "Please wait");

    // Call the service function
    const result = await JobService.saveJob(jobId);

    // Show success toast
    Toast.success("Job saved to your profile!", "Saved");

    // Update the save button text/state if needed
    const saveButton = document.getElementById("save-job-btn");
    if (saveButton) {
      saveButton.textContent = "Saved ✓";
      saveButton.disabled = true;
      saveButton.classList.add("saved");
    }
  } catch (error) {
    console.error("Error saving job:", error);

    // Show specific error message
    if (error.message.includes("Authentication")) {
      Toast.error("Please sign in again", "Authentication Error");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => {
        window.location.href = "../pages/jobseekers-signin.html";
      }, 1000);
    } else if (error.message.includes("already saved")) {
      Toast.warning("Job is already in your saved list", "Already Saved");
    } else {
      Toast.error(error.message || "Failed to save job", "Save Error");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(fetchJobs, 100);
  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderJobs();
      renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  nextPageButton.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderJobs();
      renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  searchButton.addEventListener("click", applyFilters);
  filterButton.addEventListener("click", applyFilters);

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") applyFilters();
  });

  closeModalButton.addEventListener("click", closeJobDetails);
  window.addEventListener("click", (e) => {
    if (e.target === jobModal) closeJobDetails();
  });

  applyButton.addEventListener("click", () =>
    applyForJob(applyButton.getAttribute("data-job-id"))
  );
  saveJobButton.addEventListener("click", () =>
    saveJob(saveJobButton.getAttribute("data-job-id"))
  );
});
