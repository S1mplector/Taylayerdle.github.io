let songs = {
    /* 
    
        'Tim McGraw': {
        correctAnswer: 'Tim McGraw',
        layers: {
            bass: 'audio/tmg_bass.mp3',
            drums: 'audio/tmg_drums.mp3',
            guitar: 'audio/tmg_guitar.mp3',
            piano: 'audio/tmg_piano.mp3',
            vocals: 'audio/tmg_vocals.mp3',
            instrumental: 'audio/tmg_instrumental.mp3'
        },
        hint: 'Hint: It’s from the Album: Taylor Swift Deluxe Edition.',
    },
    'The Very First Night': {
        correctAnswer: 'The Very First Night',
        layers: {
            bass: 'audio/tvfn_bass.mp3',
            drums: 'audio/tvfn_drums.mp3',
            guitar: 'audio/tvfn_guitar.mp3',
            instrumental: 'audio/tvfn_instrumental.mp3',
            vocals: 'audio/tvfn_vocals.mp3',
        },
        hint: "Hint: Taylor Swift met this song's muse at the 2012 choice awards.",
    },
    
    */
   
   'End Game': {
       acceptableAnswers: ['End Game', 'end game', 'eg'],
       layers: {
           bass: 'audio/rep/endgame/eg_bass.wav',
           drums: 'audio/rep/endgame/eg_drums.wav',
           instrumental: 'audio/rep/endgame/eg_instrumental.wav',
           vocals: 'audio/rep/endgame/egfull.mp3'
       }
   },

    '...Ready For It?': {
        /* correctAnswer: '...Ready For It?', */
        acceptableAnswers: ['...Ready For It?', 'ready for it', 'rfi'],
        layers: {
            drums: 'audio/rep/rfi/rfi_drums.wav',
            bass: 'audio/rep/rfi/rfi_bass.wav',
            synth: 'audio/rep/rfi/rfi_synth.wav',
            vocals: 'audio/rep/rfi/rfi_vocals.mp3'
        }
    },

    'I Did Something Bad': {
        /* correctAnswer: '...Ready For It?', */
        acceptableAnswers: ['I Did Something Bad', 'i did something bad', 'idsb'],
        layers: {
            drums: 'audio/rep/idsb/idsb_drums_final.wav',
            bass: 'audio/rep/idsb/idsb_drums+bass_final.wav',
            synth: 'audio/rep/idsb/idsb_synth_final.wav',
            vocals: 'audio/rep/idsb/idsb_vocals.mp3'
        }
    },


    // Add more songs here
};

let currentSong = null;
let timeElapsed = 0;
let timerInterval = null; // to store the timer interval
let hintGiven = false;
let timerStarted = false; // tracks if the timer has already started
let layersRevealed = 0;
let currentAudio = null; // track the currently playing audio
let revealedLayers = []; // store the revealed layers

// Starts a new song round
function startSong(songName) {
    currentSong = songs[songName];
    hintGiven = false;
    layersRevealed = 0;
    revealedLayers = []; // reset the revealed layers
    resetTimer();
    document.getElementById('scoreDisplay').style.display = 'none';
    document.getElementById('nextLayerButton').disabled = false;
    document.getElementById('hintText').textContent = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('audioButtons').innerHTML = '';
    /* document.getElementById('revealScoreSection').style.display = 'none'; // Hide the reveal score button */
    revealNextLayer();
    generateAudioButtons();

    // Only the first layer revealed at start
}

