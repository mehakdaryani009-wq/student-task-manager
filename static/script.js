// Remembers which tab is selected: "pending", "completed" or "all"
let currentStatus = "pending";


// Ask Flask for the tasks, then show them
function loadTasks() {
    fetch("/api/tasks?status=" + currentStatus)
        .then(function (response) {
            return response.json();
        })
        .then(function (tasks) {
            showTasks(tasks);
        });
}


// Build one card on the page for every task
function showTasks(tasks) {
    let list = document.getElementById("task-list");
    list.innerHTML = "";

    if (tasks.length === 0) {
        list.innerHTML = "<p>No tasks here.</p>";
        return;
    }

    let today = new Date().toLocaleDateString("en-CA");

    for (let i = 0; i < tasks.length; i++) {
        let task = tasks[i];

        let card = document.createElement("div");
        card.className = "task";
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onclick = function () {
            toggleTask(task.id, checkbox.checked);
        };

        let info = document.createElement("div");
        info.className = "task-info";

        let title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        let date = document.createElement("div");
        date.className = "task-date";
        date.textContent = "Due " + task.deadline + " ";

        if (task.completed) {
            card.classList.add("done");
        } else if (task.deadline < today) {
            card.classList.add("overdue");
            let label = document.createElement("span");
            label.className = "overdue-label";
            label.textContent = "OVERDUE";
            date.appendChild(label);
        }

        info.appendChild(title);
        info.appendChild(date);
        let deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.onclick = function () {
            deleteTask(task.id);
        };

        card.appendChild(checkbox);
        card.appendChild(info);
        card.appendChild(deleteButton);
        list.appendChild(card);
    }
}

// Mark a task as completed (or not completed)
function toggleTask(id, isDone) {
    fetch("/api/tasks/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: isDone })
    })
        .then(function () {
            loadTasks();
        });
}


// Delete a task
function deleteTask(id) {
    if (!confirm("Delete this task?")) {
        return;
    }
    fetch("/api/tasks/" + id, { method: "DELETE" })
        .then(function () {
            loadTasks();
        });
}

// Switch tabs
function setTab(status, buttonId) {
    currentStatus = status;

    document.getElementById("pending-tab").classList.remove("active-tab");
    document.getElementById("completed-tab").classList.remove("active-tab");
    document.getElementById("all-tab").classList.remove("active-tab");
    document.getElementById(buttonId).classList.add("active-tab");

    loadTasks();
}

document.getElementById("pending-tab").onclick = function () {
    setTab("pending", "pending-tab");
};
document.getElementById("completed-tab").onclick = function () {
    setTab("completed", "completed-tab");
};
document.getElementById("all-tab").onclick = function () {
    setTab("all", "all-tab");
};


// Add a new task
document.getElementById("add-button").onclick = function () {
    let title = document.getElementById("title").value;
    let deadline = document.getElementById("deadline").value;

    fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title, deadline: deadline })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.error) {
                document.getElementById("message").textContent = data.error;
            } else {
                document.getElementById("message").textContent = "";
                document.getElementById("title").value = "";
                document.getElementById("deadline").value = "";
                setTab("pending", "pending-tab");
            }
        });
};


// When the page opens, show the pending tasks
setTab("pending", "pending-tab");