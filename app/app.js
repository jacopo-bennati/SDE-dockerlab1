// Description: Main script for the todo app

const apiUrl = "/api/todos"; // URL of the API

let isFirstLoad = true;

// Function to show the loading modal
function showLoaderModal(show) {
  const loaderModal = document.getElementById("loaderModal");
  loaderModal.style.display = show ? "flex" : "none";
}

// Function to show the placeholder when there are no more todos
function showPlaceholder(show) {
  const placeholder = document.getElementById("placeholder");
  placeholder.style.display = show ? "block" : "none";
}

// Function to fetch and display the todos
async function getTodos() {
  if (isFirstLoad) showLoaderModal(true);

  const response = await fetch(apiUrl);
  const todos = await response.json();

  const todoList = document.getElementById("todoList");
  const completedList = document.getElementById("completedList");

  todoList.innerHTML = "";
  completedList.innerHTML = "";

  let todoCount = 0;
  let completedCount = 0;

  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className =
      "flex justify-between items-center bg-gray-100 p-3 rounded shadow hover:shadow-lg transition-shadow";
    li.setAttribute("data-id", todo._id || index); // Identifier for reordering

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

    // Add the todo to the appropriate list
    if (todo.completed) {
      completedList.appendChild(li);
      completedCount++;
    } else {
      todoList.appendChild(li);
      todoCount++;
    }
  });

  // Show placeholder if there are no todos
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

// Function to add a new todo
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
    document.getElementById("newTodo").focus(); // Focus on input again
    getTodos(); // Reload the list and animate the addition
  }
}

// Function to delete a todo
async function deleteTodo(id) {
  await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
  getTodos(); // Reload the list and animate the deletion
}

// Function to complete/uncomplete a todo
async function toggleComplete(id, completed) {
  await fetch(`${apiUrl}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: !completed }),
  });
  getTodos(); // Reload the list and animate the completion/uncompletion
}

// Function to handle todo reordering
function reorderTodos(oldIndex, newIndex) {
  // Not implemented in this version
  console.log(`Riordinato: ${oldIndex} -> ${newIndex}`);
}

// Load the todos on page load
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

// Check if MongoDB is connected
getDBState();
