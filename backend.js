const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();


app.use(cors());
app.use(express.json());


const MONGO_URL = "mongodb://127.0.0.1:27017/issue_tracker";

mongoose
  .connect(MONGO_URL)
  .then(function () {
    console.log("MongoDB connected");
  })
  .catch(function (err) {
    console.log("MongoDB connection error:", err);
  });


const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: String, required: true },
  status: {
    type: String,
    enum: ["New", "Assigned", "In Progress", "Resolved", "Closed"],
    default: "New"
  },
  createdAt: { type: Date, default: Date.now },
  effort: { type: Number, default: 0 },
  dueDate: { type: Date }
});

const Issue = mongoose.model("Issue", issueSchema);

app.get("/", function (req, res) {
  res.json({ message: "Issue Tracker API is running" });
});


app.get("/issues", async function (req, res) {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.log("Error fetching issues:", err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

app.post("/issues", async function (req, res) {
  try {
    const body = req.body;

    const issue = new Issue({
      title: body.title,
      owner: body.owner,
      status: body.status || "New",
      effort: body.effort || 0,
      dueDate: body.dueDate || null
    });

    const saved = await issue.save();
    res.status(201).json(saved); 
  } catch (err) {
    console.log("Error creating issue:", err);
    res.status(400).json({ error: "Failed to create issue" });
  }
});

app.put("/issues/:id", async function (req, res) {
  try {
    const id = req.params.id;

    const updated = await Issue.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json(updated);
  } catch (err) {
    console.log("Error updating issue:", err);
    res.status(400).json({ error: "Failed to update issue" });
  }
});

app.delete("/issues/:id", async function (req, res) {
  try {
    const id = req.params.id;

    const deleted = await Issue.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json({ message: "Issue deleted successfully" });
  } catch (err) {
    console.log("Error deleting issue:", err);
    res.status(500).json({ error: "Failed to delete issue" });
  }
});

const PORT = 5000;
app.listen(PORT, function () {
  console.log("Backend server running on http://localhost:" + PORT);
});
