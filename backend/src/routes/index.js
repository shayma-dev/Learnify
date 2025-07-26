const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Learnify API!' });
});

// More route modules go here (e.g. /tasks, /users, etc)

module.exports = router;