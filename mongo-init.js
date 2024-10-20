// mongo-init.js
db = db.getSiblingDB("todolist"); // Seleziona il database 'todolist'
db.createUser({
  user: "user", // Nome utente
  pwd: "password", // Password
  roles: [
    {
      role: "readWrite", // Ruolo di lettura e scrittura
      db: "todolist", // Database su cui applicare il ruolo
    },
  ],
});
