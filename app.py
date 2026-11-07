import json
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

FILE_NAME = "tasks.json"


# ---------- Helper functions to read and write the file ----------
def load_tasks():
    try:
        with open(FILE_NAME, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []


def save_tasks(tasks):
    with open(FILE_NAME, "w") as file:
        json.dump(tasks, file)


# ---------- Show the web page ----------
@app.route("/")
def home():
    return render_template("index.html")


# ---------- 1. View tasks ----------
@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    status = request.args.get("status", "all")
    tasks = load_tasks()
    result = []
    for task in tasks:
        if status == "pending" and task["completed"]:
            continue
        if status == "completed" and not task["completed"]:
            continue
        result.append(task)
    return jsonify(result)


# ---------- 2. Add a task ----------
@app.route("/api/tasks", methods=["POST"])
def add_task():
    data = request.get_json()
    title = data.get("title", "").strip()
    deadline = data.get("deadline", "")

    if title == "":
        return jsonify(error="Title is required."), 400
    if deadline == "":
        return jsonify(error="Deadline is required."), 400

    tasks = load_tasks()

    new_id = 1
    if len(tasks) > 0:
        new_id = tasks[-1]["id"] + 1

    task = {
        "id": new_id,
        "title": title,
        "deadline": deadline,
        "completed": False,
    }
    tasks.append(task)
    save_tasks(tasks)
    return jsonify(task), 201


# ---------- 3. Mark a task as completed ----------
@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = data.get("completed", False)
            save_tasks(tasks)
            return jsonify(task)
    return jsonify(error="Task not found."), 404


# ---------- 4. Delete a task ----------
@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            tasks.remove(task)
            save_tasks(tasks)
            return jsonify(message="Task deleted.")
    return jsonify(error="Task not found."), 404


if __name__ == "__main__":
    app.run(debug=True)