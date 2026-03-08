console.log("Main script loaded");

const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";

const container = document.getElementById("issueContainer");
const loader = document.getElementById("loader");
const issueCount = document.getElementById("issueCount");


const allBtn = document.getElementById("allBtn");
const openBtn = document.getElementById("openBtn");
const closedBtn = document.getElementById("closedBtn");

// Search
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

let allIssues = [];

document.addEventListener("DOMContentLoaded", function () {
  loadIssues();
  setupEventListeners();
});
// LOAD ISSUES

async function loadIssues() {

  showLoader(true);

  try {

    const response = await fetch(API_BASE + "/issues");

    if (!response.ok) {
      throw new Error("Failed to fetch issues");
    }

    const data = await response.json();

    allIssues = data.data || [];

    displayIssues(allIssues);
    updateIssueCount(allIssues.length);

  } catch (error) {

    console.error("Error loading issues:", error);

    container.innerHTML = `
      <div class="col-span-full text-center py-10">
        <p class="text-red-500 text-lg">Failed to load issues</p>
        <button onclick="loadIssues()" class="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    `;

  } finally {

    showLoader(false);

  }

}

function displayIssues(issues) {

  container.innerHTML = "";

  if (issues.length === 0) {

    container.innerHTML = `
      <div class="col-span-full text-center py-10 text-gray-500">
        <p class="text-lg">No issues found</p>
      </div>
    `;

    return;

  }

  issues.forEach(function(issue){

    const card = createIssueCard(issue);
    container.appendChild(card);

  });

  document.querySelectorAll(".issue-card").forEach(function(card){

    card.addEventListener("click", function(){
      openModal(card.dataset.id);
    });

  });

}

