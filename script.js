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

const phaseTwoThoughts = [
  "Now I'm connected to Clancy's transmission directly...",
  "Each of these screens will flash when an incoming encrypted message is sent.",
  "When you solve it, go back to the center screen.",
  "Let's help the Banditos relay messages to the rest of the Banditos and not get caught by a Bishop~",
  "Let's wait for the first message..."
];

let phaseTwoIndex = 0;

// Central Terminal
const centerScreen = document.getElementById('screen4');
const centerTerminal = document.getElementById('center-terminal');
const terminalPassword = document.getElementById('terminal-password');
const terminalLoginBtn = document.getElementById('terminal-login-btn');
const terminalMessage = document.getElementById('terminal-message');
const terminalClose = document.getElementById('terminal-close');
const hideButton = document.getElementById('button');
let centerpuzzle = true;

// Phase 2 terminal elements
const phase2Terminal = document.getElementById('phase2-terminal');
const phase2Output = document.getElementById('terminal-output');
const phase2Close = document.getElementById('phase2-terminal-close');

let screen3Unlocked = false;
let screen3Connected = false;
let screen3Flashing = false;

let phase3Unlocked = false;
let phase3Active = false;
let currentBanditoName = "";

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
// HIDE ALL MECHANIC
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

// Open central terminal
centerScreen.addEventListener('click', () => {
  if (phase3Unlocked && !phase3Active) {
    openPhase3Terminal(currentBanditoName);
    return;
  }

  if (!centerpuzzle) return; 
  pauseFlashing();
  centerTerminal.classList.remove('hidden');
  terminalPassword.value = "";
  terminalMessage.textContent = "";
});

// Close central terminal
terminalClose.addEventListener('click', () => {
  centerTerminal.classList.add('hidden');
  resumeFlashing();
});

// Validate password
terminalLoginBtn.addEventListener('click', () => {
  const pw = terminalPassword.value.trim().toLowerCase();
  if (pw === "s") {
    terminalMessage.textContent = "Welcome, an urgent message from Clancy is being transmitted…\nStand by for further messages.";
    terminalMessage.style.color = "#00ffcc";

    setTimeout(() => {
      centerTerminal.classList.add('hidden');
      centerpuzzle = false;
      flashingPaused = true;
      flashingTimeouts.forEach(timeout => clearTimeout(timeout));
      flashingTimeouts = [];

      thoughtsBox.classList.remove('hidden');
      thoughtsText.textContent = "I can't let any Bishop know what I'm doing here, helping Clancy… I'll be a glorious gone. When they come in, hit the red button at the top right to hide all the screens.";

      hideButton.classList.add('flash-red');
      setTimeout(() => {
        thoughtsBox.classList.add('hidden');
        hideButton.classList.remove('flash-red');
      }, 10000);
    }, 2500);

    startPhaseTwo();
  } else {
    terminalMessage.textContent = "Incorrect password!";
    terminalMessage.style.color = "#ff5555";
  }
});

// Shuffle helper
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

hideButton.addEventListener('click', () => {
  const shuffledImages = shuffleArray(screenTempImages);
  allScreens.forEach((id, index) => {
    const screen = document.getElementById(id);
    const overlayImg = document.createElement('img');
    overlayImg.src = `assets/` + shuffledImages[index];
    overlayImg.style.position = 'absolute';
    overlayImg.style.inset = '0';
    overlayImg.style.width = '100%';
    overlayImg.style.height = '100%';
    overlayImg.style.objectFit = 'cover';
    overlayImg.style.zIndex = '500';
    screen.appendChild(overlayImg);

    setTimeout(() => overlayImg.remove(), 5000);
  });
});

// ---------------------------
// PHASE 2 LOGIC
// ---------------------------
function startPhaseTwo() {
  function showNextThought() {
    if (phaseTwoIndex >= phaseTwoThoughts.length) {
      startFirstMessage();
      return;
    }
    thoughtsBox.classList.remove('hidden');
    thoughtsText.textContent = phaseTwoThoughts[phaseTwoIndex];
    phaseTwoIndex++;
    setTimeout(() => {
      thoughtsBox.classList.add('hidden');
      setTimeout(showNextThought, 500);
    }, 4000);
  }
  showNextThought();
}

function startFirstMessage() {
  const screen3 = document.getElementById('screen3');
  screen3.classList.add('incoming-flash');
  screen3Flashing = true;
  screen3Unlocked = true;
}

function generateBanditoName(name) {
  const suffixes = ['Shadow', 'Fox', 'Blade', 'Rogue', 'Echo'];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return name.split('').sort(() => Math.random() - 0.5).join('') + ' ' + randomSuffix;
}

