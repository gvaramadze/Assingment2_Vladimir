// Import the express module
var express = require('express'); 
// Import the path module
var path = require('path'); 
// Create Express app 
var app = express(); 
// Load Handlebars
const exphbs = require('express-handlebars'); 

const fs = require('fs').promises;
// Server port
const port = process.env.port || 3000; 

let moviesData;

// Load movie data once when the server starts
async function loadMovieData() {
    try {
        const data = await fs.readFile(path.join(__dirname, 'movie-dataset-a2-.json'), 'utf8');
        moviesData = JSON.parse(data);
        console.log('Movies data loaded successfully');
    } catch (err) {
        console.error('Error loading JSON data:', err);
        process.exit(1); // Exit if there's an error loading data
    }
}
loadMovieData();

// Set up to serve files from "public" folder
app.use(express.static(path.join(__dirname, 'public'))); 

// Set Handlebars as the view engine and use ".hbs" files
app.engine('.hbs', exphbs({ 
    extname: '.hbs',
    helpers: {
        // Custom helper to check if a record should be displayed based on "Website" field
        hasWebsite: function (website, options) {
            if (website && website.trim() !== '') {
                return options.fn(this); // Render this row if the website field is not blank
            }
            return options.inverse(this); // Skip this row if the website field is blank
        },

        highlightIfNoWebsite: function (website) {
            if (!website || website.trim() === '' || website.toLowerCase() === 'n/a') {
                return 'highlight'; // Returns 'highlight' class for rows with blank or 'N/A' Website field
            }
            return ''; // No class for rows with a valid Website field
        }
    },
    partialsDir: path.join(__dirname, 'views/partials')
 }));
app.set('view engine', 'hbs');

// Route for home page, renders "index.hbs"
app.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

// Display all movies from loaded data
app.get('/data', (req, res) => {
    res.render('data', { title: 'Movie Data', movies: moviesData });
});

// Display a specific movie by index
app.get('/data/movie/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const movie = moviesData && moviesData[index];

    if (movie) {
        res.render('movie', { title: 'Movie Details', movie });
    } else {
        res.status(404).render('error', { title: 'Error', message: 'Movie not found at this index' });
    }
});

// Search by Movie ID form
app.get('/data/search/id', (req, res) => {
    res.render('search_id', { title: 'Search by Movie ID' });
});

// Display result of search by Movie ID
app.get('/data/search/id/result', (req, res) => {
    const movieId = parseInt(req.query.movieId);
    const movie = moviesData.find(m => m.Movie_ID === movieId);

    if (movie) {
        res.render('search_id_result', { title: 'Movie Found', movie });
    } else {
        res.status(404).render('error', { title: 'Error', message: 'Movie not found' });
    }
});

// Search by Title form
app.get('/data/search/title', (req, res) => {
    res.render('search_title', { title: 'Search by Movie Title' });
});

// Display result of search by Title
app.get('/data/search/title/result', (req, res) => {
    const titleQuery = req.query.title.toLowerCase();
    const results = moviesData.filter(movie => movie.Title.toLowerCase().includes(titleQuery));

    if (results.length > 0) {
        res.render('search_title_result', { title: 'Movies Found', results });
    } else {
        res.status(404).render('error', { title: 'Error', message: 'No movies found with that title' });
    }
});

// Route for "/users", sends a simple message
app.get('/users', function (req, res) {
    res.send('respond with a resource');
});

// Route to display all sales data in an HTML table format
app.get('/viewData', (req, res) => {
    res.render('viewData', { title: 'Sales Data', sales: moviesData });
});

// Route to display filtered sales data, excluding entries with a blank Website field
app.get('/filteredData', (req, res) => {
    res.render('filteredData', { title: 'Filtered Sales Data', sales: moviesData });
});

// Route to display all sales data, highlighting entries with a blank or "N/A" Website field
app.get('/highlightedData', (req, res) => {
    res.render('highlightedData', { title: 'Highlighted Sales Data', sales: moviesData });
});

// Catch-all route for any undefined paths, renders "error.hbs"
app.get('*', function (req, res) {
    res.render('error', { title: 'Error', message: 'Wrong Route' });
});

module.exports = app;
// // Start server and listen on set port
// app.listen(port, () => {
//     console.log(`Example app listening at http://localhost:${port}`)
// })