const params = new URLSearchParams(window.location.search);
const taskId = params.get("id"); // null = create, else edit
const isEdit = !!taskId;

let currentTags = [];

const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const submitBtn = document.getElementById("submit-btn");
const titleInput = document.getElementById("field-title");
const descInput = document.getElementById("field-description");
const statusInput = document.getElementById("field-status");
const priorityInput = document.getElementById("field-priority");
const dueDateInput = document.getElementById("field-due-date");
const tagsWrap = document.getElementById("tags-input-wrap");
const tagsRealInput = document.getElementById("tags-real-input");
const tagsHidden = document.getElementById("tags-hidden");

if (isEdit) {
  formTitle.textContent = "Edit Task";
  formSubtitle.textContent = "Update the details below.";
  submitBtn.textContent = "Save Changes";
  loadTask();
} else {
  formTitle.textContent = "New Task";
  formSubtitle.textContent = "Fill in the details to create a new task.";
}

// ── Load existing task (edit mode) ──
async function loadTask() {
  setLoading(true);
  try {
    const res = await API.getTask(taskId);
    const task = res.data; 
    prefillForm(task);
  } catch (err) {
    showToast(err.message || "Failed to load task", "error");
  } finally {
    setLoading(false);
  }
}

function prefillForm(task) {
  titleInput.value = task.title ?? "";
  descInput.value = task.description ?? "";
  statusInput.value = task.status ?? "todo";
  priorityInput.value = task.priority ?? "medium";
  if (task.due_date) {
    dueDateInput.value = task.due_date.slice(0, 10);
  }
  (task.tags || []).forEach(addTag);
}

tagsWrap.addEventListener("click", () => tagsRealInput.focus());

tagsRealInput.addEventListener("keydown", (e) => {
  if (["Enter", ",", "Tab"].includes(e.key)) {
    e.preventDefault();
    const val = tagsRealInput.value.trim().replace(/,$/, "");
    if (val) addTag(val);
  }
  // Backspace on empty input removes last tag
  if (e.key === "Backspace" && !tagsRealInput.value) {
    removeTag(currentTags.length - 1);
  }
});

function addTag(val) {
  val = val.trim();
  if (!val || currentTags.includes(val)) return;
  if (currentTags.length >= 5) {
    showFieldError("tags-error", "Maximum 5 tags allowed");
    return;
  }
  currentTags.push(val);
  renderTags();
  tagsRealInput.value = "";
  clearFieldError("tags-error");
}

function removeTag(index) {
  currentTags.splice(index, 1);
  renderTags();
}

function renderTags() {
  const existingPills = tagsWrap.querySelectorAll(".tag-item");
  existingPills.forEach((p) => p.remove());

  currentTags.forEach((tag, i) => {
    const pill = document.createElement("span");
    pill.className = "tag-item";
    pill.innerHTML = `${escHtml(tag)} <button type="button" onclick="removeTag(${i})" aria-label="Remove tag">&times;</button>`;
    tagsWrap.insertBefore(pill, tagsRealInput);
  });

  tagsHidden.value = JSON.stringify(currentTags);
}

document.getElementById("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);

  const payload = {
    title: titleInput.value.trim(),
    description: descInput.value.trim(),
    status: statusInput.value,
    priority: priorityInput.value,
    due_date: dueDateInput.value ? `${dueDateInput.value}T23:59:59Z` : null,
    tags: currentTags,
  };

  try {
    if (isEdit) {
      await API.updateTask(taskId, payload);
      showToast("Task updated!", "success");
    } else {
      await API.createTask(payload);
      showToast("Task created!", "success");
    }
    setTimeout(() => {
      window.location.href = "index.html";
    }, 900);
  } catch (err) {
    // Handle validation errors from the API (400)
    if (err.status === 400 && err.data?.errors) {
      const errs = err.data.errors;
      Object.entries(errs).forEach(([field, msg]) => {
        showFieldError(`${field}-error`, msg);
        const el = document.getElementById(`field-${field}`);
        if (el) el.classList.add("error");
      });
    } else {
      showToast(err.message || "Something went wrong", "error");
    }
    setLoading(false);
  }
});

function validate() {
  let ok = true;

  // Title required
  if (!titleInput.value.trim()) {
    showFieldError("title-error", "Title is required");
    titleInput.classList.add("error");
    ok = false;
  } else {
    clearFieldError("title-error");
    titleInput.classList.remove("error");
  }

  if (currentTags.length > 5) {
    showFieldError("tags-error", "Maximum 5 tags allowed");
    tagsWrap.classList.add("error");
    ok = false;
  } else {
    clearFieldError("tags-error");
    tagsWrap.classList.remove("error");
  }

  return ok;
}

titleInput.addEventListener("input", () => {
  if (titleInput.value.trim()) {
    clearFieldError("title-error");
    titleInput.classList.remove("error");
  }
});

function setLoading(on) {
  submitBtn.disabled = on;
  submitBtn.textContent = on
    ? isEdit
      ? "Saving…"
      : "Creating…"
    : isEdit
      ? "Save Changes"
      : "Create Task";
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
}
function clearFieldError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = "";
  el.classList.remove("show");
}

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