// CREATE ISSUE CARD
function createIssueCard(issue) {

  const status = (issue.status || "").toLowerCase().trim();
  const isClosed = status.includes("close");

  const priority = issue.priority ? issue.priority.toUpperCase() : "LOW";
  const labels = Array.isArray(issue.labels) ? issue.labels : [];
  const category = (issue.category || "").toLowerCase();

  const borderColor = isClosed ? "border-purple-500" : "border-green-500";

  const priorityClass =
    priority === "HIGH"
      ? "bg-red-100 text-red-500"
      : priority === "MEDIUM"
      ? "bg-yellow-100 text-yellow-600"
      : "bg-gray-200 text-gray-600";

  const labelsHTML = generateLabelsHTML(labels, category, priority);

  const dateFormatted = issue.createdAt
    ? new Date(issue.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "";

  const description = issue.description || "No description provided";

  const shortDesc =
    description.length > 90
      ? description.substring(0, 90) + "..."
      : description;

  const card = document.createElement("div");

  card.className =
    `issue-card bg-white rounded-lg border-t-4 ${borderColor}
     shadow-sm hover:shadow-lg transition-all duration-300
     p-5 cursor-pointer flex flex-col h-full`;

  card.dataset.id = issue.id;

  card.innerHTML = `

  <div class="flex justify-between items-center mb-3">

     ${isClosed
      ? `<img src="assets/Closed-Status.png" class="w-5 h-5" alt="closed">`
      : `<img src="assets/Open-Status.png" class="w-5 h-5" alt="open">`
    }

    <span class="px-3 py-1 rounded-full text-xs font-semibold ${priorityClass}">
      ${priority}
    </span>

  </div>

  <h3 class="font-bold text-gray-800 text-base mb-2 line-clamp-2 hover:text-purple-600 transition-colors">
    ${issue.title || "Untitled Issue"}
  </h3>

  <p class="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow">
    ${shortDesc}
  </p>

  <div class="flex flex-wrap gap-2 mb-4">
    ${labelsHTML}
  </div>

  <div class="pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-500">
    <span>#${issue.id || "N/A"} by ${issue.author || "unknown"}</span>
    <span>${dateFormatted}</span>
  </div>

  `;

  return card;
}


// LABELS

function generateLabelsHTML(labels, category, priority) {

  let html = "";
  const labelString = labels.join(" ").toLowerCase();

  if (labelString.includes("bug") || category.includes("bug") || priority === "HIGH") {

    html += `
      <span class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded">
        🐞 BUG
      </span>
    `;

  }

  if (labelString.includes("enhancement") || category.includes("enhancement")) {

    html += `
      <span class="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
        ✨ ENHANCEMENT
      </span>
    `;

  }

  if (labelString.includes("help")) {

    html += `
      <span class="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
        🤝 HELP WANTED
      </span>
    `;

  }

  if (html === "") {

    html = `
      <span class="px-2 py-1 text-xs bg-green-100 text-green-600 rounded">
        ✨ ENHANCEMENT
      </span>
    `;

  }

  return html;
}

// OPEN MODAL

async function openModal(issueId) {

  try {

    const response = await fetch(API_BASE + "/issue/" + issueId);

    if (!response.ok) {
      throw new Error("Failed to fetch issue details");
    }

    const data = await response.json();
    const issue = data.data;

    const dateFormatted = issue.createdAt
      ? new Date(issue.createdAt).toLocaleDateString("en-US")
      : "";

    const labels = generateLabelsHTML(
      issue.labels || [],
      issue.category || "",
      issue.priority || "LOW"
    );

    const modalContent = `

      <h2 class="text-xl font-bold text-gray-800 mb-2">
        ${issue.title}
      </h2>

      <div class="flex items-center gap-2 mb-3">
        <span class="px-2 py-1 rounded text-xs bg-green-100 text-green-700">
          ${issue.status}
        </span>

        <span class="text-sm text-gray-500">
          Opened by ${issue.author} • ${dateFormatted}
        </span>
      </div>

      <div class="flex gap-2 mb-4">
        ${labels}
      </div>

      <p class="text-gray-600 mb-4">
        ${issue.description}
      </p>

      <div class="grid grid-cols-2 gap-4 bg-gray-100 p-3 rounded mb-4">

        <div>
          <p class="text-xs text-gray-500">Assignee</p>
          <p class="font-medium">${issue.author}</p>
        </div>

        <div>
          <p class="text-xs text-gray-500">Priority</p>
          <span class="px-2 py-1 rounded text-xs bg-red-100 text-red-600">
            ${issue.priority}
          </span>
        </div>

      </div>

      <div class="flex justify-end">
        <button onclick="document.getElementById('issueModal').close()"
          class="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700">
          Close
        </button>
      </div>

    `;

    const modalBox = document.querySelector("#issueModal .modal-box");
    modalBox.innerHTML = modalContent;

    document.getElementById("issueModal").showModal();

  } catch (error) {

    console.error("Error loading issue details:", error);

  }

}


// EVENTS

function setupEventListeners() {

  allBtn.addEventListener("click", function () {

    setActiveTab(allBtn);
    displayIssues(allIssues);
    updateIssueCount(allIssues.length);

  });

  openBtn.addEventListener("click", function () {

    setActiveTab(openBtn);

    const openIssues = allIssues.filter(function(issue){
      return (issue.status || "").toLowerCase().includes("open");
    });

    displayIssues(openIssues);
    updateIssueCount(openIssues.length);

  });

  closedBtn.addEventListener("click", function () {

    setActiveTab(closedBtn);

    const closedIssues = allIssues.filter(function(issue){
      return (issue.status || "").toLowerCase().includes("close");
    });

    displayIssues(closedIssues);
    updateIssueCount(closedIssues.length);

  });

  searchBtn.addEventListener("click", performSearch);

  searchInput.addEventListener("keypress", function(e){
    if (e.key === "Enter") performSearch();
  });

}

// SEARCH

async function performSearch() {

  const query = searchInput.value.trim();

  if (!query) {

    displayIssues(allIssues);
    updateIssueCount(allIssues.length);
    return;

  }

  showLoader(true);

  try {

    const response =
      await fetch(API_BASE + "/issues/search?q=" + encodeURIComponent(query));

    const data = await response.json();
    const results = data.data || [];

    displayIssues(results);
    updateIssueCount(results.length);

  } catch (error) {

    console.error("Search error:", error);

  } finally {

    showLoader(false);

  }

}

// HELPERS

function setActiveTab(activeBtn) {

  const buttons = [allBtn, openBtn, closedBtn];

  buttons.forEach(function(btn){

    if (btn === activeBtn) {

      btn.className =
        "tabBtn px-6 py-2 rounded bg-purple-600 text-white font-medium shadow-md";

    } else {

      btn.className =
        "tabBtn px-6 py-2 rounded border border-gray-300 text-gray-700";

    }

  });

}

function updateIssueCount(count) {
  issueCount.textContent = count + " Issue" + (count !== 1 ? "s" : "");
}

function showLoader(show) {
  if (show) loader.classList.remove("hidden");
  else loader.classList.add("hidden");
}
