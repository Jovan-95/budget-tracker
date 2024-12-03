const addBtn = document.querySelector('#addBtn');
const amount = document.querySelector('#amount');
const category = document.querySelector('#category');
const transactions = document.querySelector('#transactions');
let totalIncome = document.querySelector('#total-income');
let totalExpenses = document.querySelector('#total-expenses');
let balance = document.querySelector('#balance');
const notification = document.querySelector('.notification');
let totalIncomeValue = 0;
let totalExpensesValue = 0;
let totalBalance = 0;


///// REGISTER
const reg = document.querySelector('.register')
const regForm = document.querySelector('#registrationForm')
async function registration(e) {
    e.preventDefault();

    // Get form values
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    // Basic validation
    if (username === '' || email === '' || password === '') {
        alert('All fields are required.');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    // Data to be sent in the POST request
    const newData = {
        username: username,
        email: email,
        password: password,
    };

    try {
        let res = await fetch('https://jsonplaceholder.typicode.com/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
        });
        if (!res.ok) {
            throw new Error(`${res.status}, ${res.statusText}`)
        }
        // console.log(res)
        const data = await res.json();
        console.log(data);
        let wrapper = document.querySelector('.wrapper');
        wrapper.classList.remove('hidden')
        reg.classList.add('hidden')
    } catch (err) {
        console.log(err)
    }
}
regForm.addEventListener('submit', registration)

//////////// !!!!!!!!! Project
// Date
let d = new Date();
let date = d.toISOString().split('T')[0];

// Type
const selectElement = document.getElementById('type');

//
let uniqueId = 0;
Number(uniqueId);

// ADD TRANSACTION (post)
async function addTransaction() {
    try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/todos`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                {
                    amount: Number(amount.value),
                    category: category.value,
                    type: selectElement.value,
                }
            ),
        });
        if (!res.ok) {
            throw new Error(`${res.status}, ${res.statusText}`);
        }
        // console.log(res);
        const data = await res.json();
        console.log(data);

        if (data.type === 'income') {
            totalIncomeValue += data.amount;
            totalIncome.innerHTML = `$${totalIncomeValue}`;

        } else if (data.type === 'expense') {
            totalExpensesValue += data.amount;
            totalExpenses.innerHTML = `$${totalExpensesValue}`
        }

        updateChart()

        totalBalance = totalIncomeValue - totalExpensesValue
        balance.innerHTML = `$${totalBalance}`;

        let markup = `
            <tr data-id="${uniqueId++}">
                <td>${date}</td>
                <td class="amount">${data.amount}$</td>
                <td>${data.category}</td>
                <td class="type">${data.type}</td>
                <td><button class="delete-buttons">DELETE</button></td>
            </tr>
`;
        transactions.insertAdjacentHTML('afterbegin', markup);


        showNotification(`Transaction with ID ${uniqueId} is added successfully!`, 'green')

    } catch (err) {
        console.log(err)
    }
}

// DELETE TRANSACTION
async function deleteTransaction(id) {
    try {
        const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
            method: 'DELETE',

        })
        if (!res.ok) {
            throw new Error(`${res.status}, ${res.statusText}`);
        }
        // console.log(res);
        const data = await res.json();
        console.log(data);

        // Remove transaction from the DOM
        const transactionElement = document.querySelector(`[data-id="${id}"]`);
        console.log(transactionElement)
        if (transactionElement) {
            transactionElement.remove();
        }

        showNotification(`Transaction with ID ${id} deleted successfully`, 'red')

    } catch (err) {
        console.log(err)
    }
}

// EVENT DELEGATION
transactions.addEventListener('click', function (e) {
    if (e.target.classList.contains('delete-buttons')) {
        // Handle delete
        const transactionElement = e.target.closest('tr');
        const transactionId = transactionElement.getAttribute('data-id');

        let amount = transactionElement.querySelector('.amount');
        amount = amount.textContent.slice(0, -1);
        amount = Number(amount);

        deleteTransaction(transactionId);

        let type = transactionElement.querySelector('.type');
        if (type.textContent === 'income') {
            totalIncomeValue = totalIncomeValue - amount;
            totalIncome.innerHTML = `$${totalIncomeValue}`;

            totalBalance = totalBalance - amount
            balance.innerHTML = `$${totalBalance}`;
        } else if (type.textContent === 'expense') {
            totalExpensesValue = totalExpensesValue - amount;
            totalExpenses.innerHTML = `$${totalExpensesValue}`

            totalBalance = totalIncomeValue - totalExpensesValue;
            balance.innerHTML = `$${totalBalance}`;

        }
        updateChart()

    }
})


// Show/hide notifications
function showNotification(message, type) {
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.className = `notification bg-${type}`;
    hideNotification();
}

function hideNotification() {
    setTimeout(() => {
        notification.classList.add('hidden')
    }, 3000);
}

// Initialization
addBtn.addEventListener('click', function (e) {
    e.preventDefault();
    addTransaction();
    amount.value = '';
    category.value = '';
});

////// !!! Charts !!! ///////
// Select the canvas element
const ctx = document.getElementById('myChart').getContext('2d');

// Create the chart
const myChart = new Chart(ctx, {
    type: 'pie', // Chart type: 'bar', 'line', 'pie', 'doughnut', etc.
    data: {
        labels: ['EXPENSES', 'INCOMES'],
        datasets: [{
            label: 'Transactions',
            data: [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',

            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
function updateChart() {
    myChart.data.datasets[0].data = [totalExpensesValue, totalIncomeValue];
    myChart.update();
}



