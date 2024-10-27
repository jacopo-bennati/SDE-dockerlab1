db = db.getSiblingDB("todolist"); // Select the todolist database
db.createUser({
  user: "user", // Username
  pwd: "password", // Password
  roles: [
    {
      role: "readWrite", // Read and write access to the database
      db: "todolist", // Which database the user has access to
    },
  ],
});
