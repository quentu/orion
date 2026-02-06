const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

// If you're on Node 18+, fetch is global. If not, install node-fetch.
let fetchFn = global.fetch;
if (!fetchFn) {
  fetchFn = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
}

app.use(bodyParser.json());

// Serve your UI files from this folder (index.html, styles.css, script.js)
app.use(express.static(__dirname));

// Make sure visiting http://localhost:5000/ returns index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Optional: quick health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Your UI will POST here. This route calls Ollama and returns the model output.
app.post("/ollama", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({ error: "Missing 'message' in JSON body." });
    }

    // Configure these however you want
    const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const MODEL = process.env.OLLAMA_MODEL || "hf.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF:latest";

    // Call Ollama
    const ollamaRes = await fetchFn(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: userMessage,
        stream: false,
      }),
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text().catch(() => "");
      return res.status(ollamaRes.status).json({
        error: "Ollama request failed",
        status: ollamaRes.status,
        details: text,
      });
    }

    const data = await ollamaRes.json();

    // Ollama returns { response: "...", ... }
    return res.json({ response: data.response ?? "" });
  } catch (err) {
    return res.status(500).json({
      error: "Server error calling Ollama",
      details: String(err?.message || err),
    });
  }
});

app.listen(port, () => {
  console.log(`UI + API server running at http://localhost:${port}`);
});
