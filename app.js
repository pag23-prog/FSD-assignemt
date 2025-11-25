import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:5000";

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("New");
  const [effort, setEffort] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(function () {
    loadIssues();
  }, []);

  async function loadIssues() {
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/issues");
      const data = await res.json();
      setIssues(data);
    } catch (err) {
      console.log("Failed to load issues:", err);
      alert("Error loading issues. Check backend.");
    }
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (title.trim() === "" || owner.trim() === "") {
      alert("Title and Owner are required");
      return;
    }

    const payload = {
      title: title.trim(),
      owner: owner.trim(),
      status: status,
      effort: effort ? Number(effort) : 0,
      dueDate: dueDate || null
    };

    try {
      let res;
      if (editId) {
        res = await fetch(API_URL + "/issues/" + editId, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(API_URL + "/issues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const saved = await res.json();

      if (!res.ok) {
        alert(saved.error || "Request failed");
        return;
      }

      if (editId) {
        setIssues(function (prev) {
          return prev.map(function (i) {
            if (i._id === editId) return saved;
            return i;
          });
        });
      } else {
        setIssues(function (prev) {
          return [saved].concat(prev);
        });
      }

      clearForm();
    } catch (err) {
      console.log("Error saving issue:", err);
      alert("Error saving issue.");
    }
  }

  function clearForm() {
    setTitle("");
    setOwner("");
    setStatus("New");
    setEffort("");
    setDueDate("");
    setEditId(null);
  }

  function startEdit(issue) {
    setEditId(issue._id);
    setTitle(issue.title);
    setOwner(issue.owner);
    setStatus(issue.status);
    setEffort(issue.effort || "");
    if (issue.dueDate) {
      setDueDate(issue.dueDate.slice(0, 10));
    } else {
      setDueDate("");
    }
  }

  async function deleteIssue(id) {
    if (!window.confirm("Delete this issue?")) return;

    try {
      const res = await fetch(API_URL + "/issues/" + id, {
        method: "DELETE"
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete");
        return;
      }

      setIssues(function (prev) {
        return prev.filter(function (i) {
          return i._id !== id;
        });
      });
    } catch (err) {
      console.log("Error deleting issue:", err);
      alert("Error deleting issue.");
    }
  }

  function formatDate(d) {
    if (!d) return "";
    return new Date(d).toLocaleDateString();
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Issue Tracker (MERN)</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: 20,
          background: "#f3f4f6",
          padding: 12,
          borderRadius: 8
        }}
      >
        <h2>{editId ? "Edit Issue" : "Add New Issue"}</h2>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 8,
            flexWrap: "wrap"
          }}
        >
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={function (e) {
              setTitle(e.target.value);
            }}
            style={{ flex: 1, padding: 8 }}
          />
          <input
            type="text"
            placeholder="Owner"
            value={owner}
            onChange={function (e) {
              setOwner(e.target.value);
            }}
            style={{ flex: 1, padding: 8 }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 8,
            flexWrap: "wrap"
          }}
        >
          <select
            value={status}
            onChange={function (e) {
              setStatus(e.target.value);
            }}
            style={{ padding: 8 }}
          >
            <option>New</option>
            <option>Assigned</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Effort (days)"
            value={effort}
            onChange={function (e) {
              setEffort(e.target.value);
            }}
            style={{ padding: 8 }}
          />

          <input
            type="date"
            value={dueDate}
            onChange={function (e) {
              setDueDate(e.target.value);
            }}
            style={{ padding: 8 }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="submit"
            style={{
              padding: "8px 12px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 6
            }}
          >
            {editId ? "Update Issue" : "Add Issue"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={clearForm}
              style={{
                padding: "8px 12px",
                background: "#9ca3af",
                color: "#fff",
                border: "none",
                borderRadius: 6
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h2>Issue List</h2>
      {loading ? (
        <p>Loading issues...</p>
      ) : issues.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Title
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Owner
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Status
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Created
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Effort
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Due Date
              </th>
              <th style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {issues.map(function (issue) {
              return (
                <tr key={issue._id}>
                  <td style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                    {issue.title}
                  </td>
                  <td style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                    {issue.owner}
                  </td>
                  <td style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                    {issue.status}
                  </td>
                  <td style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                    {formatDate(issue.createdAt)}
                  </td>
                  <td style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                    {issue.effort}
                  </td>
                  <td style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                    {issue.dueDate ? formatDate(issue.dueDate) : ""}
                  </td>
                  <td style={{ borderBottom: "1px solid #e5e7eb", padding: 8 }}>
                    <button
                      onClick={function () {
                        startEdit(issue);
                      }}
                      style={{ padding: "4px 8px", marginRight: 4 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={function () {
                        deleteIssue(issue._id);
                      }}
                      style={{
                        padding: "4px 8px",
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
