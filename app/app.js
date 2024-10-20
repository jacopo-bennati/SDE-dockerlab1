const apiUrl = "/api/todos";

let isFirstLoad = true;

// Funzione per mostrare il modale di caricamento
function showLoaderModal(show) {
  const loaderModal = document.getElementById("loaderModal");
  loaderModal.style.display = show ? "flex" : "none";
}

// Funzione per mostrare il placeholder quando non ci sono più todo
function showPlaceholder(show) {
  const placeholder = document.getElementById("placeholder");
  placeholder.style.display = show ? "block" : "none";
}

// Funzione per recuperare e mostrare i todo
async function getTodos() {
  if (isFirstLoad) showLoaderModal(true);

  const response = await fetch(apiUrl);
  const todos = await response.json();

  const todoList = document.getElementById("todoList");
  const completedList = document.getElementById("completedList");

  todoList.innerHTML = ""; // Svuota la lista dei non completati
  completedList.innerHTML = ""; // Svuota la lista dei completati

  let todoCount = 0;
  let completedCount = 0;

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center bg-gray-100 p-3 rounded shadow hover:shadow-lg transition-shadow"; // Aggiunta classe per nascondere inizialmente
    li.setAttribute("data-id", todo._id || index); // Identificativo per il drag-and-drop

    const todoText = document.createElement("span");
    todoText.textContent = todo.text;
    todoText.className = todo.completed
      ? "line-through text-gray-500"
      : "text-gray-800";

    const buttons = document.createElement("div");

    const toggleButton = document.createElement("button");
    toggleButton.textContent = todo.completed ? "Uncomplete" : "Complete";
    if (!todo.completed)
      toggleButton.className =
        "bg-green-500 text-white p-1 ml-2 rounded shadow-md hover:bg-green-600 transition-colors";
    else
      toggleButton.className =
        "bg-blue-500 text-white p-1 ml-2 rounded shadow-md hover:bg-blue-600 transition-colors";

    toggleButton.onclick = () =>
      toggleComplete(todo._id || index, todo.completed);

    buttons.appendChild(toggleButton);

    if (!todo.completed) {
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.className =
        "bg-red-500 text-white p-1 ml-2 rounded shadow-md hover:bg-red-600 transition-colors";
      deleteButton.onclick = () => deleteTodo(todo._id || index);
      buttons.appendChild(deleteButton);
    }

    li.appendChild(todoText);
    li.appendChild(buttons);

    // Aggiungi l'elemento alla lista
    if (todo.completed) {
      completedList.appendChild(li);
      completedCount++;
    } else {
      todoList.appendChild(li);
      todoCount++;
    }
  });

  // Mostra il placeholder se non ci sono todo
  if (todoCount === 0 && completedCount === 0) {
    showPlaceholder(true);
  } else {
    showPlaceholder(false);
  }

  if (isFirstLoad) {
    isFirstLoad = false;
    showLoaderModal(false);
  }
}

// Funzione per aggiungere un nuovo todo
async function addTodo() {
  const newTodoText = document.getElementById("newTodo").value;

  if (newTodoText) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodoText }),
    });
    const newTodo = await response.json();
    document.getElementById("newTodo").value = ""; // Reset input
    document.getElementById("newTodo").focus(); // Focus sull'input
    getTodos(); // Ricarica la lista con animazione per il nuovo todo
  }
}

// Funzione per eliminare un todo
async function deleteTodo(id) {
  await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
  getTodos(); // Ricarica la lista e anima l'eliminazione
}

// Funzione per completare/incompletare un todo
async function toggleComplete(id, completed) {
  await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !completed }),
  });
  getTodos(); // Ricarica la lista e anima il completamento
}

// Funzione per gestire il riordinamento dei todo
function reorderTodos(oldIndex, newIndex) {
  // Logica per salvare il nuovo ordine lato server, se necessario
  console.log(`Riordinato: ${oldIndex} -> ${newIndex}`);
}

// Carica i todo all'avvio
getTodos();

async function getDBState() {
  const response = await fetch("/api/mongo");
  const data = await response.json();
  const mongoStatus = document.getElementById("mongoStatus");
  if (data.isMongoConnected) {
    mongoStatus.textContent = "Connected to MongoDB";
    mongoStatus.className += " text-green-500";
  } else {
    mongoStatus.textContent = "Not connected to MongoDB";
    mongoStatus.className += " text-red-500";
  }
  console.log(data);
}

getDBState();
