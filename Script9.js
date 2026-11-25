/* Simple TODO app - React (no build step, deployable as static files) */
const { useState, useEffect } = React;
const html = htm.bind(React.createElement);

const STORAGE_KEY = "simple_todo_react_app";
const defaultTodos = [
  { id: 1, text: "Learn React component structure", completed: true },
  { id: 2, text: "Build simple TODO application", completed: false },
  { id: 3, text: "Deploy live to GitHub Pages", completed: false },
];

const Svg = ({ children, size = 18 }) => html`<svg width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">${children}</svg>`;
const CheckSquare = () => html`<${Svg} size=${30}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><//>`;
const Plus = () => html`<${Svg}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/><//>`;
const Trash = () => html`<${Svg} size=${16}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><//>`;
const Tick = () => html`<${Svg} size=${14}><polyline points="20 6 9 17 4 12"/><//>`;

function TodoHeader({ totalTasks, completedTasks }) {
  return html`
    <header className="header">
      <h1><span className="head-icon"><${CheckSquare} /></span>My Tasks</h1>
      <p>${totalTasks === 0 ? "No tasks yet" : `${completedTasks} of ${totalTasks} tasks completed`}</p>
    </header>`;
}

function TodoInput({ onAddTask }) {
  const [text, setText] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAddTask(t);
    setText("");
  };
  return html`
    <form className="add-form" onSubmit=${submit}>
      <input value=${text} onChange=${(e) => setText(e.target.value)} placeholder="What needs to be done?" aria-label="New task" maxLength="120" />
      <button type="submit" disabled=${!text.trim()}><${Plus} /> Add</button>
    </form>`;
}

function TodoFilter({ filter, setFilter, counts, onClearCompleted }) {
  return html`
    <div className="filters">
      <div className="pills" role="group" aria-label="Filter tasks">
        ${["all", "active", "completed"].map((f) => html`
          <button key=${f} className=${filter === f ? "pill on" : "pill"} aria-pressed=${filter === f} onClick=${() => setFilter(f)}>
            ${f[0].toUpperCase() + f.slice(1)} <span className="count">${counts[f]}</span>
          </button>`)}
      </div>
      <button className="clear" onClick=${onClearCompleted} disabled=${counts.completed === 0}>Clear Completed</button>
    </div>`;
}

function TodoItem({ todo, onToggle, onDelete }) {
  return html`
    <li className=${todo.completed ? "item done" : "item"}>
      <label className="check">
        <input type="checkbox" checked=${todo.completed} onChange=${() => onToggle(todo.id)} aria-label=${"Mark complete: " + todo.text} />
        <span className="box"><${Tick} /></span>
        <span className="text">${todo.text}</span>
      </label>
      <button className="del" onClick=${() => onDelete(todo.id)} aria-label=${"Delete task: " + todo.text}><${Trash} /></button>
    </li>`;
}

function TodoList({ todos, onToggleTodo, onDeleteTodo, filter }) {
  if (todos.length === 0) {
    const msg = { all: "No tasks yet. Add your first task above.", active: "Nothing left to do. Nice work!", completed: "No completed tasks yet." }[filter];
    return html`<p className="empty">${msg}</p>`;
  }
  return html`<ul className="list">${todos.map((t) => html`<${TodoItem} key=${t.id} todo=${t} onToggle=${onToggleTodo} onDelete=${onDeleteTodo} />`)}</ul>`;
}

function App() {
  const [todos, setTodos] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultTodos; } catch { return defaultTodos; }
  });
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); } catch {}
  }, [todos]);

  const completed = todos.filter((t) => t.completed).length;
  const filtered = todos.filter((t) => (filter === "active" ? !t.completed : filter === "completed" ? t.completed : true));

  return html`
    <div className="app-container">
      <div className="todo-card">
        <${TodoHeader} totalTasks=${todos.length} completedTasks=${completed} />
        <${TodoInput} onAddTask=${(text) => setTodos([{ id: Date.now(), text, completed: false }, ...todos])} />
        <${TodoFilter} filter=${filter} setFilter=${setFilter}
          counts=${{ all: todos.length, active: todos.length - completed, completed }}
          onClearCompleted=${() => setTodos(todos.filter((t) => !t.completed))} />
        <${TodoList} todos=${filtered} filter=${filter}
          onToggleTodo=${(id) => setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))}
          onDeleteTodo=${(id) => setTodos(todos.filter((t) => t.id !== id))} />
      </div>
      <footer className="app-footer"><p>Simple TODO App • Built with React • Ready for GitHub Pages</p></footer>
    </div>`;
}

ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
