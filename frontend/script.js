const API_BASE = "http://127.0.0.1:8000/api/tasks";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("taskForm");
  const resultDiv = document.getElementById("result");
  const suggestionsDiv = document.getElementById("suggestions");
  const suggestionsBtn = document.getElementById("loadSuggestions");
  const strategySelect = document.getElementById("strategySelect");
  const bulkTextarea = document.getElementById("bulkJson");
  const bulkBtn = document.getElementById("bulkAnalyzeBtn");
  const bulkError = document.getElementById("bulkError");

  // store all analyzed tasks (from single + bulk)
  let analyzedTasks = [];

  /* ---------- Helpers ---------- */

  function classifyPriority(score) {
    if (score >= 2.5) return "high";
    if (score >= 1.8) return "medium";
    return "low";
  }

  function strategyLabel(value) {
    switch (value) {
      case "fastest":
        return "Fastest Wins (low effort first)";
      case "impact":
        return "High Impact (importance first)";
      case "deadline":
        return "Deadline Driven (earliest due first)";
      default:
        return "Smart Balance (overall score)";
    }
  }

  function sortTasks(tasks, strategy) {
    const arr = [...tasks];
    if (strategy === "fastest") {
      // Low estimated time first
      arr.sort(
        (a, b) =>
          a.estimated_time - b.estimated_time ||
          b.priority_score - a.priority_score
      );
    } else if (strategy === "impact") {
      // High importance first
      arr.sort(
        (a, b) =>
          b.importance - a.importance || b.priority_score - a.priority_score
      );
    } else if (strategy === "deadline") {
      // Closest deadline first
      arr.sort(
        (a, b) =>
          new Date(a.deadline) - new Date(b.deadline) ||
          b.priority_score - a.priority_score
      );
    } else {
      // Smart balance: use backend priority_score
      arr.sort((a, b) => b.priority_score - a.priority_score);
    }
    return arr;
  }

  function renderTasks() {
    if (!analyzedTasks.length) {
      resultDiv.classList.add("empty");
      resultDiv.innerHTML =
        '<p class="hint">Analyze one or more tasks to see results here.</p>';
      return;
    }

    const strategy = strategySelect.value;
    const sorted = sortTasks(analyzedTasks, strategy);
    const today = new Date();

    let html = `<p class="subtitle">Showing ${
      sorted.length
    } tasks sorted by <strong>${strategyLabel(strategy)}</strong>.</p>`;
    html += '<div class="task-list">';

    sorted.forEach((t) => {
      const score = Number(t.priority_score).toFixed(2);
      const level = classifyPriority(score);
      const pillClass =
        level === "high"
          ? "priority-pill priority-high"
          : level === "medium"
          ? "priority-pill priority-medium"
          : "priority-pill priority-low";

      const dl = new Date(t.deadline);
      const diffMs = dl - today;
      const daysLeft = Math.round(diffMs / (1000 * 60 * 60 * 24));
      let deadlineBand = "deadline is further away";
      if (daysLeft <= 1) deadlineBand = "deadline is very close";
      else if (daysLeft <= 3) deadlineBand = "deadline is coming up soon";

      const explanation = `Because importance is ${t.importance}, difficulty is ${t.difficulty}, and ${deadlineBand}.`;

      html += `
        <article class="task-row">
          <div class="task-row-header">
            <div class="task-row-title">${t.description}</div>
            <div class="${pillClass}">
              <span>${score}</span> · ${level.toUpperCase()} priority
            </div>
          </div>
          <div class="task-row-meta">
            <span>Deadline: ${t.deadline}</span>
            <span>Difficulty: ${t.difficulty}</span>
            <span>Importance: ${t.importance}</span>
            <span>Estimated time: ${t.estimated_time}h</span>
          </div>
          <div class="task-row-expl">
            Why this score: ${explanation}
          </div>
        </article>
      `;
    });

    html += "</div>";
    resultDiv.classList.remove("empty");
    resultDiv.innerHTML = html;
  }

  /* ---------- Single task analyze ---------- */

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      description: document.getElementById("description").value,
      deadline: document.getElementById("deadline").value,
      difficulty: parseInt(document.getElementById("difficulty").value),
      importance: parseInt(document.getElementById("importance").value),
      estimated_time: parseInt(document.getElementById("estimated_time").value),
    };

    // basic validation
    if (!data.description || !data.deadline) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/analyze/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        alert("Backend error: " + JSON.stringify(result));
        return;
      }

      const task = {
        ...result.task,
        priority_score: result.priority_score,
      };
      analyzedTasks.push(task);
      renderTasks();

      // small UX: clear fields except date
      form.reset();
    } catch (err) {
      alert("Request failed: " + err);
    }
  });

  /* ---------- Bulk JSON analyze ---------- */

  bulkBtn.addEventListener("click", async () => {
    bulkError.textContent = "";

    const raw = bulkTextarea.value.trim();
    if (!raw) {
      bulkError.textContent = "Please paste a JSON array of tasks.";
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      bulkError.textContent = "Invalid JSON: " + e.message;
      return;
    }

    if (!Array.isArray(parsed)) {
      bulkError.textContent = "JSON must be an array of task objects.";
      return;
    }

    // limit to avoid spam
    if (parsed.length > 20) {
      bulkError.textContent = "Please limit bulk analysis to 20 tasks.";
      return;
    }

    try {
      const promises = parsed.map((item) => {
        const payload = {
          description: item.description,
          deadline: item.deadline,
          difficulty: item.difficulty,
          importance: item.importance,
          estimated_time: item.estimated_time,
        };
        return fetch(`${API_BASE}/analyze/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).then((res) => res.json().then((data) => ({ ok: res.ok, data })));
      });

      const results = await Promise.all(promises);

      results.forEach((res) => {
        if (res.ok) {
          analyzedTasks.push({
            ...res.data.task,
            priority_score: res.data.priority_score,
          });
        }
      });

      renderTasks();
      if (!results.length) {
        bulkError.textContent = "No valid tasks were analyzed.";
      }
    } catch (err) {
      bulkError.textContent = "Bulk request failed: " + err;
    }
  });

  /* ---------- Strategy change re-sorts tasks ---------- */

  strategySelect.addEventListener("change", () => {
    renderTasks();
  });

  /* ---------- Suggestions from backend ---------- */

  suggestionsBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_BASE}/suggest/`);
      const tasks = await response.json();

      if (!tasks.length) {
        suggestionsDiv.innerHTML =
          '<p class="hint">No tasks found yet. Analyze some tasks first.</p>';
        return;
      }

      let html = "";
      tasks.forEach((t) => {
        html += `
          <article class="suggestion-card">
            <div class="suggestion-top">
              <div class="suggestion-title">${t.description}</div>
              <div class="score-label">Score: <strong>${t.priority_score}</strong></div>
            </div>
            <div class="suggestion-meta">
              <span>Deadline: ${t.deadline}</span>
              <span>Difficulty: ${t.difficulty}</span>
              <span>Importance: ${t.importance}</span>
              <span>Time: ${t.estimated_time}h</span>
            </div>
          </article>
        `;
      });

      suggestionsDiv.innerHTML = html;
    } catch (err) {
      suggestionsDiv.innerHTML =
        "<p class='hint'><strong>Could not load suggestions:</strong> " +
        err +
        "</p>";
    }
  });
});
