# Foodie Web app
Dit repository is gemaakt voor mijn opdracht voor Progressive Web Apps. Ik heb tijdens WAFS een client side applicatie gemaakt met het gebruik van de OpenFood API en deze heb ik tijdens PWA omgezet naar server side.

## Installeren
Om de web app te installeren moet je allereerst deze repository clonen. Wanneer je dit gedaan hebt kan je de volgende stappen uitvoeren:
- Voer ***npm install*** uit om alle (dev)dependecies te downloaden
- Run ***npm run start*** om de web app op te starten

## Features
De volgende functionaliteiten zitten in de web app:
- Product overview, een overzicht van alle producten
- Je kan op producten zoeken met de zoekbalk
- Elke product heeft zijn eigen detail pagina (bevat alleen geen data verder)
- Je kan barcodes scannen om bij dat product uit te komen (onvolledig)

## Proces & implementaties
Hier onder kleine uitleggen van mijn proces en de daarbij verschillende implementaties die ik heb uitgevoerd in de web app

### Routing (Express)
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

In Express geef ik elke pagina een header Cache-control mee om ervoor te zorgen dat browser zo lang mogelijk de pagina opslaan in de cache. Dit zorgt ervoor dat de pagina niet elke keer onnodig ingeladen hoeft te worden als deze nog hetzelfde is en daarnaast voor offline toegang als het gecached is.

```JS
app.use(compression());
```

Deze regel zorgt ervoor dat Express door geeft aan de browser dat alle data die verstuurd compressed wordt en kleiner gemaakt wordt voor de gebruiker.

### Activity Flow Diagram
![Activity Flow Diagram](https://github.com/casperdennijs/foodie-prog-webapp/assets/56598338/403c8a7d-7bb2-4002-b782-7be2fee97ec8)

### Service Worker & manifest
Voor de Service Worker heb ik gekozen om de voorbeeld tijdens les te gaan gebruiken en die te bestuderen en te implementeren. Op een paar kleine dingen na werkt caching redelijk prima. Het is wel soms heel willekeurig in wanneer het update en zal momenteel soms geforceerd gedaan moeten worden. Offline pagina's werken wanneer je er voor op ben geweest.

In combinatie met de manifest.json is het nu mogelijk om te website ook als een web app te installeren op je computer.
![Schermafbeelding 2023-04-06 124825](https://user-images.githubusercontent.com/56598338/230355551-a5ee5182-4211-46a0-8e5b-ddd00b20349c.png)

Hieronder zie je de code van de Service Worker:
```JS
const CORE_CACHE_NAME = 'cache-v5';
const RUNTIME_CACHE_NAME = 'runtime-cache';
const CORE_ASSETS = [
  '/offline',
  '/css/index.css'
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CORE_CACHE_NAME && cacheName !== RUNTIME_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      })
  )
})

self.addEventListener('fetch', (event) => {
  const path = new URL(event.request.url).pathname

  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE_NAME)
        .then(cache => cache.match(event.request))
        .then(response => response || fetchAndCache(event.request))
        .catch(() => caches.open(CORE_CACHE_NAME)
          .then(cache => cache.match('/offline')))
    )
  } else if (CORE_ASSETS.includes(path)) {
    event.respondWith(
      caches.open(CORE_CACHE_NAME)
        .then(cache => cache.match(path))
    )
  }
})

function fetchAndCache(request) {
  return fetch(request)
    .then(response => {
      const clone = response.clone()
      caches.open(RUNTIME_CACHE_NAME)
        .then(cache => cache.put(request, clone))

      return response
    })
}
```

### Gulp
Voor het minimaliseren van mijn CSS en JS bestanden heb ik gebruik gemaakt van Gulp. Aangezien ik verder geen assets heb die ik zelf serveer aan de gebruiker was het niet nodig om die nog meer te optimaliseren. Ik heb twee basis scripts die beide type bestanden doorloopt en ze vervolgens goed in mijn public map stoppen. Deze script heb ik in package.json gestopt en run ik elke keer als ik de web app opstart.

Dit is mijn script voor CSS:
```JS
const gulp = require('gulp')
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

return gulp.src([
  './source/css/core.css'
])
  .pipe(concat('index.css'))
  .pipe(cleanCSS())
  .pipe(autoprefixer({
    cascade: false
  }))
  .pipe(gulp.dest('./public/css'))
```

Dit is mijn script voor JS:
```JS
const gulp = require('gulp')
const concat = require('gulp-concat');
const minify = require('gulp-minify');

return gulp.src([
    './source/js/*.js'
])
.pipe(concat('index.js'))
.pipe(minify())
.pipe(gulp.dest('./public/js'))
```

### Lighthouse
Op het einde heb ik nog gekeken naar performance en heb ik nog een Lighthouse test gerund. Doordat de resultaten heel erg varieren is het erg lastig te bepalen hoe die nu daadwerkelijk scoort. Dit komt door factoren zoals de API die heel traag kan zijn en welke extensies je hebt gebruikt.

Dit scoorde mijn web app in een normale omstandigheden (extensies etc aan):
![Schermafbeelding 2023-04-06 125316](https://user-images.githubusercontent.com/56598338/230356886-95ced54c-ecf8-44c5-8203-bda39289da8c.png)

En dit scoorde mijn web app in incognito modus:
![Schermafbeelding 2023-04-06 120802](https://user-images.githubusercontent.com/56598338/230356950-b0d5d4ef-4402-4b43-9f54-99dd2416658d.png)

### Conclusie
Ik heb tijdens deze vak veel gefocused op performance en minder op de werking van de app. Ik heb cache headers toegepast, gewerkt met de service worker en andere technieken zoals Gulp en compressiob toegepast om alles te minifyen en compressen. 

### Deployment
Voor Deployment heb Vercel gebruikt.

https://foodie-prog-webapp.vercel.app/

### Checklist <a name="checklist"></a>
- [x] Applicatie overzetten naar NodeJS
- [x] Express 
- [x] EJS
- [x] Fetch werkend maken server side
- [x] Data tonen met EJS
- [x] Scanner toevoegen
- [x] Service worker + manifest.json
- [x] Page headers (cache-control)
- [x] Gulp CSS en JS minifying
- [x] Browser compression
- [ ] Meer functionaliteiten toevoegen uit WAFS
- [ ] States beter uitwerken
