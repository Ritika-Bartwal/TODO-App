const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Models
const TodoTask = require("./models/TodoTask");

dotenv.config();

// Middleware
app.use("/static", express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to DB!");
        app.listen(3000, () => console.log("Server running on port 3000"));
    })
    .catch((err) => console.error("Error connecting to MongoDB:", err));

app.set("view engine", "ejs");

// GET METHOD (Updated to async/await)
app.get("/", async (req, res) => {
    try {
        const tasks = await TodoTask.find({});
        res.render("todo.ejs", { todoTasks: tasks });
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).send("Internal Server Error");
    }
});

// POST METHOD (Create a new task)
app.post("/", async (req, res) => {
    const todoTask = new TodoTask({ content: req.body.content });
    try {
        await todoTask.save();
        res.redirect("/");
    } catch (err) {
        console.error("Error saving task:", err);
        res.status(500).send("Internal Server Error");
    }
});

//  UPDATE METHOD (Edit task)
app.route("/edit/:id")
    .get(async (req, res) => {
        const id = req.params.id;
        try {
            const tasks = await TodoTask.find({});
            res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
        } catch (err) {
            console.error("Error fetching tasks for edit:", err);
            res.status(500).send("Internal Server Error");
        }
    })
    .post(async (req, res) => {
        const id = req.params.id;
        try {
            await TodoTask.findByIdAndUpdate(id, { content: req.body.content });
            res.redirect("/");
        } catch (err) {
            console.error("Error updating task:", err);
            res.status(500).send("Internal Server Error");
        }
    });

// DELETE METHOD (Using findByIdAndDelete instead of findByIdAndRemove)
app.route("/remove/:id").get(async (req, res) => {
    const id = req.params.id;
    try {
        await TodoTask.findByIdAndDelete(id);
        res.redirect("/");
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).send("Internal Server Error");
    }
});
