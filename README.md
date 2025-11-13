<!--
README for comp3810sef group project
Fill in Group number, member names and SIDs in the Project Info section below.
-->
# Book Library (comp3810sef - Group28)

## Project Info
- **Project name**: Book Library
- **Course / Group**: `comp3810sef` - `Group28`
- **Group members**: (leave blank; add member names and SIDs before submission)

## Project files (short intro)
- **`server.js`**: Express server — handles authentication (register/login/logout), web UI routes for CRUD (`/books`, `/books/create`, `/books/edit/:id`), and RESTful APIs under `/api/books`.
- **`package.json`**: Node dependencies and `start` script (`npm start`).
- **`public/`**: static assets (CSS).
- **`views/`**: EJS templates: `register.ejs`, `login.ejs`, `books.ejs` (or `book.ejs` fallback), `create.ejs`, `edit.ejs`.
- **`models/`**: Mongoose schemas: `User.js` and `Book.js`.

## Cloud URL
- Replace this with your deployed cloud URL (Render/Heroku/etc.), e.g.:

  `https://comp3810sef-group1.render.com/`

## Setup (Local)
1. Copy `.env.example` to `.env` (or create `.env`) with these variables:

```
MONGODB_URI=mongodb://127.0.0.1:27017
SESSION_SECRET=your_long_random_secret_here
PORT=3000
```

2. Install dependencies and start server:

```powershell
npm install
npm.cmd start
```

3. (Optional) Start a local MongoDB via Docker for testing:

```powershell
docker run -d --name book-mongo -p 27017:27017 -e MONGO_INITDB_DATABASE=booklib mongo:6
```

4. Open `http://localhost:3000/` in your browser and register a new user.

## Authentication / Login
- Register: `GET /register`, `POST /register` (form: `username`, `password`).
- Login: `GET /login`, `POST /login` (form: `username`, `password`).
- Logout: `GET /logout`.
- After register/login the app auto-logs-in and redirects to `/books`.

Only authenticated users can access the web UI CRUD pages (`/books`, `/books/create`, `/books/edit/:id`). The app uses `cookie-session` to store user session (cookie name `session`).

## Web UI (CRUD)
- Read: `/books` – list and basic search via query params: `?author=...&genre=...&year=...`.
- Create: `/books/create` (form) -> `POST /books`.
- Update: `/books/edit/:id` (form) -> `POST /books/update/:id`.
- Delete: `POST /books/delete/:id`.

## RESTful APIs (no auth)
- GET /api/books  — Read all books
- POST /api/books — Create a book (JSON body)
- PUT /api/books/:id — Update a book (JSON body)
- DELETE /api/books/:id — Delete a book

Example cURL commands:

```bash
# Create (API)
curl -X POST -H "Content-Type: application/json" -d '{"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"Fantasy"}' https://YOUR_CLOUD_URL/api/books

# Read (API)
curl https://YOUR_CLOUD_URL/api/books

# Update (API)
curl -X PUT -H "Content-Type: application/json" -d '{"title":"The Hobbit (Updated)"}' https://YOUR_CLOUD_URL/api/books/<id>

# Delete (API)
curl -X DELETE https://YOUR_CLOUD_URL/api/books/<id>
```

Notes for testing protected web pages with cookies:
- Use the browser (recommended) or capture `Set-Cookie` after login and send it with subsequent requests to access `/books`.

## Deployment (Render)
1. Push this repository to GitHub (already done in this workspace).
2. Create a Web Service on Render and connect the GitHub repo.
3. In Render service settings, add environment variables:

```
MONGODB_URI=<your MongoDB Atlas connection string>
SESSION_SECRET=<a long random string>
PORT=10000  # Render will override if needed
```

4. Trigger deploy. Check Render logs for `Connected to MongoDB` and `Server running on port` messages.

Security note: If you previously exposed an Atlas connection string in chat or public places, immediately rotate the database user's password or create a new DB user and update `MONGODB_URI`.

## Packaging for submission
Create a folder named `comp3810sef-group<no.>` with the required files and zip it. Example (PowerShell):

```powershell
mkdir comp3810sef-group1
cp -Recurse .\* comp3810sef-group1\
Remove-Item comp3810sef-group1\node_modules -Recurse -Force
Compress-Archive -Path comp3810sef-group1 -DestinationPath comp3810sef-group1.zip
```

Replace `group1` with your actual group number before zipping.

## What to include in the README before submission
- Project info (group no., member names, SIDs)
- Cloud URL (deployed app)
- How to run locally and how to test the APIs (cURL examples above)

## Troubleshooting
- If server fails to start: ensure `MONGODB_URI` exists and points to a reachable MongoDB.
- If you get `E11000 duplicate key` on register: choose a different username or delete duplicate user from DB.
- If session/cookies not working: confirm `SESSION_SECRET` is set and your browser accepts cookies.

---
_This README is a generated starter. Replace placeholders (group number, names, cloud URL) before final submission._
