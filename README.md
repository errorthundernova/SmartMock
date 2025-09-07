
# 🤖 SmartMock

A **full-stack AI-powered application** that generates realistic mock JSON data from natural language prompts using the **Google Gemini API**.  
Perfect for developers, testers, and data scientists who need structured sample data on demand.

---

## 📑 Table of Contents
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [✅ Prerequisites](#-prerequisites)
  - [⚙️ Backend Setup](#️-backend-setup)
  - [🎨 Frontend Setup](#-frontend-setup)
- [📌 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)


---

## ✨ Features

- 🤖 **AI-Powered Data Generation** – Describe your data needs in plain English, and instantly get JSON-formatted mock data.
- 📄 **File-Based Context** – Upload CSV/JSON files to guide the AI with structural examples.
- 💬 **Chat History** – Save and revisit all your generated datasets and prompts.
- ✏️ **Interactive Chat** – Edit prompts, regenerate responses, and manage your history easily.
- 🚀 **Temporary Chat** – Sandbox mode for quick, unsaved data generation.
- ⬇️ **Multiple Export Options** – Download your mock data in **JSON** or **CSV** format.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS  
- **Backend**: FastAPI (Python)  
- **Database**: SQLAlchemy with SQLite  
- **AI**: Google Gemini API  

---

## 📂 Project Structure

```

/
├── backend/
│   ├── venv/
│   ├── **pycache**/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── security.py
│   └── .env
└── frontend-data-generator/
├── node\_modules/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
└── .gitignore

````

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### ✅ Prerequisites
- [Python 3.8+](https://www.python.org/downloads/)  
- [Node.js & npm](https://nodejs.org/en/download/)

---


### ⚙️ Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend


2. Create and activate a virtual environment:

   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:

   * Create a file named `.env` inside the `backend` directory.
   * Add your **Google Gemini API key**:

     ```
     GOOGLE_API_KEY=YOUR_API_KEY
     ```

5. Start the backend server:

   ```bash
   uvicorn backend.main:app --reload
   ```

---

### 🎨 Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend-data-generator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and go to:

   ```
   http://localhost:5173
   ```

---

## 📌 Roadmap

* 🔐 User authentication (Google/GitHub OAuth)
* 📊 Advanced schema customization
* 🌐 Deployment guide (Docker + Cloud hosting)
* 🧩 Plugin system for reusable mock data templates

---

## 🤝 Contributing

Contributions are welcome!
Feel free to **fork** this repo, open issues, or submit pull requests.

---


