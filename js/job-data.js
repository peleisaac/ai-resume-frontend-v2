// Job data management service
const JobDataService = {
    loadJobs: async function () {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.token) {
                console.warn("User not logged in or token missing. Falling back to mock data.");
                return this.getMockJobs();
            }

            const response = await fetch("https://ai-resume-backend.axxendcorp.com/api/v1/jobs", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                },
                mode: "cors"
            });

            const result = await response.json();

            if (response.ok && result.status_code === "AR00") {
                console.log("Jobs fetched successfully:", result);
                return this.formatApiJobs(result.jobs);
            } else {
                console.error("Failed to fetch jobs:", result.message);
                return this.getMockJobs();
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            return this.getMockJobs();
        }
    },

    formatApiJobs: function (apiJobs) {
        return apiJobs.map(job => ({
            id: job.job_id,
            jobTitle: job.title || "Untitled Position",
            category: job.category || "other",
            city: job.city || "Not specified",
            region: job.region || "Not specified",
            applications: job.no_of_applications || 0,
            datePosted: job.date_posted || new Date().toISOString().split('T')[0],
            status: job.status || "active"
        }));
    },

    updateJobList: function (newJob) {
        console.log("Updating job list with new job:", newJob);
        // This function is called after successfully adding a new job
        // It's primarily used to update any local cache or state if needed

        // For now, we'll just log the success
        // In a real implementation, you might want to update a local cache
        // or trigger a re-fetch of the job list

        console.log("Job added successfully, will refresh job list on next view");

        // If you need to update a local cache, you could do something like:
        // const currentJobs = JSON.parse(localStorage.getItem("jobs")) || [];
        // currentJobs.push(formatApiJob(newJob));
        // localStorage.setItem("jobs", JSON.stringify(currentJobs));

        return true;
    },
    // getRegionFromLocation: function(location) {
    //     // Simple function to determine region from location
    //     // Can be expanded with more sophisticated logic if needed
    //     if (!location) return "not specified";

    //     const location_lower = location.toLowerCase();
    //     if (location_lower.includes("remote")) return "remote";
    //     if (location_lower.includes("new york") || location_lower.includes("boston")) return "northeast";
    //     if (location_lower.includes("san francisco") || location_lower.includes("los angeles") ||
    //         location_lower.includes("seattle") || location_lower.includes("portland")) return "west";
    //     if (location_lower.includes("chicago") || location_lower.includes("detroit") ||
    //         location_lower.includes("minneapolis")) return "midwest";
    //     if (location_lower.includes("atlanta") || location_lower.includes("miami") ||
    //         location_lower.includes("dallas") || location_lower.includes("houston")) return "south";

    //     return "other";
    // },

    getMockJobs: function () {
        return [
            {
                id: 1,
                jobTitle: "Senior Software Engineer",
                category: "technology",
                city: "San Francisco",
                region: "west",
                applications: 24,
                datePosted: "2025-03-05",
                status: "active"
            },
            {
                id: 2,
                jobTitle: "Marketing Manager",
                category: "marketing",
                city: "New York",
                region: "northeast",
                applications: 15,
                datePosted: "2025-03-08",
                status: "active"
            },
            {
                id: 3,
                jobTitle: "Data Analyst",
                category: "technology",
                city: "Remote",
                region: "remote",
                applications: 8,
                datePosted: "2025-03-01",
                status: "active"
            },
            {
                id: 4,
                jobTitle: "Financial Advisor",
                category: "finance",
                city: "Chicago",
                region: "midwest",
                applications: 6,
                datePosted: "2025-02-20",
                status: "paused"
            },
            {
                id: 5,
                jobTitle: "HR Specialist",
                category: "other",
                city: "Denver",
                region: "west",
                applications: 12,
                datePosted: "2025-03-10",
                status: "active"
            }
        ];
    },

    getAllJobs: async function () {
        return await this.loadJobs();
    },

    updateJobStatus: async function (jobId, newStatus) {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.token) {
                console.warn("User not logged in or token missing. Cannot update job status.");
                return false;
            }

            const response = await fetch(`https://ai-resume-backend.axxendcorp.com/api/v1/jobs/${jobId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                },
                body: JSON.stringify({ status: newStatus }),
                mode: "cors"
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Job status updated successfully:", result);
                // Re-fetch and re-render the jobs table
                const jobs = await this.loadJobs();
                window.JobListings.renderJobs(jobs);
                return true;
            } else {
                console.error("Failed to update job status:", result.message);
                return false;
            }
        } catch (error) {
            console.error("Error updating job status:", error);
            return false;
        }
    },

    deleteJob: async function (jobId) {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user || !user.token) {
                console.warn("User not logged in or token missing. Cannot delete job.");
                return false;
            }

            const response = await fetch(`https://ai-resume-backend.axxendcorp.com/api/v1/jobs/${jobId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${user.token}`
                },
                mode: "cors"
            });

            if (response.ok) {
                console.log("Job deleted successfully");
                // Re-fetch and re-render the jobs table
                const jobs = await this.loadJobs();
                window.JobListings.renderJobs(jobs);
                return true;
            } else {
                const result = await response.json();
                console.error("Failed to delete job:", result.message);
                return false;
            }
        } catch (error) {
            console.error("Error deleting job:", error);
            return false;
        }
    }
};

// Make the service globally accessible
window.JobDataService = JobDataService;