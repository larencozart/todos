/*
First, create a minimal Express program configured
 to use Pug with logging by morgan. It displays a simple
  page from the lists.pug view template:
*/

const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const TodoList = require("./lib/todolist");
const Todo = require("./lib/todo");
const {sortTodoLists, sortTodos} = require("./lib/sort");
const {body, validationResult} = require("express-validator");

const app = express();
const host = "localhost";
const port = 3000;

let todoLists = require("./lib/seed-data");

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure"
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});


app.get("/", (req, res) => {
  res.redirect("/lists");
});

app.get("/lists", (req, res) => {
  res.render("lists", {
    todoLists: sortTodoLists(todoLists)
  });
});

app.get("/lists/new", (req, res) => {
  res.render("new-list");
});

app.post("/lists",
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The list title is required.")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
      .custom(title => {
        let duplicate = todoLists.find(list => list.title === title);
        return duplicate === undefined;
      })
      .withMessage("List title must be unique."),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      res.render("new-list", {
        flash: req.flash(),
        todoListTitle: req.body.todoListTitle,
      });
    } else {
      todoLists.push(new TodoList(req.body.todoListTitle));
      req.flash("success", "The todo list has been created.");
      res.redirect("/lists");
    }
  }
);

// pull out todolist finder function, LS uses loadTodoList
app.get("/lists/:todoListId", (req, res) => {
  const id = req.params.todoListId
  const todoList = todoLists.find(todoList => todoList.id === Number(id));

  if (!todoList) {
    next(new Error("Page Not Found."));
  } else {
    res.render("list", {
      todoList: todoList,
      todos: sortTodos(todoList)
    });
  }
  
});

// pull out function to find todolist and todo... LS does "loadTodo"
app.post("/lists/:todoListId/todos/:todoId/toggle", (req, res, next) => {
  const { todoListId, todoId } = { ...req.params };
  const todoList = todoLists.find(todoList => todoList.id === Number(todoListId));
  const todo = todoList.findById(Number(todoId));

  if (!todo) {
    next(new Error("Not found"));
  } else {
    if (todo.isDone()) {
      todo.markUndone(); 
      req.flash("success", `${todo.title} has been marked as not complete`);
    } else {
      todo.markDone();
      req.flash("success", `${todo.title} has been marked as complete`);
    }

    res.redirect(`/lists/${todoListId}`);
  }
});

app.post("/lists/:todoListId/todos/:todoId/destroy", (req, res, next) => {
  const { todoListId, todoId } = { ...req.params };
  const todoList = todoLists.find(todoList => todoList.id === Number(todoListId));

  if (!todoList) {
    next(new Error("Not found"));
  } else {
    const todo = todoList.findById(Number(todoId));

    if (!todo) {
      next(new Error("Not found"));
    } else {
      todoList.removeAt(todoList.findIndexOf(todo));
      req.flash("success", `${todo.title} deleted from list`);
      res.redirect(`/lists/${todoListId}`);
    }
  }
});

// pull out todoList finder method
app.post("/lists/:todoListId/complete_all", (req, res, next) => {
  const todoListId = req.params.todoListId;
  const todoList = todoLists.find(todoList => todoList.id === Number(todoListId));

  if (!todoList) {
    next(new Error("Not found"));
  } else {
    todoList.markAllDone();
    req.flash("success", `All todos in ${todoList.title} marked as complete`);
    res.redirect(`/lists/${todoListId}`);
  }
});

app.post("/lists/:todoListId/todos", 
  [
    body("todoTitle")
    .trim()
    .isLength({ min: 1 })
    .withMessage("The list title is required.")
    .isLength({ max: 100 })
    .withMessage("List title must be between 1 and 100 characters.")
  ],
  (req, res, next) => {
    const todoListId = req.params.todoListId;
    const todoList = todoLists.find(todoList => todoList.id === Number(todoListId));

    if (!todoList) {
      next(new Error("Not found"));
    } else {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach(message => req.flash("error", message.msg));
        res.render("list", {
          flash: req.flash(),
          todoList: todoList,
          todos: sortTodos(todoList),
          todoTitle: req.body.todoTitle,
        });
      } else {
        const todoTitle = req.body.todoTitle;
        todoList.add(new Todo(todoTitle));
        req.flash("success", `New todo "${todoTitle}" added to ${todoList.title}`);
        res.redirect(`/lists/${todoListId}`);
      }
    }
  }
);


// Error handler - If an error is caught, this gets called
app.use((err, req, res, _next) => {
  console.log(err.message);
  res.status(404).send(err.message);
});

app.listen(port, host, () => {
  console.log(`Todos listening on ${port} ${host}...`);
});