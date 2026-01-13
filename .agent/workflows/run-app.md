---
description: How to run the CV Builder application safely for local development or demos
---

To run your application correctly (ensuring login, AI, and the UI all work), follow these steps in order. You will need **three separate terminal windows**.

### 1. Start the Backend (The "Brain")
This part handles your Database, Google Login, and AI features.
- **Command**: `node server.js`
- **Wait for**: You should see "Server running on port 3001" and "Connected to MongoDB".
- **Safety Tip**: Never share your `.env` file; it contains your secret keys.

### 2. Start the Frontend (The "Interface")
This is what you see in the browser.
- **Command**: `npm run dev`
- **Link**: It will give you a local link like `http://localhost:5173`.
- **Note**: This is only visible to YOU on your computer.

// turbo
### 3. Start the Public Tunnel (For Demos)
If you want to show the app to your manager or test Google Login properly, you need a public HTTPS link.
- **Command**: `npx cloudflared tunnel --url http://localhost:5173`
- **Action**: Look for the link ending in `.trycloudflare.com` in the output.
- **Safety Tip**: Only run this when you are actively demoing. Close the terminal to stop the public link immediately.

---
**How to stop safely**: 
Simply click into the terminal window and press **Ctrl + C** to stop any of the parts.
