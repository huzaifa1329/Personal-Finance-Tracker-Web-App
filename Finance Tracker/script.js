// ================== CHART ==================
const chartCanvas = document.getElementById("financeChart");
let financeChart = null;

// ================== ELEMENTS ==================
const form = document.getElementById("transactionForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const list = document.getElementById("transactionList");

const balanceEl = document.querySelector(".totalBalance");
const incomeEl = document.querySelector(".totalIncome");
const expenseEl = document.querySelector(".totalExpense");

const filterType = document.getElementById("filterType");
const searchInput = document.getElementById("search");

const darkBtn = document.getElementById("modeToggle");
const exportBtn = document.getElementById("exportBtn");

// ================== DATA ==================
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let editId = null;


// ================== STORAGE ==================
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ================== EXPORT ==================
exportBtn.addEventListener("click", () => {

  if(transactions.length === 0){
    alert("No data to export!");
    return;
  }

  const data = JSON.stringify(transactions, null, 2);

  const blob = new Blob([data], { type: "application/json" });

  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "finance-data.json";

  link.click();
});

// ================== ADD TRANSACTION ==================
form.addEventListener("submit", (e) => {

  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const type = typeInput.value;
  const category = categoryInput.value;
  const date = dateInput.value;

  if(!title || amount <= 0 || !type || !category || !date){
    alert("Please fill all fields correctly!");
    return;
  }

  // ================= UPDATE MODE =================
  if(editId){

    const index = transactions.findIndex(t => t.id === editId);

    if(index !== -1){

      transactions[index] = {
        id: editId,
        title,
        amount,
        type,
        category,
        date
      };
    }

    editId = null; // reset edit mode
  }

  // ================= ADD MODE =================
  else{

    const transaction = {
      id: Date.now(),
      title,
      amount,
      type,
      category,
      date
    };

    transactions.push(transaction);
  }

  saveData();
  renderTransactions();
  updateDashboard();
  updateChart();

  form.reset();
});


// ================== RENDER ==================
function renderTransactions(data = transactions){

  list.innerHTML = "";

  if(data.length === 0){
    list.innerHTML = `<p id="emptyMsg">No transactions yet. Add one!</p>`;
    return;
  }

  data.forEach(item => {

    const li = document.createElement("li");

    li.innerHTML = `
      <span>
        ${item.title} 
        ${item.type === "income" ? "+" : "-"}$${item.amount}
        (${item.category})
      </span>

      <div>
        <button onclick="editTransaction(${item.id})">✏️</button>
        <button onclick="deleteTransaction(${item.id})">❌</button>
      </div>
    `;

    list.appendChild(li);
  });
}

// ================== DELETE ==================
function deleteTransaction(id){

  if(!confirm("Delete this transaction?")) return;

  transactions = transactions.filter(item => item.id !== id);

  saveData();
  renderTransactions();
  updateDashboard();
  updateChart();
}

// ================== EDIT ==================
function editTransaction(id){

  const transaction = transactions.find(t => t.id === id);

  if(!transaction) return;

  // Fill form
  titleInput.value = transaction.title;
  amountInput.value = transaction.amount;
  typeInput.value = transaction.type;
  categoryInput.value = transaction.category;
  dateInput.value = transaction.date;

  // Store ID for update
  editId = id;
}


// ================== DASHBOARD ==================
function updateDashboard(){

  let income = 0;
  let expense = 0;

  transactions.forEach(item => {

    if(item.type === "income"){
      income += item.amount;
    } else {
      expense += item.amount;
    }
  });

  const balance = income - expense;

  incomeEl.textContent = `$${income}`;
  expenseEl.textContent = `$${expense}`;
  balanceEl.textContent = `$${balance}`;
}

// ================== CHART ==================
function updateChart(){

  let income = 0;
  let expense = 0;

  transactions.forEach(item => {

    if(item.type === "income"){
      income += item.amount;
    } else {
      expense += item.amount;
    }
  });

  if(financeChart){
    financeChart.destroy();
  }

  financeChart = new Chart(chartCanvas, {

    type: "pie",

    data: {
      labels: ["Income", "Expense"],

      datasets: [{
        data: [income, expense],

        backgroundColor: [
          "#28a745",
          "#dc3545"
        ]
      }]
    },

    options: {
      responsive: true,

      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// ================== FILTER + SEARCH ==================
function filterTransactions(){

  let data = [...transactions];

  const type = filterType.value;
  const keyword = searchInput.value.toLowerCase();

  if(type !== "all"){
    data = data.filter(item => item.type === type);
  }

  if(keyword){
    data = data.filter(item =>
      item.title.toLowerCase().includes(keyword)
    );
  }

  renderTransactions(data);
}

filterType.addEventListener("change", filterTransactions);
searchInput.addEventListener("input", filterTransactions);

// ================== DARK MODE ==================
darkBtn.addEventListener("click", ()=>{

  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    localStorage.setItem("theme","dark");
    darkBtn.textContent = "Light Mode";
  }else{
    localStorage.setItem("theme","light");
    darkBtn.textContent = "Dark Mode";
  }
});

// Load theme
if(localStorage.getItem("theme") === "dark"){
  document.body.classList.add("dark");
  darkBtn.textContent = "Light Mode";
}

// ================== INIT ==================
function init(){

  renderTransactions();
  updateDashboard();
  updateChart();
}

init();
