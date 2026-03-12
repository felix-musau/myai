# Adding a Database to Your Render Deployment

The current app uses file‑based storage (lowdb) for users, consultations, etc. There is
no `DATABASE_URL` requirement today, so the missing value is **not** why your news/chat
endpoints are returning HTML. However, if you want to move from JSON files to a
real database on Render, the following steps will guide you through the process.

> **Note:** these are the general actions you would take to provision and use a
> database. Choose the database type (PostgreSQL, MySQL, MongoDB, etc.) that fits
your needs. Render makes managed PostgreSQL very easy.

---

## 1. Provision a managed database on Render

1. Open your Render dashboard and sign in.
2. In the left menu click **New** &rarr; **PostgreSQL** (or MySQL, Redis, etc.).
3. Give the database a name (e.g. `myai-db`) and choose a region that matches your
   backend service region.
4. Optionally select a plan (the free tier is fine for development).
5. Click **Create database**. Render will initialize it and display a connection
   string labeled `DATABASE_URL`.
6. Copy the value of `DATABASE_URL`; you will use it in the next step.

> Keep this URL secret; it contains credentials. Render stores it securely and you
> can view it in the **Environment** tab of the database service.

---

## 2. Configure your backend service

1. Open the **Environment** tab of your backend service on Render.
2. Add an environment variable named `DATABASE_URL` and paste the connection
   string from step 1.
3. If you have a `.env.example` file, update it to include a placeholder line:
   ```
   DATABASE_URL=postgres://user:pass@host:port/dbname
   ```
4. Deploy or restart the backend service to pick up the new variable.

---

## 3. Update your code to use the database

1. Install a database client library appropriate for your DB. For PostgreSQL:
   ```bash
   cd backend
   npm install pg knex
   ```
2. Remove or refactor lowdb usage. For example, create a new module
   `backend/db.js`:
   ```js
   const { Pool } = require('pg');
   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   module.exports = { query: (text, params) => pool.query(text, params) };
   ```
3. Replace direct file reads/writes in routes/controllers with SQL queries or an
   ORM. For example in `authController`:
   ```js
   const db = require('./db');
   // inside register handler
   const result = await db.query(
     'INSERT INTO users (username, email, password) VALUES ($1,$2,$3) RETURNING id',
     [username, email, hash]
   );
   ```
4. Create database migration scripts (you can use Knex, Sequelize, etc.) to
   define the tables (`users`, `consultations`, etc.). Run them locally and on
   Render by connecting to the managed database using the same URL.
5. Test locally: set `DATABASE_URL` in your local `.env` and run the backend.
   Verify that registration, login, consultation storage, etc. work correctly.

> Since the frontend only communicates via `/api` endpoints, it does not need any
> code changes beyond what the backend requires.

---

## 4. Deploy and verify

1. Commit your backend code changes and push to the branch Render is tracking.
2. Render will automatically build and restart the backend service. Watch the
   logs for connection messages or errors.
3. Use `curl` or the frontend to exercise authentication, news, chat, etc. All
   functionality should work as before, but now data is persisted in the
   managed database instead of JSON files.
4. Optionally, remove the now‑unused `db/*.json` files from the repository.

---

## 5. Additional considerations

- **Migrations**: maintain schema changes with a tool (Knex, Flyway, etc.).
- **Backups**: Render automatically backs up managed databases, but you can also
  export snapshots.
- **Security**: set up IP restrictions or a firewall if desired.
- **Scaling**: upgrade the database plan when your workload increases.

By following this approach you will have a fully working `DATABASE_URL`-backed
application on Render. The absence of a database was not the cause of your
chat/news issue, but this process will give you a robust backend storage solution
for future growth.