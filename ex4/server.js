
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA = path.join(__dirname, "tasks.json");

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Read tasks from JSON file
function readTasks() {
    try {
        return JSON.parse(fs.readFileSync(DATA, "utf8"));
    } catch (error) {
        return [];
    }
}

// Save tasks into JSON file
function saveTasks(tasks) {
    fs.writeFileSync(DATA, JSON.stringify(tasks, null, 2));
}

// GET: Display all tasks
app.get("/api/tasks", (req, res) => {
    const tasks = readTasks();

    console.log("All tasks requested");
    console.log(tasks);

    res.json(tasks);
});

// POST: Add a new task
app.post("/api/tasks", (req, res) => {
    const { title, assignedTo, priority, deadline } = req.body;

    if (!title || !assignedTo || !deadline) {
        return res.status(400).json({
            error: "Fill all required fields."
        });
    }

    const tasks = readTasks();

    const task = {
        id: Date.now().toString(),
        title: title.trim(),
        assignedTo: assignedTo.trim(),
        priority: priority || "Medium",
        deadline: deadline,
        status: "Pending"
    };

    // Display frontend information in backend terminal
    console.log("\n========== NEW TASK RECEIVED ==========");
    console.log("Task ID:", task.id);
    console.log("Title:", task.title);
    console.log("Assigned To:", task.assignedTo);
    console.log("Priority:", task.priority);
    console.log("Deadline:", task.deadline);
    console.log("Status:", task.status);
    console.log("=======================================\n");

    tasks.push(task);
    saveTasks(tasks);

    res.status(201).json({
        message: "Task added successfully!",
        task: task
    });
});

// PUT: Update task status
app.put("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();

    const index = tasks.findIndex(
        task => task.id === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({
            error: "Task not found."
        });
    }

    const { status } = req.body;

    if (
        status &&
        !["Pending", "In Progress", "Completed"].includes(status)
    ) {
        return res.status(400).json({
            error: "Invalid status."
        });
    }

    tasks[index] = {
        ...tasks[index],
        ...req.body
    };

    saveTasks(tasks);

    console.log("\n========== TASK UPDATED ==========");
    console.log("Task ID:", tasks[index].id);
    console.log("Title:", tasks[index].title);
    console.log("New Status:", tasks[index].status);
    console.log("==================================\n");

    res.json({
        message: "Task updated successfully!",
        task: tasks[index]
    });
});

// DELETE: Delete a task
app.delete("/api/tasks/:id", (req, res) => {
    const tasks = readTasks();

    const updatedTasks = tasks.filter(
        task => task.id !== req.params.id
    );

    if (updatedTasks.length === tasks.length) {
        return res.status(404).json({
            error: "Task not found."
        });
    }

    saveTasks(updatedTasks);

    console.log("Task deleted. ID:", req.params.id);

    res.json({
        message: "Task deleted successfully."
    });
});

// Start server
app.listen(PORT, () => {
    console.log("================================");
    console.log("Task Management Server Started");
    console.log(`Open http://localhost:${PORT}`);
    console.log("================================");
});
