/*
First, create a minimal Express program configured
 to use Pug with logging by morgan. It displays a simple
  page from the lists.pug view template:
*/

const express = require("express");
const morgan = require("morgan");

const app = express();
const host = "localhost";
const port = 3000;

let todoLists = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("lists", {
    todoLists: sortTodoList(todoLists)
  });
});

app.listen(port, host, () => {
  console.log(`Todos listening on ${port} ${host}...`);
});