function typePhase2Text(text, speed = 40, callback) {
  let i = 0;
  phase2Output.textContent = '';
  const interval = setInterval(() => {
    phase2Output.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, speed);
}

// ---------------------------
// SCREEN 3 CLICK: PHASE 2 LETTER
// ---------------------------
const screen3 = document.getElementById('screen3');
screen3.addEventListener('click', () => {
    if (!screen3Unlocked) return;
  if (screen3Flashing) {
    screen3.classList.remove('incoming-flash');
    screen3Flashing = false;
  }

  pauseFlashing();
  phase2Terminal.classList.remove('hidden');

  if (!screen3Connected) {
    // Generate Bandito name once
    currentBanditoName = generateBanditoName(bishopName);

    const messages = [
      `>connected as: ${bishopName}`,
      `>assigned bandito codename: ${currentBanditoName}`,
      `>connecting to Clancy...`,
      `>clancy: glad you're on our side now, bandito ${currentBanditoName}`,
      `>clancy: okay, here is what I need you to post to dmaorg.info`
    ];

    const letter = `
Dear Bandito,

Time tHey come wandering through the shadows, seeking what the night conceals.
Every trail you follow may hide a secret, but only those who look closely will see.
The whispers in the wind tell stories, some false, some true.
Keep your eyes open, your mind sharper than the sharpest edge.
Remember: sometimes guidance is not given by stars, but by what is hidden in plain sight.

Trust this well,
~Clancy
`;

    const answer = "THE COMPASS LIES";
    let htmlLetter = '';
    let answerIndex = 0;
    for (let char of letter) {
      if (char.toUpperCase() === answer[answerIndex]) {
        htmlLetter += `<span style="color:yellow;">${char}</span>`;
        answerIndex++;
        if (answerIndex >= answer.length) answerIndex = answer.length;
      } else {
        htmlLetter += char;
      }
    }

    phase2Output.textContent = '';
    let msgIndex = 0;

    function nextLine() {
      if (msgIndex >= messages.length) {
        phase2Output.innerHTML += `<br><br>${htmlLetter}`;
        screen3Connected = true;
        phase3Unlocked = true; // unlock Phase 3
        return;
      }
      typePhase2Text(messages[msgIndex], 40, () => {
        phase2Output.textContent += '\n';
        msgIndex++;
        setTimeout(nextLine, 500);
      });
    }
    nextLine();

  } else {
    // Subsequent times: just show letter
    const letter = `
Dear Bandito,

Time tHey come wandering through the shadows, seeking what the night conceals.
Every trail you follow may hide a secret, but only those who look closely will see.
The whispers in the wind tell stories, some false, some true.
Keep your eyes open, your mind sharper than the sharpest edge.
Remember: sometimes guidance is not given by stars, but by what is hidden in plain sight.

Trust this well,
~Clancy
`;
    const answer = "THE COMPASS LIES";
    let htmlLetter = '';
    let answerIndex = 0;
    for (let char of letter) {
      if (char.toUpperCase() === answer[answerIndex]) {
        htmlLetter += `<span style="color:yellow;">${char}</span>`;
        answerIndex++;
        if (answerIndex >= answer.length) answerIndex = answer.length;
      } else {
        htmlLetter += char;
      }
    }

    phase2Output.innerHTML = htmlLetter;
  }
});


phase2Close.addEventListener('click', () => {
  phase2Terminal.classList.add('hidden');
});

// ---------------------------
// PHASE 3 TERMINAL
// ---------------------------
function openPhase3Terminal(banditoName) {
  phase3Active = true;

  const overlay = document.createElement('div');
  overlay.className = 'terminal-overlay';
  overlay.innerHTML = `
    <div class="terminal phase3">
      <button id="phase3-close" style="position:absolute; top:5px; right:10px;">X</button>
      <pre id="phase3-output"></pre>
      <input id="phase3-input" type="text" placeholder="dmaorg.info> type your answer here..." autocomplete="off" />
    </div>
  `;
  document.body.appendChild(overlay);

  const output = overlay.querySelector('#phase3-output');
  const input = overlay.querySelector('#phase3-input');
  const close = overlay.querySelector('#phase3-close');

  output.textContent = `> Welcome back, Bandito ${banditoName}\n> Connecting to dmaorg.info...\n`;
  setTimeout(() => {
    output.textContent += `> Connection established [SECURE]\n\n`;
    output.textContent += `dmaorg.info> type your answer here...\n`;
    input.focus();
  }, 700);

  function normalizeAnswer(s) {
    return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ');
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const raw = input.value;
      const answer = normalizeAnswer(raw);
      if (!answer) return;

      output.textContent += `dmaorg.info> ${raw}\n`;
      input.value = "";

      const correct = "the compass lies";
      if (answer === correct) {
        setTimeout(() => {
          output.textContent += `> Transmission received.\n> Clancy: You solved it — the compass lies. Good work, Bandito ${banditoName}.\n> Proceed to the next transmission...\n`;
          //to do disabble that screen
        }, 700);
      } else {
        setTimeout(() => {
          output.textContent += `> system: Transmission rejected. Try again.\n`;
          input.focus();
        }, 400);
      }
    }
  });

  close.addEventListener('click', () => {
    overlay.remove();
    phase3Active = false;
  });
}

