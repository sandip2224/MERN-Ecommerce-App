const tableDropdown = document.getElementById("tableDropdown");
const goButton = document.getElementById("goButton");
const loading = document.getElementById("loading");
const table = document.getElementById("table");
const pagination = document.getElementById("pagination");

const itemsPerPage = 5; // Number of items to display per page
let currentPage = 1;
let currentData = [];
let currentSchema = [];

goButton.addEventListener("click", fetchData);

pagination.addEventListener("click", (event) => {
  if (event.target.classList.contains("page-link")) {
    currentPage = parseInt(event.target.dataset.page);
    displayData();
  }
});

function fetchData() {
  const selectedTable = tableDropdown.value;
  loading.style.display = "block";
  table.style.display = "none";

  // Replace this with your actual API endpoint URL
  const apiUrl = `/api/${selectedTable}/`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      currentData = data.data;
      currentSchema = Object.keys(data.data[0]); // Generate schema from keys of the first data row
      currentPage = 1;
      loading.style.display = "none";
      displayData();
    })
    .catch(error => {
      console.error("Error fetching data:", error);
      loading.style.display = "none";
    });
}

function displayData() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToDisplay = currentData.slice(startIndex, endIndex);

  table.innerHTML = generateTableHtml(itemsToDisplay);
  table.style.display = "block";
  generatePagination();
}

function generateTableHtml(data) {
  let html = "<tr>";
  currentSchema.forEach(column => {
    html += `<th>${column}</th>`;
  });
  html += "</tr>";

  data.forEach(item => {
    html += "<tr>";
    currentSchema.forEach(column => {
      html += `<td>${item[column]}</td>`;
    });
    html += "</tr>";
  });

  return html;
}

function generatePagination() {
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  let paginationHtml = `<li class="page-item ${currentPage === 1 ? "disabled" : ""
    }"><a class="page-link" href="#" data-page="${currentPage - 1
    }">Previous</a></li>`;

  for (let page = 1; page <= totalPages; page++) {
    paginationHtml += `<li class="page-item ${currentPage === page ? "active" : ""
      }"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }

  paginationHtml += `<li class="page-item ${currentPage === totalPages ? "disabled" : ""
    }"><a class="page-link" href="#" data-page="${currentPage + 1
    }">Next</a></li>`;

  pagination.innerHTML = paginationHtml;
}

// Initial fetch when the page loads
fetchData();
