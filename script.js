let budget = 0;
let totalSpent = 0;
let currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식의 날짜

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        height: 'auto'
    });
    calendar.render();

    loadShoppingList();
    loadHistory();
});

function setBudget() {
    var budgetInput = document.getElementById("budgetInput");
    var budgetValue = parseFloat(budgetInput.value.trim().replace(/,/g, ''));
    
    if (!isNaN(budgetValue) && budgetValue > 0) {
        budget = budgetValue;
        document.getElementById("budgetStatus").textContent = "예산: ₩" + budget.toLocaleString('en-US');
        updateRemainingBudget();
        saveShoppingList();
    } else {
        alert("유효한 예산을 입력하세요!");
    }
}

function addItem() {
    var itemNameInput = document.getElementById("itemNameInput");
    var itemName = itemNameInput.value.trim();

    if (itemName !== "") {
        var itemList = document.getElementById("itemList");
        var li = document.createElement("li");

        var itemText = document.createElement("span");
        itemText.textContent = itemName;
        itemText.className = "itemText";

        var deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.className = "deleteButton";
        deleteButton.onclick = function() {
            var deleteConfirmation = prompt("'" + itemName + "'의 가격을 입력하세요.");
            if (deleteConfirmation !== null) {
                var deletePrice = parseFloat(deleteConfirmation.trim().replace(/,/g, ''));
                if (!isNaN(deletePrice) && deletePrice > 0) {
                    deleteItem(li, deletePrice);
                } else {
                    alert("유효한 가격을 입력하세요!");
                }
            }
        };

        li.appendChild(itemText);
        li.appendChild(deleteButton);
        itemList.appendChild(li);
        itemNameInput.value = "";
        saveShoppingList();
    } else {
        alert("유효한 항목을 입력하세요!");
    }
}

function deleteItem(item, price) {
    item.parentNode.removeChild(item);
    updateTotal(price);
    saveShoppingList();
}

function updateTotal(price) {
    var deletedAmount = parseFloat(price);
    if (!isNaN(deletedAmount) && deletedAmount > 0) {
        totalSpent += deletedAmount;
        var totalAmountDiv = document.getElementById("totalAmount");
        totalAmountDiv.textContent = "오늘 구매한 총 금액: ₩" + totalSpent.toLocaleString('en-US');
        updateRemainingBudget();
        saveShoppingList();

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        var yyyy = today.getFullYear();
        var currentDate = yyyy + '/' + mm + '/' + dd;
        var dateDiv = document.getElementById("date");
        dateDiv.textContent = "실행 날짜: " + currentDate;
    } else {
        alert("유효한 가격을 입력하세요!");
    }
}

function updateRemainingBudget() {
    var remainingBudget = budget - totalSpent;
    var remainingBudgetDiv = document.getElementById("remainingBudget");
    remainingBudgetDiv.textContent = "잔액: ₩" + remainingBudget.toLocaleString('en-US');

    if (remainingBudget < 0) {
        remainingBudgetDiv.style.color = "red";
    } else {
        remainingBudgetDiv.style.color = "black";
    }
}

function formatCurrency(input) {
    // 입력값에서 숫자만 남기기
    let value = input.value.replace(/[^0-9]/g, '');
    if (value === '') return;

    // 천 단위 콤마 추가
    value = parseInt(value, 10).toLocaleString('ko-KR');

    // 값 갱신
    input.value = value;
}

function saveShoppingList() {
    const items = [];
    document.querySelectorAll('#itemList li').forEach(li => {
        items.push(li.querySelector('span').textContent);
    });
    const shoppingData = {
        budget,
        totalSpent,
        items
    };
    localStorage.setItem(currentDate, JSON.stringify(shoppingData));
    loadHistory();
}

function loadShoppingList() {
    const savedData = JSON.parse(localStorage.getItem(currentDate));
    if (savedData) {
        budget = savedData.budget;
        totalSpent = savedData.totalSpent;
        document.getElementById("budgetStatus").textContent = "예산: ₩" + budget.toLocaleString('en-US');
        document.getElementById("totalAmount").textContent = "오늘 구매한 총 금액: ₩" + totalSpent.toLocaleString('en-US');
        updateRemainingBudget();
        const itemList = document.getElementById("itemList");
        itemList.innerHTML = '';
        savedData.items.forEach(itemText => {
            const li = document.createElement("li");
            const itemSpan = document.createElement("span");
            itemSpan.textContent = itemText;
            itemSpan.className = "itemText";
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "삭제";
            deleteButton.className = "deleteButton";
            deleteButton.onclick = function() {
                var deleteConfirmation = prompt("'" + itemText + "'의 가격을 입력하세요.");
                if (deleteConfirmation !== null) {
                    var deletePrice = parseFloat(deleteConfirmation.trim().replace(/,/g, ''));
                    if (!isNaN(deletePrice) && deletePrice > 0) {
                        deleteItem(li, deletePrice);
                    } else {
                        alert("유효한 가격을 입력하세요!");
                    }
                }
            };
            li.appendChild(itemSpan);
            li.appendChild(deleteButton);
            itemList.appendChild(li);
        });
    }
}

function loadHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = '';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const data = JSON.parse(localStorage.getItem(key));
        const li = document.createElement("li");
        li.textContent = `${key} - 총 금액: ₩${data.totalSpent.toLocaleString('en-US')}`;
        historyList.appendChild(li);
    }
}
