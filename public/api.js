//  api.js  — centralised API layer
const BASE_URL = "http://localhost:3000"; 

async function request(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ── Tasks ──
const API = {
  /**
   * List tasks with optional filters / search / pagination.
   * @param {Object} params
   * @param {string}   [params.search]     - search term
   * @param {string}   [params.status]     - todo | in_progress | done
   * @param {string}   [params.priority]   - low | medium | high
   * @param {string}   [params.tags]       - comma-separated tags
   * @param {number}   [params.page]       - page number (1-based)
   * @param {number}   [params.limit]      - items per page
   */
  getTasks(params = {}) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== "" && v !== null && v !== undefined) qs.set(k, v);
    }
    const query = qs.toString() ? `?${qs}` : "";
    return request("GET", `/tasks${query}`);
  },

  /** Get a single task by id */
  getTask(id) {
    return request("GET", `/tasks/${id}`);
  },

  /**
   * Create a new task.
   * @param {Object} payload
   * @param {string}   payload.title       - required
   * @param {string}   [payload.description]
   * @param {string}   [payload.status]    - todo | in_progress | done
   * @param {string}   [payload.priority]  - low | medium | high
   * @param {string}   [payload.due_date]  - ISO date string
   * @param {string[]} [payload.tags]      - max 5 items
   */
  createTask(payload) {
    return request("POST", "/tasks", payload);
  },

  /**
   * Update an existing task.
   * @param {string|number} id
   * @param {Object} payload - same shape as createTask
   */
  updateTask(id, payload) {
    return request("PUT", `/tasks/${id}`, payload);
  },

  /** Delete a task by id */
  deleteTask(id) {
    return request("DELETE", `/tasks/${id}`);
  },
};
