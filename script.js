// ---------------------------
// GLOBAL VARIABLES
// ---------------------------

// Screen mapping (keypad layout)
const keypadOrder = [8,9,10,11,12,13,14,15,16];
const keypadNumbers = {
  8: "1", 9: "2", 10: "3",
  11: "4", 12: "5", 13: "6",
  14: "7", 15: "8", 16: "9"
};

// “CODE CLANCY” → numbers using phone keypad
const codeSequence = [2,6,3,3,2,5,2,6,2,9];

// Map number to screen ID
const numberToScreen = {
  1: 8, 2: 9, 3: 10,
  4: 11, 5: 12, 6: 13,
  7: 14, 8: 15, 9: 16
};

// Central Terminal
const centerScreen = document.getElementById('screen4');
const centerTerminal = document.getElementById('center-terminal');
const terminalPassword = document.getElementById('terminal-password');
const terminalLoginBtn = document.getElementById('terminal-login-btn');
const terminalMessage = document.getElementById('terminal-message');
const terminalClose = document.getElementById('terminal-close');
const terminalHint = document.getElementById('terminal-hint');
const hideButton = document.getElementById('button');

// References to all screens
const allScreens = [
    'screen1','screen2','screen3','screen4','screen5','screen6','screen7',
    's8','s9','s10','s11','s12','s13','s14','s15','s16'
  ];
  
  // Map each screen to its own temporary image
  const screenTempImages = [
    'temp1.png','temp2.png','temp3.png','temp4.png','temp5.png','temp6.png','temp7.png',
    'temp8.png','temp9.png','temp10.png','temp11.png','temp12.png','temp13.png','temp14.png','temp15.png','temp16.png'
  ];
  

let flashingPaused = false;
let flashingTimeouts = []; // track all timeouts to pause/resume

// Intro text template
let bishopName = "";
const introTextTemplate = (name) => `
Welcome, ${name}.
`;

// ---------------------------
// LOGIN + INTRO TYPEWRITER
// ---------------------------
let i = 0;
let introText = "";
const speed = 1; // typing speed for intro

document.getElementById("login-btn").addEventListener("click", () => {
  const input = document.getElementById("user-name");
  bishopName = input.value.trim() || "Bishop";
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("intro-text").classList.remove("hidden");
  introText = introTextTemplate(bishopName);
  typeIntro();
});

function typeIntro() {
  if (i < introText.length) {
    document.getElementById("intro-text").textContent += introText.charAt(i);
    i++;
    setTimeout(typeIntro, speed);
  } else {
    document.getElementById("begin-btn").classList.remove("hidden");
  }
}

document.getElementById("begin-btn").addEventListener("click", () => {
  const introScreen = document.getElementById("intro-screen");
  introScreen.style.opacity = 0;
  setTimeout(() => {
    introScreen.style.display = "none";
    document.getElementById("controlRoom").style.display = "block";
    initKeypad();
  }, 1000);
});

// ---------------------------
// KEYPAD NUMBERS DISPLAY
// ---------------------------
function initKeypad() {
  keypadOrder.forEach(id => {
    const screen = document.getElementById("s" + id);
    screen.textContent = keypadNumbers[id];
  });

  setTimeout(playFlashingCycle, 2000);
}

// ---------------------------
// FLASHING CODE + THOUGHTS LOOP
// ---------------------------
const thoughtsBox = document.getElementById('thoughts-box');
const thoughtsText = document.getElementById('thoughts-text');
const thoughts = [
  "That's a weird flashing… wonder what it means…",
  "Do we think Clancy is trying to tell us something?",
  "Maybe the middle screen has the answer…"
];
let thoughtIndex = 0;

