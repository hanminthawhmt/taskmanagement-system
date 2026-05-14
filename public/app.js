let state = {
  tasks: [],
  total: 0,
  page: 1,
  limit: 10,
  search: "",
  status: "",
  priority: "",
  tags: "",
  loading: false,
  error: null,
};


const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");
const tagsFilter = document.getElementById("tags-filter");
const tbody = document.getElementById("task-tbody");
const tableWrap = document.getElementById("table-wrap");
const paginationEl = document.getElementById("pagination");
const statTotal = document.getElementById("stat-total");
const statTodo = document.getElementById("stat-todo");
const statInProgress = document.getElementById("stat-in-progress");
const statDone = document.getElementById("stat-done");
const deleteModal = document.getElementById("delete-modal");
const deleteTaskName = document.getElementById("delete-task-name");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");

let pendingDeleteId = null;

async function loadTasks() {
  state.loading = true;
  state.error = null;
  renderTable();

  try {
    const res = await API.getTasks({
      search: state.search,
      status: state.status,
      priority: state.priority,
      tags: state.tags,
      page: state.page,
      limit: state.limit,
    });

    state.tasks = res.data;
    state.total = res.pagination.total;
  } catch (err) {
    state.error = err.message || "Failed to load tasks";
  } finally {
    state.loading = false;
    renderTable();
    renderPagination();
    renderStats();
  }
}

function renderStats() {
  const tasks = state.tasks;
  statTotal.textContent = state.total;
  statTodo.textContent = tasks.filter((t) => t.status === "todo").length;
  statInProgress.textContent = tasks.filter(
    (t) => t.status === "in_progress",
  ).length;
  statDone.textContent = tasks.filter((t) => t.status === "done").length;
}

function renderTable() {
  if (state.loading) {
    tableWrap.innerHTML = `
      <div class="state-box">
        <div class="spinner"></div>
        <p>Loading tasks…</p>
      </div>`;
    return;
  }

  if (state.error) {
    tableWrap.innerHTML = `
      <div class="state-box">
        <i class="ti ti-alert-circle"></i>
        <p class="state-title">Something went wrong</p>
        <p>${escHtml(state.error)}</p>
        <button class="btn btn-ghost" style="margin-top:16px" onclick="loadTasks()">Try again</button>
      </div>`;
    return;
  }

  if (!state.tasks.length) {
    tableWrap.innerHTML = `
      <div class="state-box">
        <i class="ti ti-clipboard-off"></i>
        <p class="state-title">No tasks found</p>
        <p>Try adjusting your filters or create a new task.</p>
      </div>`;
    return;
  }

  const rows = state.tasks
    .map((task) => {
      const statusBadge = `<span class="badge badge-${task.status}">${formatStatus(task.status)}</span>`;
      const priorityBadge = `<span class="badge badge-${task.priority}">${capitalize(task.priority)}</span>`;
      const tags = (task.tags || [])
        .map((t) => `<span class="tag-pill">${escHtml(t)}</span>`)
        .join("");
      const dueClass = isDueOverdue(task.due_date) ? "overdue" : "";
      const dueDisplay = task.due_date
        ? `<span class="due-date ${dueClass}">${formatDate(task.due_date)}</span>`
        : `<span class="due-date">—</span>`;

      return `
      <tr>
        <td>
          <div class="task-title">${escHtml(task.title)}</div>
          <div class="task-desc">${escHtml(task.description || "")}</div>
        </td>
        <td>${statusBadge}</td>
        <td>${priorityBadge}</td>
        <td>${dueDisplay}</td>
        <td><div class="tags-cell">${tags || '<span style="color:var(--text3);font-size:12px">—</span>'}</div></td>
        <td>
          <div class="row-actions">
            <a href="form.html?id=${task.id}" class="btn btn-ghost btn-sm"><i class="ti ti-edit"></i></a>
            <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${task.id}, '${escAttr(task.title)}')"><i class="ti ti-trash"></i></button>
          </div>
        </td>
      </tr>`;
    })
    .join("");

  tableWrap.innerHTML = `
    <table class="task-table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Due Date</th>
          <th>Tags</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.total / state.limit));
  const from = state.total === 0 ? 0 : (state.page - 1) * state.limit + 1;
  const to = Math.min(state.page * state.limit, state.total);

  let pageButtons = "";
  for (let i = 1; i <= totalPages; i++) {
    const active = i === state.page ? "active" : "";
    pageButtons += `<button class="page-btn ${active}" onclick="goToPage(${i})">${i}</button>`;
  }

  paginationEl.innerHTML = `
    <span class="pagination-info">Showing ${from}–${to} of ${state.total} tasks</span>
    <div class="pagination-btns">
      <button class="page-btn" onclick="goToPage(${state.page - 1})" ${state.page === 1 ? "disabled" : ""}>
        <i class="ti ti-chevron-left"></i>
      </button>
      ${pageButtons}
      <button class="page-btn" onclick="goToPage(${state.page + 1})" ${state.page === totalPages ? "disabled" : ""}>
        <i class="ti ti-chevron-right"></i>
      </button>
    </div>`;
}

function goToPage(p) {
  const totalPages = Math.ceil(state.total / state.limit);
  if (p < 1 || p > totalPages) return;
  state.page = p;
  loadTasks();
}

// ── Delete Modal ──
function openDeleteModal(id, title) {
  pendingDeleteId = id;
  deleteTaskName.textContent = title;
  deleteModal.classList.add("open");
}

function closeDeleteModal() {
  deleteModal.classList.remove("open");
  pendingDeleteId = null;
}

confirmDeleteBtn.addEventListener("click", async () => {
  if (!pendingDeleteId) return;
  confirmDeleteBtn.disabled = true;
  confirmDeleteBtn.textContent = "Deleting…";
  try {
    await API.deleteTask(pendingDeleteId);
    closeDeleteModal();
    showToast("Task deleted", "success");
    loadTasks();
  } catch (err) {
    showToast(err.message || "Delete failed", "error");
  } finally {
    confirmDeleteBtn.disabled = false;
    confirmDeleteBtn.textContent = "Delete";
  }
});

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.search = searchInput.value.trim();
    state.page = 1;
    loadTasks();
  }, 350);
});

statusFilter.addEventListener("change", () => {
  state.status = statusFilter.value;
  state.page = 1;
  loadTasks();
});
priorityFilter.addEventListener("change", () => {
  state.priority = priorityFilter.value;
  state.page = 1;
  loadTasks();
});
tagsFilter.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    state.tags = tagsFilter.value.trim();
    state.page = 1;
    loadTasks();
  }, 350);
});

// ── Toast ──
function showToast(msg, type = "success") {
  const wrap = document.getElementById("toast-wrap");
  const icon = type === "success" ? "ti-circle-check" : "ti-alert-circle";
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="ti ${icon}"></i><span>${escHtml(msg)}</span>`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function escHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function escAttr(s) {
  return String(s ?? "").replace(/'/g, "\\'");
}
function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
function formatStatus(s) {
  return { todo: "To Do", in_progress: "In Progress", done: "Done" }[s] || s;
}
function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function isDueOverdue(d) {
  if (!d) return false;
  return new Date(d) < new Date();
}

loadTasks();
