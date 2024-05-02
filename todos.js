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


const sortTodoLists = lists => {
  return lists.slice().sort((todoListA, todoListB) => {
    let isDoneA = todoListA.isDone();
    let isDoneB = todoListB.isDone();

    if (!isDoneA && isDoneB) {
      return -1;
    } else if (isDoneA && !isDoneB) {
      return 1;
    } else {
      let titleA = todoListA.title.toLowerCase();
      let titleB = todoListB.title.toLowerCase();

      if (titleA < titleB) return -1;
      else if (titleA > titleB) return 1;
      else return 0;
    }
  });
};

app.get("/", (req, res) => {
  res.render("lists", {
    todoLists: sortTodoLists(todoLists)
  });
});

app.listen(port, host, () => {
  console.log(`Todos listening on ${port} ${host}...`);
});