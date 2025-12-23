const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`
    =========================================
    KAMERE x ZagadyEB Web is running!
    URL: http://localhost:${PORT}
    =========================================
    `);
});