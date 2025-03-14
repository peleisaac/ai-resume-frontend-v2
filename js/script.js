document.addEventListener("DOMContentLoaded", function () {
    loadCandidates();
});

function loadCandidates() {
    // Simulating localStorage data
    const candidates = [
        { name: "John Doe", resume_url: "https://example.com/resume1.pdf" },
        { name: "Jane Smith", resume_url: "https://example.com/resume2.pdf" },
    ];

    localStorage.setItem("candidates", JSON.stringify(candidates));

    const select = document.getElementById("candidate");
    const storedCandidates = JSON.parse(localStorage.getItem("candidates")) || [];

    storedCandidates.forEach(candidate => {
        let option = document.createElement("option");
        option.value = candidate.resume_url;
        option.textContent = candidate.name;
        select.appendChild(option);
    });
}

function fetchResumeUrl() {
    const selectedResume = document.getElementById("candidate").value;
    document.getElementById("resume_url").value = selectedResume;
}
document.addEventListener("DOMContentLoaded", function () {
    loadCandidates();
});

function loadCandidates() {
    // Simulating localStorage data
    const candidates = [
        { name: "John Doe", resume_url: "https://example.com/resume1.pdf" },
        { name: "Jane Smith", resume_url: "https://example.com/resume2.pdf" },
    ];

    localStorage.setItem("candidates", JSON.stringify(candidates));

    const select = document.getElementById("candidate");
    const storedCandidates = JSON.parse(localStorage.getItem("candidates")) || [];

    storedCandidates.forEach(candidate => {
        let option = document.createElement("option");
        option.value = candidate.resume_url;
        option.textContent = candidate.name;
        select.appendChild(option);
    });
}

function fetchResumeUrl() {
    const selectedResume = document.getElementById("candidate").value;
    document.getElementById("resume_url").value = selectedResume;
}