function normalizeString(str) {
    return str.toLowerCase().replace(/[\s\W_]+/g, '');
}
// Old
/* 
function generateAudioButtons(layers) {
    const audioButtonsDiv = document.getElementById('audioButtons');
    audioButtonsDiv.innerHTML = '';  // Clear previous buttons
    
    revealedLayers.forEach((instrument) => {
        const audioFile = currentSong.layers[instrument];
        const button = document.createElement('button');
        button.classList.add('btn-17');
        button.innerHTML = `
        <span class="text-container">
        <img src="icons/${instrument}.png" alt="${instrument} icon" class="button-icon">
        Play ${capitalizeFirstLetter(instrument)}
        `;
        button.addEventListener('click', () => {
            playLayer(audioFile);
            if (!timerStarted) {  // Start the timer only on the first button click
                startTimer();
                timerStarted = true;
            }
        });
        audioButtonsDiv.appendChild(button);
    });
}
*/
// Generates the audio buttons based on revealed layers
function generateAudioButtons() {
    const audioButtonsDiv = document.getElementById('audioButtons');
    audioButtonsDiv.innerHTML = '';  // Clear previous buttons

    Object.keys(currentSong.layers).forEach((instrument) => {
        const audioFile = currentSong.layers[instrument];
        const button = document.createElement('button');
        button.classList.add('btn-17', 'layer-button');

        if (revealedLayers.includes(instrument)) {
            button.classList.add('revealed');
            button.disabled = false;
        } else {
            button.classList.add('locked');
            button.disabled = true;
        }

        button.innerHTML = `
            <span class="text-container">

            <img src="icons/${instrument}.png" alt="${instrument} icon" class="button-icon">

            Play ${capitalizeFirstLetter(instrument)}
        `;

        // Store the instrument name in a data attribute for later reference
        button.dataset.instrument = instrument;

        // Add the event listener regardless, but only play if revealed
        button.addEventListener('click', () => {
            if (button.classList.contains('revealed')) {
                playLayer(audioFile);
                if (!timerStarted) {
                    startTimer();
                    timerStarted = true;
                }
            }
        });

        audioButtonsDiv.appendChild(button);
    });
}



// Reveal the next layer
/* 
function revealNextLayer() {
    const layerNames = Object.keys(currentSong.layers);
    if (layersRevealed < layerNames.length) {
        revealedLayers.push(layerNames[layersRevealed]);
        layersRevealed++;
        generateAudioButtons(currentSong.layers);
    } else {
        document.getElementById('feedback').textContent = 'All layers revealed!';
        document.getElementById('nextLayerButton').disabled = true; // Disable the button
    }
}
*/

function revealNextLayer() {
    const layerNames = Object.keys(currentSong.layers);
    if (layersRevealed < layerNames.length) {
        const instrument = layerNames[layersRevealed];
        revealedLayers.push(instrument);
        layersRevealed++;

        // Update the corresponding button
        const button = document.querySelector(`.layer-button[data-instrument="${instrument}"]`);
        if (button) {
            button.classList.remove('locked');
            button.classList.add('revealed');
            button.disabled = false;

            // Optionally, add a smooth transition effect
            setTimeout(() => {
                button.classList.add('fade-in');
            }, 10);
        }

        // Update the feedback or other UI elements if necessary
    } else {
        document.getElementById('feedback').textContent = 'All layers revealed!';
        document.getElementById('nextLayerButton').disabled = true;
    }
}



// Play a specific layer and stop the current one if playing
function playLayer(audioFile) {
    if (currentAudio) {
        currentAudio.pause(); // Stop the current audio if any is playing
    }
    currentAudio = new Audio(audioFile);
    currentAudio.play();
}

// Capitalize instrument names
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Start the timer when a button is clicked
function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        document.getElementById('timer').textContent = formatTime(timeElapsed);
    }, 1000);
}

// Function to reset the timer and display
function resetTimer() {
    clearInterval(timerInterval);
    timeElapsed = 0;
    timerStarted = false;  // Reset the timer start status
    document.getElementById('timer').textContent = '00:00';

    if (currentAudio) {
        currentAudio.pause();  // Stop any audio that might still be playing
    }
}

