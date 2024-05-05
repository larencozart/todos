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

const sortTodos = list => {
  return list.toArray().slice().sort((todoA, todoB) => {
    let isDoneA = todoA.isDone();
    let isDoneB = todoB.isDone();

    if (!isDoneA && isDoneB) {
      return -1;
    } else if (isDoneA && !isDoneB) {
      return 1;
    } else {
      let tilteA = todoA.title;
      let titleB = todoB.title;

      if (tilteA < titleB) return -1;
      else if (tilteA > titleB) return 1;
      else return 0;
    }
  });
}

module.exports= {sortTodos, sortTodoLists};