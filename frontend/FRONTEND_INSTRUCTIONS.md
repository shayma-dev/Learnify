LEARNIFY FRONTEND – SETUP & CONTRIBUTING

1. Setup

- Open your terminal and navigate to this folder.
- Install required packages:
    npm install
- Run the React app:
    npm start
- The app will open at http://localhost:3000 in your browser.

2. Project Structure & Where To Write Code

- Add new app UI pages here: src/pages/
  (Example: src/pages/Profile.js)
- Add reusable UI components here: src/components/
  (Example: src/components/Navbar.js)
- Add code for connecting to the backend or APIs here: src/api/
- Update routes (for new pages): src/App.js

3. Adding a New Feature or Page

- Always create a new branch before starting work:
    git checkout main
    git pull
    git checkout -b feature/my-feature

- Write your code in src/pages/ or src/components/ as needed.
- To add a new page, create a new file in src/pages/, then add a <Route> for it in App.js.

4. Saving and Pushing Your Work

- Save your changes.
- Add your changes to be committed:
    git add .
- Commit your changes:
    git commit -m "Short description of what you did"
- Push your branch to GitHub:
    git push origin feature/my-feature

5. Open a Pull Request

- Visit the GitHub page for the repo (in your browser).
- You’ll see an option to open a “Compare & pull request” for your branch.
- Add a description and request a review from a teammate.
- After approval, the branch can be merged into main.

6. General Tips

- Do NOT write code directly on the main branch.
- Keep pull requests small and focused.
- Ask for help in the team chat if stuck!
