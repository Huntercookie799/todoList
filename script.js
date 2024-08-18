document.addEventListener("DOMContentLoaded", () => {
    const todoForm = document.getElementById("todo-form");
    const todoInput = document.getElementById("todo-input");
    const todoList = document.getElementById("todo-list");

    // Cargar tareas desde localStorage
    const todos = JSON.parse(localStorage.getItem("todos")) || [];

    // Renderizar tareas al cargar la página
    todos.forEach(todo => addTodoToDOM(todo));

    // Añadir una tarea
    todoForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const todoText = todoInput.value.trim();
        if (todoText) {
            const todo = {
                id: Date.now(),
                text: todoText,
            };
            todos.push(todo);
            addTodoToDOM(todo);
            saveTodos();
            todoInput.value = "";
        }
    });

    // Eliminar una tarea
    todoList.addEventListener("click", (event) => {
        if (event.target.tagName === "BUTTON") {
            const id = parseInt(event.target.parentElement.getAttribute("data-id"));
            const todoIndex = todos.findIndex(todo => todo.id === id);
            todos.splice(todoIndex, 1);
            saveTodos();
            event.target.parentElement.remove();
        }
    });

    // Guardar tareas en localStorage
    function saveTodos() {
        localStorage.setItem("todos", JSON.stringify(todos));
    }

    // Añadir tarea al DOM
    function addTodoToDOM(todo) {
        const li = document.createElement("li");
        li.setAttribute("data-id", todo.id);
        li.textContent = todo.text;
        const button = document.createElement("button");
        button.textContent = "Eliminar";
        li.appendChild(button);
        todoList.appendChild(li);
    }
});
