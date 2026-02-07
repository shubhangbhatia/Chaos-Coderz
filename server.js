const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate'); 
const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Add these lines to serve static files
app.use(express.static('public'));           // NEW - for JS files
app.use('/CSS', express.static('CSS'));      // This might already exist

app.get('/', (req, res) => {
    res.render('index'); 
});

app.get('/about', (req, res) => {
    res.render('about'); 
});

app.get('/transaction', (req, res) => {
    res.render('transaction'); 
});

app.get('/login', (req, res) => {
    res.render('login'); 
});

app.get('/signup', (req, res) => {
    res.render('signup'); 
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});