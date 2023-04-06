# Foodie Web app
Dit repository is gemaakt voor mijn opdracht voor Progressive Web Apps.

## Installaties
Om de web app te installeren moet je allereerst deze repository clonen. Wanneer je dit gedaan hebt kan je de volgende stappen uitvoeren:
- Voer ***npm install*** uit om alle (dev)dependecies te downloaden
- Run ***npm run start*** om de web app op te starten


## Features
De volgende functionaliteiten zitten in de web app:
- Product overview, een overzicht van alle producten
- Je kan op producten zoeken met de zoekbalk
- Elke product heeft zijn eigen detail pagina (bevat alleen geen data verder)
- Je kan barcodes scannen om bij dat product uit te komen (onvolledig)

## Implementaties
Hier onder kleine uitleggen van verschillende implementaties die ik heb uitgevoerd in de web app

### Routing
Ik maak gebruik van Express als server en heb besloten om EJS toe te passen als Templating Engine. Om data te kunnen fetchen via de server heb ik ook gekozen om de package Node-fetch te installeren. En op elke pagina waar data op moet komen voer ik dan ook een fetch uit.

Hieronder zie je mijn code voor al mijn routes:
```JS
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
```

### Service Worker

### Gulp

### Lighthouse
