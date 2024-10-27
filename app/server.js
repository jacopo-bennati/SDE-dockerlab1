import express from "express";
import { connect, model, Schema } from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const mongoUser = process.env.MONGO_DB_USERNAME;
const mongoPwd = process.env.MONGO_DB_PWD;
const mongoHost = process.env.MONGO_DB_HOST || "localhost";
const mongoPort = process.env.MONGO_DB_PORT || "27017";
const mongoDatabase = process.env.MONGO_DB_NAME || "todolist";

console.log(
  "env variables",
  mongoUser,
  mongoPwd,
  mongoHost,
  mongoPort,
  mongoDatabase
);

// Mongoose schema for the todo collection
const todoSchema = new Schema({
  text: String,
  completed: Boolean,
});
const Todo = model("Todo", todoSchema);

// Local data structure for todos (if MongoDB is not available)
let localTodos = [];

// Save the local todos to a file (if MongoDB is not configured)
const saveLocalTodosToFile = async () => {
  try {
    await fs.writeFile("todos.json", JSON.stringify(localTodos, null, 2));
  } catch (err) {
    console.error("Error saving local todos:", err);
  }
};

// Load the local todos from a file (if MongoDB is not configured)
const loadLocalTodosFromFile = async () => {
  try {
    const data = await fs.readFile("todos.json", "utf-8");
    localTodos = JSON.parse(data);
  } catch (err) {
    console.error("Error loading local todos:", err);
  }
};

// Connect to MongoDB
let isMongoConnected = false;
if (mongoUser && mongoPwd) {
  const mongoUri = `mongodb://${mongoUser}:${mongoPwd}@${mongoHost}:${mongoPort}/${mongoDatabase}`;
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  connect(mongoUri, mongoOptions)
    .then(() => {
      console.log("Connected to MongoDB");
      isMongoConnected = true;
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
      isMongoConnected = false;
    });
} else {
  console.log("MongoDB not configured, using local data.");
  await loadLocalTodosFromFile(); // Load local todos from file
}

// Serve the static files in the 'app' folder
app.use(express.static(__dirname));

// Serve the index.html page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Endpoint to check if MongoDB is connected
app.get("/api/mongo", (req, res) => {
  res.json({ isMongoConnected });
});

// Endpoint to get all todos (MongoDB or local)
app.get("/api/todos", async (req, res) => {
  if (isMongoConnected) {
    try {
      const todos = await Todo.find();
      res.json(todos);
    } catch (err) {
      res.status(500).json({ error: "Error retrieving todos from MongoDB" });
    }
  } else {
    res.json(localTodos);
  }
});

// Endpoint to add a new todo (MongoDB or local)
app.post("/api/todos", async (req, res) => {
  const { text } = req.body;
  const newTodo = { text, completed: false };

  if (isMongoConnected) {
    try {
      const todo = new Todo(newTodo);
      await todo.save();
      res.json(todo);
    } catch (err) {
      res.status(500).json({ error: "Error saving todo to MongoDB" });
    }
  } else {
    localTodos.push(newTodo);
    await saveLocalTodosToFile(); // Save the new todo to the local file
    res.json(newTodo);
  }
});

// Endpoint to update a todo to mark it as completed or not (MongoDB or local)
app.put("/api/todos/:id", async (req, res) => {
  const { completed } = req.body;

  if (isMongoConnected) {
    try {
      const todo = await Todo.findByIdAndUpdate(
        req.params.id,
        { completed },
        { new: true }
      );
      res.json(todo);
    } catch (err) {
      res.status(500).json({ error: "Error updating todo in MongoDB" });
    }
  } else {
    const todo = localTodos.find(
      (todo, index) => index === parseInt(req.params.id)
    );
    if (todo) {
      todo.completed = completed;
      await saveLocalTodosToFile(); // Save the update to the local file
      res.json(todo);
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  }
});

// Endpoint to delete a todo (MongoDB or local)
app.delete("/api/todos/:id", async (req, res) => {
  if (isMongoConnected) {
    try {
      await Todo.findByIdAndDelete(req.params.id);
      res.json({ message: "Todo successfully deleted" });
    } catch (err) {
      res.status(500).json({ error: "Error deleting todo from MongoDB" });
    }
  } else {
    const todoIndex = localTodos.findIndex(
      (todo, index) => index === parseInt(req.params.id)
    );
    if (todoIndex >= 0) {
      localTodos.splice(todoIndex, 1);
      await saveLocalTodosToFile(); // Save the update to the local file
      res.json({ message: "Todo successfully deleted" });
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  }
});

const port = process.env.PORT || 3000;
const host_port = process.env.HOST_PORT || 3000;
app.listen(port, () => {
  console.log(
    `Server running on port ${port} internally, type ctrl+c to stop the server`
  );
  console.log(
    `Server running on http://localhost:${host_port}, click the link to open the app on your browser`
  );
});
