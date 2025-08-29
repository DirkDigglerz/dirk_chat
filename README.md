![Chat Banner](https://i.imgur.com/KCZXP2o.jpeg)

A lightweight and customizable chat system for FiveM servers.  
Easily configure behavior such as hiding messages, enabling command-only mode, and more using simple server convars.

---

## 🚀 Features
- Toggle between **command-only** or full chat mode  
- Customizable **chat position**  
- Flexible **message hiding system** (always, never, auto)  
- Adjustable **message timeout**  
- Optional **chat notification sounds**

---

## ⚙️ Configuration

The system uses convars for easy customization.  
Add these to your `server.cfg`:

```cfg
# Restrict chat to commands only
set chat:commandOnly false

# Position of the chat box: top-left, top-right, bottom-left, bottom-right
set chat:position "top-left"

# Message hide behavior:
#   always - messages are hidden unless chat is toggled
#   never  - messages are always visible
#   auto   - messages show temporarily unless chat is opened
set chat:messageHideMode "always"

# Duration (ms) messages remain visible when hide mode = auto
set chat:messageHideTimeout 5000

# Play a sound when a new message is sent
set chat:messageSounds true
