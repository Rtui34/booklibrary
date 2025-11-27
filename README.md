# Library Management System (Group Project)

## 1. Project Info
* **Project Name:** Library Management System
* **Group:** Group X
* **Members:** (Your Names & SIDs)

## 2. Project File Intro
* **server.js:** Main application entry point. Handles DB connection, Login/Logout logic, and defines all Web & API routes.
* **models/Book.js:** Mongoose schema defining the Book data structure (Title, Author, ISBN, Status).
* **views/:** Contains EJS templates for the UI (Login, List, Form).
* **public/css:** Contains custom CSS for the "Fancy UI".

## 3. Cloud Server URL
* **Render URL:** (請在部署後填入這裡，例如 https://xxx.onrender.com)

## 4. Operation Guides

### A. Web UI (Login Required)
1. **Login:** Use `admin` / `password` to log in.
2. **Create:** Click "+ Add New Book" button.
3. **Read:** View the list on the homepage. Use the "Search" bar to find books by Title or Author.
4. **Update:** Click "Edit" next to any book.
5. **Delete:** Click "Delete" next to any book.

### B. RESTful API (No Auth Required - CURL Testing)

**1. Create a Book (POST)**
```bash
curl -X POST -H "Content-Type: application/json" -d "{\"title\":\"NodeJS Guide\",\"author\":\"John Doe\",\"isbn\":\"12345\",\"status\":\"Available\"}" [https://YOUR-APP-URL.onrender.com/api/books](https://YOUR-APP-URL.onrender.com/api/books)