// Format the time into minutes and seconds
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// Define scoring thresholds
function calculateScore(time, layersRevealed, hintUsed) {
    let score = 100; // Start with a base score of 100

    // Deduct points based on time taken
    if (time <= 30) {
        score -= 0;
    } else if (time <= 60) {
        score -= 10;
    } else if (time <= 90) {
        score -= 20;
    } else if (time <= 120) {
        score -= 30;
    } else {
        score -= 50;
    }

    // Deduct points for revealing layers
    score -= layersRevealed * 10; // 10 points deducted per layer revealed

    // Deduct points for using a hint
    if (hintUsed) {
        score -= 20; // Deduct 20 points if hint is used
    }

    // Convert the numerical score to a letter grade
    if (score >= 90) {
        return 'A+';
    } else if (score >= 80) {
        return 'A';
    } else if (score >= 70) {
        return 'B+';
    } else if (score >= 60) {
        return 'B';
    } else if (score >= 50) {
        return 'C+';
    } else if (score >= 40) {
        return 'C';
    } else if (score >= 30) {
        return 'D+';
    } else if (score >= 20) {
        return 'D';
    } else if (score >= 10) {
        return 'E+';
    } else if (score >= 0) {
        return 'E';
    } else {
        return 'F';
    }
}

// Function to display the score when the "Reveal Score" button is clicked

function revealScore() {
    const score = calculateScore(timeElapsed, layersRevealed, hintGiven);
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
    document.getElementById('scoreDisplay').style.display = 'block'; // Show the score
}
 


// Show the "Reveal Score" button after the game ends
/*
function showRevealScoreButton() {
    document.getElementById('revealScoreSection').style.display = 'block'; // Show the button
}
*/

// Attach event listener to the "Reveal Score" button
/*
document.getElementById('revealScoreButton').addEventListener('click', revealScore);
*/



// Submit guess logic - reveal the score button after the guess is correct
document.getElementById('submitGuess').addEventListener('click', (e) => {
    e.preventDefault();

    let guessInput = document.getElementById('guessInput');
    let guess = normalizeString(guessInput.value.trim());

    let isCorrect = currentSong.acceptableAnswers.some(answer => {
        return normalizeString(answer) === guess;
    });

    if (isCorrect) {
        clearInterval(timerInterval);
        /* document.getElementById('feedback').textContent = `Correct! You guessed it in ${formatTime(timeElapsed)}.`; */

        if (currentAudio) {
            currentAudio.pause();
        }

        // Automatically calculate and display the score
        const score = calculateScore(timeElapsed, layersRevealed, hintGiven);
        document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
        document.getElementById('scoreDisplay').style.display = 'block';

        // Clear the input field
        guessInput.value = '';

    } else {
        // Add the shake effect to the input field
        guessInput.classList.add('shake');

        // Remove the shake class after animation ends
        guessInput.addEventListener('animationend', function handler() {
            guessInput.classList.remove('shake');
            guessInput.removeEventListener('animationend', handler);
        });
    }
});




document.getElementById('hintButton').addEventListener('click', () => {
    if (!hintGiven) {
        document.getElementById('hintText').textContent = currentSong.hint; // Display the hint
        hintGiven = true;
        timeElapsed += 10;  // Penalize for using hint by adding 10 seconds to the timer
    }
});

// When the user gives up, automatically set the score to F and show the "Reveal Score" button
document.getElementById('giveUpButton').addEventListener('click', () => {
    resetTimer();
    if (currentAudio) {
        currentAudio.pause(); // Stop the current audio if playing
    }
    document.getElementById('feedback').textContent = 'You gave up!';

    // Automatically set the score to F
    document.getElementById('scoreDisplay').textContent = 'Score: F';
    document.getElementById('scoreDisplay').style.display = 'block'; // Show the score
    showRevealScoreButton(); // Show the "Reveal Score" button
});

// Move to the next song
document.getElementById('nextSong').addEventListener('click', () => {
    const songNames = Object.keys(songs);
    const randomSong = songNames[Math.floor(Math.random() * songNames.length)];
    startSong(randomSong);
});

// Attach the event listener to the Next Layer button
document.getElementById('nextLayerButton').addEventListener('click', () => {
    revealNextLayer();
    // Update score display logic can be added here if required during gameplay
});

// Start the game with the first song
startSong('End Game'); 
