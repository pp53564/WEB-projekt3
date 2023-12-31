document.addEventListener("DOMContentLoaded", function () {
    // Dohvaćanje canvas elementa i njegovog 2D konteksta
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");

    // Postavi veličinu Canvasa na veličinu prozora preglednika
    c.width = window.innerWidth;
    c.height = window.innerHeight;


    // Postavi boju pozadine na crnu
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, c.width, c.height);


    // dohvaćanje html-a za prikaz vremena, div-a "Game Over", konačnog vremena,
    //zvuka sudara, najboljeg vremena i gumba za ponovno pokretanje, overlaya- zatamljenje pozadine
    var timerElement = document.getElementById("timer");
    var gameOverElement = document.getElementById("gameOver");
    var finalTimeElement = document.getElementById("finalTime");
    var overlayElement = document.getElementById("overlay");
    var collisionSound = document.getElementById("collisionSound");
    var bestTimeElement = document.getElementById("bestTime");
    var restartButton = document.getElementById("restartButton");
    var localStorageKey = "bestTime";
    var collision;

    // Funkcija za postavljanje najboljeg vremena u local storage
    function setBestTime(time) {
        localStorage.setItem(localStorageKey, time);
    }


    //dohvaćanje div elemenata sa slikama
    var img = document.getElementById("asteroidImage");
    var rocketImage = document.getElementById("rocketImage");

    var player = {
        x: (c.width - 100) / 2,  // Početna x pozicija rakete
        y: (c.height - 100) / 2, // Početna y pozicija rakete
        speed: 7,                // Brzina kretanja rakete
        rotation: 0,             // Početni kut rotacije
    };

    var startGameTimer; // Vrijeme početka igre

    // Funkcija za crtanje rakete
    function makeRocket(x, y, rotation) {
        ctx.save();
        ctx.translate(x + 40, y + 60);                  // Postavi središte rotacije na sredinu rakete
        ctx.rotate(rotation);                          // Rotiraj prema kutu rotacije
        ctx.drawImage(rocketImage, -40, -60, 50, 90); // Centriraj sliku rakete
        ctx.restore();
    }

    // Dodaj event listener za tipkovnicu
    document.addEventListener("keydown", function (event) {
        // Ako je game over onemogući pokretanje tipkama, samo klikom na gumb restart
        if (restartButton.style.display == "block") {
            return;
        }
        if (!startGameTimer) {
            // Ako igra još nije počela, postavi vrijeme početka
            startGameTimer = Date.now();
            gameOverElement.style.display = "none"; // Sakrij poruku "Game Over"
            overlayElement.style.display = "none";  // Ne prikazuj zatamljenu pozadinu

        }
        // Kreatnje rakete pomoću tipki, i rotacija u odredenom smjeru
        if (event.key === "ArrowUp") {
            player.y -= player.speed;
            player.rotation = 0;
        } else if (event.key === "ArrowDown") {
            player.y += player.speed;
            player.rotation = Math.PI; // Rotiraj za 180 stupnjeva
        } else if (event.key === "ArrowLeft") {
            player.x -= player.speed;
            player.rotation = -Math.PI / 2; // Rotiraj za 90 stupnjeva u smjeru suprotnom kazaljki na satu
        } else if (event.key === "ArrowRight") {
            player.x += player.speed;
            player.rotation = Math.PI / 2; // Rotiraj za 90 stupnjeva u smjeru kazaljke na satu
        }

        // Provjeri jesu li koordinate igrača izvan granica Canvasa
        checkBounds();
    });

    // Funkcija za provjeru granica igrača i pomicanje na suprotnu stranu ako je potrebno
    function checkBounds() {
        if (player.x > c.width) {
            player.x = 0; // Vrati igrača na lijevu stranu ekrana
        } else if (player.x < 0) {
            player.x = c.width; // Vrati igrača na desnu stranu ekrana
        }

        if (player.y > c.height) {
            player.y = 0; // Vrati igrača na gornju stranu ekrana
        } else if (player.y < 0) {
            player.y = c.height; // Vrati igrača na donju stranu ekrana
        }
    }

    // Generiranje slučajnih asteroida izvan ekrana
    var asteroids = [];
    var numAsteroids = 10; // Broj asteroida koji će se generirati

    for (var i = 0; i < numAsteroids; i++) {
        var side = Math.floor(Math.random() * 4); // Odaberi stranu (0, 1, 2 ili 3)
        var x, y, speedX, speedY;
        movingOfAsteroids(side, x, y, speedX, speedY);
        asteroids.push({ x: x, y: y, speedX: speedX, speedY: speedY });
    }

    function movingOfAsteroids(side) {
        if (side === 0) { // Gornja strana
            x = Math.random() * c.width;
            y = -80;
            speedX = (Math.random() - 0.5) * 2;
            speedY = Math.random() * 2 + 1;
        } else if (side === 1) { // Desna strana
            x = c.width + 80;
            y = Math.random() * c.height;
            speedX = -Math.random() * 2 - 1;
            speedY = (Math.random() - 0.5) * 2;
        } else if (side === 2) { // Donja strana
            x = Math.random() * c.width;
            y = c.height + 80;
            speedX = (Math.random() - 0.5) * 2;
            speedY = -Math.random() * 2 - 1;
        } else if (side === 3) { // Lijeva strana
            x = -80;
            y = Math.random() * c.height;
            speedX = Math.random() * 2 + 1;
            speedY = (Math.random() - 0.5) * 2;
        }
    }

    setInterval(function () {
        for (var i = 0; i < 2; i++) {
            var side = Math.floor(Math.random() * 4);
            var x, y, speedX, speedY;
            movingOfAsteroids(side, x, y, speedX, speedY);
            asteroids.push({ x: x, y: y, speedX: speedX, speedY: speedY });
        }
    }, 5000);


    // Funkcija za crtanje asteroida
    function makeAsteroid(x, y) {
        ctx.drawImage(img, x, y, 80, 80);
    }

    // Pomakni asteroide prema vidljivom području i postavi ih izvan ekrana ako izađu
    function moveAsteroids() {
        asteroids.forEach(function (asteroid) {
            asteroid.x += asteroid.speedX;
            asteroid.y += asteroid.speedY;

            // Provjeri je li asteroid izašao izvan ekrana
            if (asteroid.x > c.width + 80 || asteroid.x < -80 || asteroid.y > c.height + 80 || asteroid.y < -80) {
                // Postavi ga izvan ekrana s nasumičnim položajem i brzinom
                asteroid.x = Math.random() < 0.5 ? -80 : c.width + 80;
                asteroid.y = Math.random() * c.height;
                asteroid.speedX = (Math.random() - 0.5) * 2;
                asteroid.speedY = (Math.random() - 0.5) * 2;
            }
        });
    }

    // Funkcija za crtanje svih objekata (asteroida i rakete)
    function makeObjects() {
        asteroids.forEach(function (asteroid) {
            makeAsteroid(asteroid.x, asteroid.y);
        });

        // Crtanje rakete
        makeRocket(player.x, player.y, player.rotation);
    }

    var stars = []; // Polje koje će sadržavati informacije o zvijezdama

    // Funkcija za generiranje zvijezda
    function makeStars() {
        for (var i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * c.width,
                y: Math.random() * c.height,
                speed: Math.random() * 2 + 1, // Brzina zvijezde
            });
        }
    }

    // Funkcija za crtanje zvijezda
    function drawStars() {
        ctx.fillStyle = "#ffffff"; // Bijela boja za zvijezde
        stars.forEach(function (star) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Funkcija za animaciju zvijezda
    function animateStars() {
        stars.forEach(function (star) {
            star.x += star.speed;
            if (star.x > c.width) {
                star.x = 0;
            }
        });
    }

    function updateTimer() {
        if (startGameTimer) {
            var currentTime = Date.now();
            var elapsedTime = currentTime - startGameTimer;
            var minutes = Math.floor(elapsedTime / (60 * 1000));
            var seconds = Math.floor((elapsedTime % (60 * 1000)) / 1000);
            var milliseconds = elapsedTime % 1000;
            timerElement.textContent = formatTime(minutes, seconds, milliseconds);

            if (gameOver) {
                var currentTime = elapsedTime;
                var bestTime = parseFloat(localStorage.getItem("bestTime"));

                // Promijeni najbolje vrijeme, ako nije do sad uneseno ili je trenutno bolje od najboljeg
                if (collision) {
                    if (!bestTime || currentTime > bestTime) {
                        setBestTime(currentTime);
                    }
                    collision = false;
                }

                // Formatiranje i prikazivanje trenutnog vremena
                var currentMinutes = Math.floor(currentTime / (60 * 1000));
                var currentSeconds = Math.floor((currentTime % (60 * 1000)) / 1000);
                var currentMilliseconds = currentTime % 1000;
                finalTimeElement.textContent = "Your Time: " + formatTime(currentMinutes, currentSeconds, currentMilliseconds);
                finalTimeElement.style.display = "block";

                // Formatiranje i prikazivanje najboljeg vremena
                var bestMinutes = Math.floor(parseFloat(localStorage.getItem("bestTime")) / (60 * 1000));
                var bestSeconds = Math.floor((parseFloat(localStorage.getItem("bestTime")) % (60 * 1000)) / 1000);
                var bestMilliseconds = parseFloat(localStorage.getItem("bestTime")) % 1000;
                bestTimeElement.textContent = "Best Time: " + formatTime(bestMinutes, bestSeconds, bestMilliseconds);
                bestTimeElement.style.display = "block";
            }

        }
    }

    // Funkcija za formatiranje vremena u obliku mm:ss.SSS
    function formatTime(minutes, seconds, milliseconds) {
        return (
            padNumber(minutes, 2) + ":" +
            padNumber(seconds, 2) + "." +
            padNumber(milliseconds, 3)
        );
    }

    // Funkcija za dodavanje nula ispred brojeva
    function padNumber(number, length) {
        var str = String(number);
        while (str.length < length) {
            str = "0" + str;
        }
        return str;
    }
    function playCollisionSound(volume = 0.2) {
        // Ako postoji zvuk
        if (collisionSound) {
            // Postavi jačinu zvuka i pusti zvuk sudara
            collisionSound.volume = volume;
            collisionSound.play();
        }
    }

    // Funkcija za detekciju kolizija
    function collisionOfAsteriodAndRocket() {
        asteroids.forEach(function (asteroid) {
            if (gameOverElement.style.display == "none") {
                // Detektiraj koliziju između rakete i asteroida
                var asteroidWidth = 80; // Širina asteroida
                var asteroidHeight = 80; // Visina asteroida
                var playerWidth = 50; // Širina rakete
                var playerHeight = 90; // Visina rakete

                // Dodatni uvjeti za smanjenje broja sudara
                var collisionDistance = 20; // Prag za koliziju
                if (
                    player.x < asteroid.x + asteroidWidth - collisionDistance &&
                    player.x + playerWidth > asteroid.x + collisionDistance &&
                    player.y < asteroid.y + asteroidHeight - collisionDistance &&
                    player.y + playerHeight > asteroid.y + collisionDistance

                ) {
                    collision = true;
                    updateTimer();
                    // Kolizija se dogodila
                    if (gameOverElement.style.display == "none") {
                        playCollisionSound();
                    }
                    startGameTimer = null; // Resetiraj vrijeme
                    gameOverElement.style.display = "block"; // Prikazi poruku "Game Over"
                    overlayElement.style.display = "block"; // Zatamni pozadinu
                    restartButton.style.display = "block";  // Dodaj gumb restart
                }
            }

        });
    }

    restartButton.addEventListener("click", function () {
        // Ponovno učitaj stranicu
        window.location.reload();

    });
    // Pokreni generiranje zvijezda
    makeStars();

    // Pokreni ažuriranje
    function update() {
        collision = false;
        ctx.clearRect(0, 0, c.width, c.height);
        drawStars();
        animateStars();
        moveAsteroids();
        checkBounds();
        collisionOfAsteriodAndRocket();
        makeObjects();
        updateTimer();
        requestAnimationFrame(update);
    }

    // Pokreni ažuriranje
    update();
});
