import express from "express";
import { connect, model, Schema } from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises"; // Per gestire i file in modo asincrono

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const mongoUser = process.env.MONGO_DB_USERNAME;
const mongoPwd = process.env.MONGO_DB_PWD;
const mongoHost = process.env.MONGO_DB_HOST || "localhost"; // 'localhost' per evitare crash se mongo non è definito
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

// Modello Mongoose per i Todo
const todoSchema = new Schema({
  text: String,
  completed: Boolean,
});
const Todo = model("Todo", todoSchema);

// Struttura dati locale per i todo (se MongoDB non è disponibile)
let localTodos = [];

// Funzione per salvare i dati in un file locale (se MongoDB non è configurato)
const saveLocalTodosToFile = async () => {
  try {
    await fs.writeFile("todos.json", JSON.stringify(localTodos, null, 2));
  } catch (err) {
    console.error("Errore nel salvataggio dei todo locali:", err);
  }
};

// Funzione per caricare i dati dal file locale all'avvio del server
const loadLocalTodosFromFile = async () => {
  try {
    const data = await fs.readFile("todos.json", "utf-8");
    localTodos = JSON.parse(data);
  } catch (err) {
    console.error("Errore nel caricamento dei todo locali:", err);
  }
};

// Connessione a MongoDB
let isMongoConnected = false;
if (mongoUser && mongoPwd) {
  const mongoUri = `mongodb://${mongoUser}:${mongoPwd}@${mongoHost}:${mongoPort}/${mongoDatabase}`;
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  connect(mongoUri, mongoOptions)
    .then(() => {
      console.log("Connesso a MongoDB");
      isMongoConnected = true;
    })
    .catch((err) => {
      console.error("Errore di connessione a MongoDB:", err);
      isMongoConnected = false;
    });
} else {
  console.log("MongoDB non configurato, utilizzo dati locali.");
  await loadLocalTodosFromFile(); // Carica i dati locali all'avvio
}

// Per servire i file statici nella cartella 'app'
app.use(express.static(__dirname));

// Servire la pagina index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/mongo", (req, res) => {
  res.json({ isMongoConnected });
});

// Recupera i todo (MongoDB o locale)
app.get("/api/todos", async (req, res) => {
  if (isMongoConnected) {
    try {
      const todos = await Todo.find();
      res.json(todos);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Errore nel recupero dei todo da MongoDB" });
    }
  } else {
    res.json(localTodos);
  }
});

// Aggiungi un nuovo todo (MongoDB o locale)
app.post("/api/todos", async (req, res) => {
  const { text } = req.body;
  const newTodo = { text, completed: false };

  if (isMongoConnected) {
    try {
      const todo = new Todo(newTodo);
      await todo.save();
      res.json(todo);
    } catch (err) {
      res
        .status(500)
        .json({ error: "Errore nel salvataggio del todo in MongoDB" });
    }
  } else {
    localTodos.push(newTodo);
    await saveLocalTodosToFile(); // Salva il nuovo todo nel file locale
    res.json(newTodo);
  }
});

// Modifica lo stato (completato/incompletato) di un todo (MongoDB o locale)
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
      res
        .status(500)
        .json({ error: "Errore nel modificare il todo in MongoDB" });
    }
  } else {
    const todo = localTodos.find(
      (todo, index) => index === parseInt(req.params.id)
    );
    if (todo) {
      todo.completed = completed;
      await saveLocalTodosToFile(); // Salva la modifica nel file locale
      res.json(todo);
    } else {
      res.status(404).json({ error: "Todo non trovato" });
    }
  }
});

// Elimina un todo (MongoDB o locale)
app.delete("/api/todos/:id", async (req, res) => {
  if (isMongoConnected) {
    try {
      await Todo.findByIdAndDelete(req.params.id);
      res.json({ message: "Todo eliminato con successo" });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Errore nell'eliminazione del todo da MongoDB" });
    }
  } else {
    const todoIndex = localTodos.findIndex(
      (todo, index) => index === parseInt(req.params.id)
    );
    if (todoIndex >= 0) {
      localTodos.splice(todoIndex, 1);
      await saveLocalTodosToFile(); // Salva la modifica nel file locale
      res.json({ message: "Todo eliminato con successo" });
    } else {
      res.status(404).json({ error: "Todo non trovato" });
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
  console.log(`Apri http://localhost:${port} nel tuo browser`);
});