function playFlashingCycle() {
  if (flashingPaused) return;

  let delay = 0;
  codeSequence.forEach(num => {
    const screen = document.getElementById('s' + numberToScreen[num]);
    const t1 = setTimeout(() => {
      screen.classList.add('flash');
      const t2 = setTimeout(() => screen.classList.remove('flash'), 400);
      flashingTimeouts.push(t2);
    }, delay);
    flashingTimeouts.push(t1);
    delay += 600;
  });

  const tThought = setTimeout(() => {
    if (!flashingPaused) {
      thoughtsBox.classList.remove('hidden');
      thoughtsText.textContent = thoughts[thoughtIndex % thoughts.length];
      thoughtIndex++;
      const tHide = setTimeout(() => {
        thoughtsBox.classList.add('hidden');
        playFlashingCycle();
      }, 3000);
      flashingTimeouts.push(tHide);
    }
  }, delay + 300);
  flashingTimeouts.push(tThought);
}

// ---------------------------
// HIDE ALL MECHANIC (press H key)
// ---------------------------
const screens = document.querySelectorAll('.screen');
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'h') {
    screens.forEach(s => s.style.visibility = 'hidden');
    setTimeout(() => screens.forEach(s => s.style.visibility = 'visible'), 3000);
  }
});

// ---------------------------
// TERMINAL LOGIC
// ---------------------------

function pauseFlashing() {
  flashingPaused = true;
  flashingTimeouts.forEach(timeout => clearTimeout(timeout));
  flashingTimeouts = [];
}

function resumeFlashing() {
  flashingPaused = false;
  playFlashingCycle();
}

// Open terminal
centerScreen.addEventListener('click', () => {
  pauseFlashing();
  centerTerminal.classList.remove('hidden');
  terminalPassword.value = "";
  terminalMessage.textContent = "";
});

// Close terminal
terminalClose.addEventListener('click', () => {
  centerTerminal.classList.add('hidden');
  resumeFlashing();
});

// Validate password
// Validate password
terminalLoginBtn.addEventListener('click', () => {
    const pw = terminalPassword.value.trim().toLowerCase();
    if (pw === "code clancy") {
      // Show Clancy message
      terminalMessage.textContent = "Welcome, an urgent message from Clancy is being transmitted…\nStand by for further messages.";
      terminalMessage.style.color = "#00ffcc";
  
      setTimeout(() => {
        centerTerminal.classList.add('hidden');
  
        // Stop flashing permanently
        flashingPaused = true;
        flashingTimeouts.forEach(timeout => clearTimeout(timeout));
        flashingTimeouts = [];
  
        // Show special thoughts
        thoughtsBox.classList.remove('hidden');
        thoughtsText.textContent = "I can't let any Bishop know what I'm doing here, helping Clancy… I'll be a glorious gone. When they come in, hit the red button at the top right to hide all the screens.";
  
        // Start red flashing on the hide button
        hideButton.classList.add('flash-red');
  
        // Remove thoughts and stop red flashing after 7 seconds
        setTimeout(() => {
          thoughtsBox.classList.add('hidden');
          hideButton.classList.remove('flash-red');
        }, 12000);
  
      }, 2500);
  
    } else {
      terminalMessage.textContent = "Incorrect password!";
      terminalMessage.style.color = "#ff5555";
    }
  });
// Hint is automatically handled by the title attribute
// <span id="terminal-hint" title="Looks like a phone keypad...">[?]</span>

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  hideButton.addEventListener('click', () => {
    // Shuffle images
    const shuffledImages = shuffleArray(screenTempImages);
  
    allScreens.forEach((id, index) => {
        const screen = document.getElementById(id);
      
        // Create overlay image
        const overlayImg = document.createElement('img');
        overlayImg.src = `assets/` + shuffledImages[index];
        overlayImg.style.position = 'absolute';
        overlayImg.style.inset = '0';
        overlayImg.style.width = '100%';
        overlayImg.style.height = '100%';
        overlayImg.style.objectFit = 'cover';
        overlayImg.style.zIndex = '500';
        screen.appendChild(overlayImg);
        
        // Remove overlay after 5 seconds
        setTimeout(() => {
          overlayImg.remove();
        }, 5000);
      });
  });