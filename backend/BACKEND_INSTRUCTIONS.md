LEARNIFY BACKEND – SETUP & CONTRIBUTING

1. Setup

- Open your terminal and navigate to this folder.
- Install backend dependencies:
    npm install
- Copy the sample environment file and fill in your info:
    cp .env.example .env
  Edit .env with your database info (see the template in .env.example).
- Run the backend:
    npm run dev
- By default, the backend runs at http://localhost:5000/api/

2. Project Structure & Where To Write Code

- Add new API endpoints in: src/routes/
  (Create a new file if needed, e.g., src/routes/tasks.js, and link it in src/routes/index.js)
- Add business logic in: src/controllers/ (if the folder exists)
- Add database queries/models in: src/models/ (if needed)
- Database configuration is in src/config/db.js

3. Adding a New API Endpoint

- Always create a new branch before starting work:
    git checkout main
    git pull
    git checkout -b feature/my-api-feature

- Add a route in src/routes/
- Register your route in src/routes/index.js

4. Saving and Pushing Your Work

- Save all your changes.
- Stage your changes:
    git add .
- Commit with a clear message:
    git commit -m "Describe the feature or fix"
- Push your branch to GitHub:
    git push origin feature/my-api-feature

5. Open a Pull Request

- On GitHub, create a Pull Request for your branch, targeting the main branch.
- Add a description and request a review.
- Only merge after a teammate has approved it.

6. General Tips

- Do NOT develop directly on the main branch.
- Pull the latest changes from main before starting or finishing a feature.
- Keep your pull requests clear and focused.
- If you hit errors, check your database connection, dependencies, and .env file.
- Ask for help in the team chat if you get stuck!
