<p align="center">
  <img src="assets\orion-banner.png" width="400px"/>
</p>

**Orion is an open-source control surface for self-hosted LLM servers.**

A minimal, fast, distraction-free web UI that connects directly to your local Ollama instance and streams model responses in real time.

Built for homelabbers, tinkerers, and anyone who believes AI should run on **their** hardware, not a corpotate cloud.

## What Orion does right now

* Clean chat interface
* Real-time token streaming from Ollama
* Markdown rendering for model responses (bold, lists, code blocks, etc.)
* Sanitized rendering using DOMPurify for safety
* Typing indicator while the model is generating
* Mobile-friendly layout
* Random greeting header before chat starts
* Dev mode with fake streaming responses for UI testing without calling Ollama
* Simple Express server that serves the UI and proxies streaming responses
* Works entirely locally with no external dependencies beyond Ollama

## Architecture

Orion is intentionally simple:

```
Browser UI  →  Express Server  →  Ollama API  →  Model
```

The server does one job:

* Accept user messages
* Stream tokens from Ollama
* Pipe them directly to the browser in real time

## Requirements

* Node.js 18+
* Ollama running locally
* A model pulled into Ollama

Example:

```
ollama pull qwen2.5-coder:32b
```
## Running Orion

```
npm install
node server.js
```

Open:

```
http://localhost:5000
```

---

## Environment Variables

You can change the model or Ollama location:

```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=hf.co/Qwen/Qwen2.5-Coder-32B-Instruct-GGUF:latest
```

## Dev Mode (UI testing without Ollama)

Inside `script.js`:

```
const DEV_MODE = true;
```

This simulates streaming responses so you can work on the UI without hitting the server.

## File Overview

* `index.html` — UI structure and layout 
* `styles.css` — theme, layout, chat styling, mobile rules 
* `script.js` — streaming logic, markdown rendering, typing bubble, dev mode 
* `server.js` — Express server + Ollama streaming proxy 

## To Be Added

These are planned next steps for Orion’s development:

### UI / UX

* Sidebar with chat history
* Model selector dropdown
* Session persistence
* Incognito Chat Mode
* Copy-code button for code blocks
* Theme variants w/ user customization
* PWA install (Add to Home Screen)

### LLM Control

* Temperature / top-p sliders
* System prompt editor
* Token counter
* Context window indicator
* Stop generation button

### Server / Infra

* Multi-model support
* Logging and request metrics

## Why Orion exists

Most LLM interfaces assume:

> you want a chatbot.

Orion assumes:

> you run servers.

This is for people who want control, visibility, and ownership of their AI stack.

## License

Open source. Use it. Modify it. Run it your way.
