# Book Library (comp3810sef - Group28)

## Project Info
- **Project name**: Book Library
- **Course / Group**: `comp3810sef` - `Group28`
- **Group members**: Lui Pok Yin     13220808
                     Chan Long Ching 13219477
                     Mai Chak Lam    13902186
                     NG Kin Ho       14085745
                     
```
comp3810sef-group<no.>/
	server.js
	package.json
	public/  (static assets)
	views/   (ejs templates)
	models/  (Mongoose schemas)
	README.md
```

## Cloud URL
- 
	`https://booklibrary-uy04.onrender.com/login`  

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