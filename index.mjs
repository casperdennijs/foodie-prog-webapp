import compression from 'compression';
import express from 'express';
const app = express();
app.use(compression());

import fetch from 'node-fetch';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', (req, res) => {
    fetch("https://nl.openfoodfacts.org/cgi/search.pl?search_terms=&json=true")
        .then(response => {
            return response.json();
        })
        .then(data => {
            res.set('Cache-control', 'public, max-age=31536000')
            res.render('overview', {
                data: data
            });
        })
});

app.get('/search', (req, res) => {
    fetch(`https://nl.openfoodfacts.org/cgi/search.pl?search_terms=${req.query.query}&json=true`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            res.set('Cache-control', 'public, max-age=31536000')
            res.render('overview', {
                data: data
            });
        })
});

app.get('/product', (req, res) => {
    fetch(`https://nl.openfoodfacts.org/api/v0/product/${req.query.id}.json`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            res.set('Cache-control', 'public, max-age=31536000')
            res.render('detail', {
                data: data
            });
        })
});

app.get('/scanner', (req, res) => {
    res.render('scanner');
});

app.get('/offline', (req, res) => {
    res.render('offline');
});

app.listen(3000);