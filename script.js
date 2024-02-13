const audioFileInput = document.getElementById("audio_file");
const audioPlayer = document.getElementById("audio_player");
const playlist = document.getElementById("playlist");
const nextButton = document.getElementById("nextButton");
const previousButton = document.getElementById("previousButton");
const progressBar = document.getElementById("progressBar");

let currentIndex = 0;
let playlistFiles = [];

// load local files
audioFileInput.addEventListener("change", function(event) {
    var files = this.files;
    var file = URL.createObjectURL(files[0]); 
    audioPlayer.src = file; 
    audioPlayer.play();
});

// create playlist
audioFileInput.addEventListener("change", function(event) {
    playlist.innerHTML = ""; // Vide la liste de lecture à chaque fois que des fichiers sont sélectionnés

    const files = event.target.files;
    playlistFiles = files; // Stocke les fichiers de la playlist dans playlistFiles

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        addToPlaylist(file, i); // Ajoute chaque fichier à la liste de lecture
    }
});

// load a file and load a current title
function loadPlaylistItem(index) {
    currentIndex = index;
    loadCurrentAudio();
}

// Fonction pour ajouter un élément à la liste de lecture
function addToPlaylist(file, index) {
    const fileURL = URL.createObjectURL(file);

    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = file.name;
    link.href = fileURL;
    listItem.appendChild(link);
    playlist.appendChild(listItem);

    // Ajoute un gestionnaire d'événements de clic à l'élément ajouté
    listItem.addEventListener("click", function(event) {
        event.preventDefault(); // Empêche le comportement par défaut du lien
        loadPlaylistItem(index); // Charge le fichier audio et marque l'élément comme piste en cours de lecture
    });
}

// Play/Pause
function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseButton.src = "icon/pause_circle_white_24dp.svg";
    } else {
        audioPlayer.pause();
        playPauseButton.src = "icon/play_circle_outline_white_24dp.svg";
    }
}

const playPauseButton = document.getElementById("playPauseButton");
playPauseButton.addEventListener("click", togglePlayPause);

// repeat button
function repeat() {
    if (audioPlayer.loop === false) {
        audioPlayer.loop = true;
        repeatButton.src = "icon/repeat_one_on_white_24dp.svg";
    } else {
        audioPlayer.loop = false;
        repeatButton.src = "icon/repeat_white_24dp.svg";
    }
}

const repeatButton = document.getElementById("repeatButton");
repeatButton.addEventListener("click", repeat);

// next button
nextButton.addEventListener("click", function() {
    currentIndex++;
    if (currentIndex >= playlistFiles.length) {
        currentIndex = 0; // Si on dépasse la fin de la playlist, revenir au début
    }
    loadCurrentAudio();
});

// Bouton "previous" pour reculer dans la playlist
previousButton.addEventListener("click", function() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = playlistFiles.length - 1; // Si on est au début de la playlist, revenir à la fin
    }
    loadCurrentAudio();
});

// Fonction pour charger le fichier audio actuel et colorer visuellement la piste correspondante dans la playlist
function loadCurrentAudio() {
    const file = playlistFiles[currentIndex];
    const fileURL = URL.createObjectURL(file);
    audioPlayer.src = fileURL;
    audioPlayer.play();

    // Supprime la classe 'current-track' de tous les éléments de la playlist
    const playlistItems = document.querySelectorAll("#playlist li");
    playlistItems.forEach(item => {
        item.classList.remove("current-track");
    });

    // Ajoute la classe 'current-track' à l'élément correspondant dans la playlist
    const currentPlaylistItem = playlistItems[currentIndex];
    currentPlaylistItem.classList.add("current-track");
}

// Met à jour la valeur de la barre de progression en fonction de la lecture de l'audio
audioPlayer.addEventListener("timeupdate", function() {
    const progressBar = document.getElementById("progressBar");
    if (!isNaN(audioPlayer.duration) && isFinite(audioPlayer.duration)) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100; // Calcule le pourcentage de progression de l'audio
        progressBar.value = progress; // Met à jour la valeur de la barre de progression
    }
});


// Fonction pour se déplacer dans la musique en cliquant sur la barre de progression
function seek(event) {
    const progressBar = document.getElementById("progressBar");
    const rect = progressBar.getBoundingClientRect(); // Récupère les coordonnées de la barre de progression
    const offsetX = event.clientX - rect.left; // Calcule la position horizontale du clic par rapport à la barre de progression
    const progressBarWidth = rect.width; // Récupère la largeur de la barre de progression

    const seekPercentage = (offsetX / progressBarWidth) * 100; // Calcule le pourcentage de progression à partir de la position du clic
    const seekTime = (seekPercentage / 100) * audioPlayer.duration; // Calcule le temps de lecture correspondant

    audioPlayer.currentTime = seekTime; // Met à jour le temps de lecture de l'audio
}

//visualiser 2D
audioPlayer.addEventListener("play", () => {
    const contextAudio = new AudioContext();
    const src = contextAudio.createMediaElementSource(audioPlayer);
    const analyser = contextAudio.createAnalyser();
    const canvas = document.getElementById("canvas");
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    src.connect(analyser);
    analyser.connect(contextAudio.destination);
    analyser.fftSize = 1024;
    const frequenciesAudio = analyser.frequencyBinCount;
    const tableaufrequence = new Uint8Array(frequenciesAudio);
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const largeurBarre = (WIDTH / tableaufrequence.length) + 2;
    let hauteurBarre;
    let x;
    
    function retourneBarres() {
        requestAnimationFrame(retourneBarres);
        x = 0;
        analyser.getByteFrequencyData(tableaufrequence);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        
        for(let i = 0; i < frequenciesAudio; i++){
            hauteurBarre = tableaufrequence[i];
            let r = 250;
            let g = 50;
            let b = i;
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, HEIGHT, largeurBarre, -hauteurBarre);
            x += largeurBarre + 1;
        }
    }
    retourneBarres();
});

//tag ID3
document.querySelector('input[type="file"]').onchange = function(e) {
    var reader = new FileReader();

    reader.onload = function(e) {
        var arrayBuffer = e.target.result;
        var blob = new Blob([arrayBuffer]);
        var file = new File([blob], "filename.m4a");

        jsmediatags.read(file, {
            onSuccess: function(tag) {
                console.log(tag);
                // Afficher les métadonnées ID3 dans la console
                console.log("Titre: " + tag.tags.title);
                console.log("Artiste: " + tag.tags.artist);
                console.log("Album: " + tag.tags.album);
                console.log("Année: " + tag.tags.year);
                // Vous pouvez ajouter du code ici pour afficher les métadonnées dans votre interface utilisateur
                document.getElementById("title").textContent = tag.tags.title || "";
                document.getElementById("artist").textContent = tag.tags.artist || "";
                document.getElementById("album").textContent = tag.tags.album || "";
                document.getElementById("year").textContent = tag.tags.year || "";
                // Récupérer la pochette de l'album
                if (tag.tags.picture) {
                    var base64String = "";
                    for (var i = 0; i < tag.tags.picture.data.length; i++) {
                        base64String += String.fromCharCode(tag.tags.picture.data[i]);
                    }
                    var base64 = "data:" + tag.tags.picture.format + ";base64," + window.btoa(base64String);
                    console.log("Pochette de l'album: " + base64);
                    // Vous pouvez utiliser base64 pour afficher la pochette de l'album dans votre interface utilisateur
                    document.getElementById("albumArt").src = base64;
                }
            },
            onError: function(error) {
                console.log(':(', error.type, error.info);
            }
        });
    };

    reader.readAsArrayBuffer(this.files[0]);
};
