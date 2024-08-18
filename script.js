document.addEventListener("DOMContentLoaded", () => {
    const formularioTareas = document.getElementById("todo-form");
    const entradaTarea = document.getElementById("todo-input");
    const listaTareas = document.getElementById("todo-list");

    const tareas = JSON.parse(localStorage.getItem("tareas")) || [];

    tareas.forEach(tarea => agregarTareaAlDOM(tarea));

    formularioTareas.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const textoTarea = entradaTarea.value.trim();
        if (textoTarea) {
            const tarea = {
                id: Date.now(),
                texto: textoTarea,
                idGrupo: null
            };
            tareas.push(tarea);
            agregarTareaAlDOM(tarea);
            guardarTareas();
            entradaTarea.value = "";
        }
    });

    listaTareas.addEventListener("click", (evento) => {
        if (evento.target.classList.contains("delete-btn")) {
            eliminarTarea(evento.target);
        } else if (evento.target.classList.contains("group-title")) {
            manejarEdicionGrupo(evento.target);
        }
    });

    listaTareas.addEventListener("dragstart", manejarArrastreInicio);
    listaTareas.addEventListener("dragover", manejarArrastreSobre);
    listaTareas.addEventListener("drop", manejarCaida);
    listaTareas.addEventListener("dragend", manejarArrastreFin);

    function guardarTareas() {
        localStorage.setItem("tareas", JSON.stringify(tareas));
    }

    function agregarTareaAlDOM(tarea) {
        let elementoGrupo;
        if (tarea.idGrupo !== null) {
            elementoGrupo = document.querySelector(`[data-group-id='${tarea.idGrupo}']`);
        } else {
            elementoGrupo = null;
        }

        if (!elementoGrupo && tarea.idGrupo !== null) {
            elementoGrupo = crearGrupo(tarea.idGrupo);
            listaTareas.appendChild(elementoGrupo);
        }

        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.setAttribute("data-id", tarea.id);
        li.setAttribute("draggable", "true");
        li.innerHTML = `
            <span>${tarea.texto}</span>
            <button class="btn btn-danger delete-btn">Eliminar</button>
        `;

        if (elementoGrupo) {
            elementoGrupo.querySelector(".list-group").appendChild(li);
        } else {
            listaTareas.appendChild(li);
        }
    }

    function crearGrupo(idGrupo) {
        const grupo = document.createElement("div");
        grupo.classList.add("group");
        grupo.setAttribute("data-group-id", idGrupo);
        grupo.innerHTML = `
            <div class="group-title">Nuevo Grupo</div>
            <ul class="list-group"></ul>
        `;
        return grupo;
    }

    function eliminarTarea(botonEliminar) {
        const id = parseInt(botonEliminar.parentElement.getAttribute("data-id"));
        const indexTarea = tareas.findIndex(tarea => tarea.id === id);
        tareas.splice(indexTarea, 1);
        guardarTareas();
        botonEliminar.parentElement.remove();
        eliminarGruposVacios();
    }

    function manejarEdicionGrupo(tituloGrupo) {
        if (tituloGrupo.classList.contains("editing")) {
            terminarEdicionGrupo(tituloGrupo);
        } else {
            iniciarEdicionGrupo(tituloGrupo);
        }
    }

    function iniciarEdicionGrupo(tituloGrupo) {
        tituloGrupo.classList.add("editing");
        const tituloActual = tituloGrupo.innerText;
        tituloGrupo.innerText = "";
        const input = document.createElement("input");
        input.type = "text";
        input.value = tituloActual;
        tituloGrupo.appendChild(input);
        input.focus();

        input.addEventListener("blur", () => terminarEdicionGrupo(tituloGrupo, input));
        input.addEventListener("keypress", (evento) => {
            if (evento.key === "Enter") {
                input.blur();
            }
        });
    }

    function terminarEdicionGrupo(tituloGrupo, input = null) {
        tituloGrupo.classList.remove("editing");
        const nuevoTitulo = input ? input.value : tituloGrupo.innerText.trim();
        if (nuevoTitulo) {
            tituloGrupo.innerText = nuevoTitulo;
            const idGrupo = tituloGrupo.parentElement.getAttribute("data-group-id");
            const tareasGrupo = tareas.filter(tarea => tarea.idGrupo === parseInt(idGrupo));
            tareasGrupo.forEach(tarea => {
                tarea.nombreGrupo = nuevoTitulo;
            });
            guardarTareas();
        }
    }

    function manejarArrastreInicio(evento) {
        arrastrado = evento.target;
        grupoOriginal = evento.target.closest('.group');
        setTimeout(() => {
            evento.target.classList.add('dragging');
        }, 0);
    }

    function manejarArrastreSobre(evento) {
        evento.preventDefault();
        const despuesElemento = obtenerElementoArrastreDespues(evento.clientY);
        const draggable = document.querySelector('.dragging');
        if (despuesElemento == null) {
            evento.target.parentElement.querySelector(".list-group").appendChild(draggable);
        } else {
            evento.target.parentElement.querySelector(".list-group").insertBefore(draggable, despuesElemento);
        }
    }

    function manejarCaida(evento) {
        evento.preventDefault();
        this.classList.remove('dragging');
        guardarNuevaOrden();
        eliminarGruposVacios();
    }

    function manejarArrastreFin() {
        this.classList.remove('dragging');
        arrastrado = null;
        grupoOriginal = null;
    }

    function obtenerElementoArrastreDespues(y) {
        const elementosDraggable = [...listaTareas.querySelectorAll('.list-group-item:not(.dragging)')];
        return elementosDraggable.reduce((cercano, hijo) => {
            const caja = hijo.getBoundingClientRect();
            const offset = y - caja.top - caja.height / 2;
            if (offset < 0 && offset > cercano.offset) {
                return { offset: offset, element: hijo };
            } else {
                return cercano;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function guardarNuevaOrden() {
        const tareasActualizadas = [...listaTareas.querySelectorAll('.list-group-item')].map(item => {
            const id = parseInt(item.getAttribute('data-id'));
            const idGrupo = item.closest('.group').getAttribute('data-group-id');
            return tareas.find(tarea => tarea.id === id);
        });

        tareas.length = 0;
        tareasActualizadas.forEach(tarea => tareas.push(tarea));
        guardarTareas();
    }

    function eliminarGruposVacios() {
        document.querySelectorAll('.group').forEach(grupo => {
            if (grupo.querySelectorAll('.list-group-item').length === 0) {
                grupo.remove();
            }
        });
    }
});
