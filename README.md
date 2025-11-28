# Book Library (comp3810sef - Group28)

## Project Info
- **Project name**: Book Library
- **Course / Group**: `comp3810sef` - `Group28`
- **Group members**: LUI POK YIN 13220808
                     

**Course submission checklist**: This README follows the COMP S381F/3810SEF project requirements (Express + Mongoose + EJS, deployed to cloud). Replace placeholders (Group number, members, Cloud URL) before submission.
 - **`models/`**: Mongoose schemas: `User.js` and `Book.js`.
 - **`scripts/`**: helper scripts (e.g., `clean_isbn.js` to sanitize isbn fields and recreate index).

## Submission folder structure (required)
Create a top-level folder named `comp3810sef-group<no.>` that contains exactly the following (no `node_modules`):

```
comp3810sef-group<no.>/
	server.js
	package.json
	public/  (static assets)
	views/   (ejs templates)
	models/  (Mongoose schemas)
	README.md
```

Replace `<no.>` with your group number.
## Cloud URL
- Replace this with your deployed cloud URL (Render/Heroku/etc.), e.g.:

	`https://booklibrary-uy04.onrender.com/login`  

If you deploy on Render, set the environment variables `MONGO_URI` (or `MONGODB_URI`) and `SESSION_SECRET` in Render service settings.
- After register/login the app auto-logs-in and redirects to `/books`.

Only authenticated users can access the web UI CRUD pages (`/`, `/create`, `/edit/:id`). The app uses `cookie-session` to store user session (cookie name `session`).

Notes about accounts:
- You can sign up via `/register` to create an account.
- For testing/demo, you may create a test account manually in MongoDB or register using the app UI.
## Web UI (CRUD)
- Read: `/books` – list and basic search via query params: `?author=...&genre=...&year=...`.
- Create: `/books/create` (form) -> `POST /books`.
- Update: `/books/edit/:id` (form) -> `POST /books/update/:id`.
- Delete: `POST /books/delete/:id`.

In this repository the current UI routes are:
- List page: `GET /` (requires login) — shows all books and search box.
- Add book page: `GET /create` -> `POST /create` (requires login).
- Edit book: `GET /edit/:id` -> `POST /edit/:id` (requires login).
- Delete book: `GET /delete/:id` (requires login).

The UI includes simple forms for create and edit. The search box on list page searches title and author.
## RESTful APIs (no auth)
- GET /api/books  — Read all books
- POST /api/books — Create a book (JSON body)
- PUT /api/books/:id — Update a book (JSON body)
- DELETE /api/books/:id — Delete a book

## REST API examples (useful cURL commands)

# Read all books
curl -X GET https://booklibrary-uy04.onrender.com/login

# Create (JSON)
curl -X POST -H "Content-Type: application/json" -d '{"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"Fantasy","isbn":"9780261103344"}' https://booklibrary-uy04.onrender.com/login

# Update (JSON)
curl -X PUT -H "Content-Type: application/json" -d '{"title":"The Hobbit (Updated)"}' https://booklibrary-uy04.onrender.com/login/<id>

# Delete
curl -X DELETE https://booklibrary-uy04.onrender.com/login/<id>

# Notes on protected UI endpoints (cookie required)
# Use the browser for UI flows. To test UI endpoints with curl you must first login and capture cookies, e.g.:
# 1) POST /login to get Set-Cookie
# 2) Use the saved cookie with -b cookiefile when POSTing to /create or /edit
```
Create a folder named `comp3810sef-group<no.>` with the required files and zip it. Example (PowerShell):

```powershell
mkdir comp3810sef-group28
cp -Recurse .\* comp3810sef-group28\
Remove-Item comp3810sef-group28\node_modules -Recurse -Force
Compress-Archive -Path comp3810sef-group28 -DestinationPath comp3810sef-group28.zip
```
- If server fails to start: ensure `MONGODB_URI` exists and points to a reachable MongoDB.
- If you get `E11000 duplicate key` on register: choose a different username or delete duplicate user from DB.
- If session/cookies not working: confirm `SESSION_SECRET` is set and your browser accepts cookies.

## Demo presentation checklist (5-min demo)
- Introduce project & group info (30s)
- Show Cloud URL and login (30s)
- Demo: create a book, search/filter, edit a book, delete a book (2.5 min)
- Demo: run 2-3 cURL commands for APIs (1.5 min)
- Final remarks and Q&A (30s)

---
_This README is a starter for your course submission. Replace placeholders (group number, names, Cloud URL) and verify the app runs on your target cloud before submitting._
