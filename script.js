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

const phaseTwoThoughts = [ // for testing
  "Now I'm connected to Clancy's transmission directly...",
  "Each of these screens will flash when an incoming encrypted message is sent.",
  "When you solve it, go back to the center screen.",
 "Beware of Nico - when you hear footsteps hit the red button in the top right to hide the screens.",
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

//compass lies code
let screen3Unlocked = false; //testing purposs
let screen3Connected = false;
let screen3Flashing = false;

let phase3Unlocked = false;
let phase3Active = false;
let currentBanditoName = "";

let phase4Active = false; //testing purposes

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
const introTextTemplate = (name) => //`Welcome, ${name}.`;
/* testing purposes */
`Welcome, ${name}.

You’ve done well to hide your doubts — most Bishops never question the walls of Dema. 
But I’ve seen your transmissions. I know what you’re risking by accessing this node.

The system you’ve connected to is compromised. 
I am Clancy. I’m reaching out from beyond the city walls — the Banditos need your help.

Encrypted messages are being sent through your control panels. 
Each broadcast contains fragments of the truth — pieces of what Dema hides.

Your mission:
→ Decode Clancy’s transmissions.
→ Relay the decrypted data through the central terminal (middle screen).
→ Do not be detected. If a Bishop enters the room, hit the red button immediately.

This rebellion depends on your discretion.

Prepare yourself, ${name}. You’re not alone anymore.
`;

// ---------------------------
// LOGIN + INTRO TYPEWRITER
// ---------------------------
let i = 0;
let introText = "";
const speed = 25; // typing speed for intro

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
  if (pw === "s" || pw === "code clancy" || pw == "codeclancy") {
    terminalMessage.textContent = "Welcome, an urgent message from Clancy is being transmitted…\nStand by for further messages.";
    terminalMessage.style.color = "#00ffcc";

    setTimeout(() => {
      centerTerminal.classList.add('hidden');
      centerpuzzle = false;
      flashingPaused = true;
      flashingTimeouts.forEach(timeout => clearTimeout(timeout));
      flashingTimeouts = [];

      thoughtsBox.classList.remove('hidden');
      //thoughtsText.textContent = "I can't let any Bishop know what I'm doing here, helping Clancy… I'll be a glorious gone.";

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
   triggerBishop(); // testing purposes
}

function generateBanditoName(name) {
  const suffixes = ['Ned', 'Sai', 'Blade', 'Rogue', 'Echo'];
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
// SCREEN 3 CLICK: PHASE 2 LETTER --> first puzzle , 
// ---------------------------
// ---------------------------
// SCREEN 3 CLICK: PHASE 2 LETTER (The Compass Lies)
// ---------------------------
const screen3 = document.getElementById('screen3');
screen3.addEventListener('click', () => {
  if (!screen3Unlocked) return;
  if (screen3Flashing) {
    screen3.classList.remove('incoming-flash');
    screen3Flashing = false;
  }

  pauseFlashing();

  // Create overlay terminal (matching Phase 4 aesthetic)
  const overlay = document.createElement('div');
  overlay.className = 'terminal-overlay';
  overlay.innerHTML = `
    <div class="terminal phase3">
      <button id="phase2-close" style="position:absolute; top:5px; right:10px;">X</button>
      <pre id="phase2-output"></pre>
    </div>
  `;
  document.body.appendChild(overlay);

  const output = overlay.querySelector('#phase2-output');
  const close = overlay.querySelector('#phase2-close');

  // Generate bandito name once
  if (!screen3Connected) {
    currentBanditoName = generateBanditoName(bishopName);

    const messages = [
      `>connected as: ${bishopName}`,
      `>assigned bandito codename: ${currentBanditoName}`,
      `>connecting to Clancy...`,
      `>clancy: glad you're on our side now, bandito ${currentBanditoName}`,
      `>clancy: okay, here is what I need you to decrypt and post to dmaorg.info`
    ];

    const letter = `
${currentBanditoName},

Time tHey come wandering through the shadows, seeking what the night conceals.
Every trail you follow may hide a secret, but only those who look closely will see.
The whispers in the wind tell stories, some false, some true.
Keep your eyes open, your mind sharper than the sharpest edge.
Remember: sometimes guidance is not given by stars, but by what is hidden in plain sight.

Trust this well.

Always,
- Clancy
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

    output.textContent = '';
    let msgIndex = 0;

    function typePhase2Text(line, speed, callback) {
      let i = 0;
      const interval = setInterval(() => {
        output.textContent += line[i];
        i++;
        if (i >= line.length) {
          clearInterval(interval);
          if (callback) callback();
        }
      }, speed);
    }

    function nextLine() {
      if (msgIndex >= messages.length) {
        output.innerHTML += `<br><br>${htmlLetter}`;
        screen3Connected = true;
        phase3Unlocked = true; // unlock next phase
        return;
      }
      typePhase2Text(messages[msgIndex] + '\n', 40, () => {
        msgIndex++;
        setTimeout(nextLine, 500);
      });
    }
    nextLine();

  } else {
    // Subsequent times: just show letter
    const letter = `
${currentBanditoName},

Time tHey come wandering through the shadows, seeking what the night conceals.
Every trail you follow may hide a secret, but only those who look closely will see.
The whispers in the wind tell stories, some false, some true.
Keep your eyes open, your mind sharper than the sharpest edge.
Remember: sometimes guidance is not given by stars, but by what is hidden in plain sight.

Trust this well.

Always,
- Clancy
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
    output.innerHTML = htmlLetter;
  }

  // Close button behavior
  close.addEventListener('click', () => {
    overlay.remove();
  });
});

///

phase2Close.addEventListener('click', () => {
  phase2Terminal.classList.add('hidden');
});

// ---------------------------
// PHASE 3 TERMINAL answer terminal --->
// ---------------------------
function openPhase3Terminal(banditoName) { //edit here
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

      output.textContent += `${bishopName}> ${raw}\n`;
      input.value = "";

      const correct = "the compass lies";
      if (answer === correct) {
        setTimeout(() => {
          output.textContent += `> Transmission received.\n> Clancy: You solved it — the compass lies. Good work, Bandito ${banditoName}.\n> decoding full letter...\n> uploading to dmaorg.info/found/15398642_14/clancy.html...\n> upload complete. entire decrypted letter:\n> Banditos,
    The Bishops don’t want you to find your way out of the city walls.  
    They built their maps on deceit, twisted the stars, rewired the directions.  
    Every path they mark leads back to them.

    You must change your compass.

    From now on, east is up.  
    What was north is now behind you.  
    Don’t trust what the needle says — trust what *you* feel pulling you forward.

    There’s something waiting beyond the barriers,  
    something they don’t want you to see.  
    Keep moving. Keep questioning. Keep listening.

    We’re almost there.

    ~ Clancy\n`;
          screen3Unlocked = false;
          //to do, not allow 'the compass lies' to be an answer anymore
          // to do function() to trigger next phase, screen 5 flash etc
          setTimeout(() => {
            //overlay.remove();
            startPhaseFour();
          }, 2000);
        }, 700);
      } else if (answer == "vulture" || answer == "vultures") {
        setTimeout(() => {
          output.textContent += `> Transmission received.\n> Clancy: You solved it — the vultures are circling inside the city. Good work, Bandito ${banditoName}. The rest of the Banditos will now know how the Bishops are watching them. You taught them to stay out of the watchful eyes of the vultures.\n> decoding full letter...\n> uploading to dmaorg.info/found/15398642_14/clancy.html...\n> upload complete. entire decrypted letter:\n> 
Banditos,
I’ve learned how they see us. The Bishops didn’t build Dema alone
— they grew eyes for it.\n
They hover in silence, watching for those who stray too close to the walls. 
Their gaze feeds the Nine.
Their sight feeds the city. Every movement you make, 
every path you trace through the dust, is seen before you even take it.
Stay low. Move only when the sky is blind.
The Vultures roost atop the tallest towers and along the edges of Dema’s veins.
Their purpose isn’t to protect — it’s to report.
They’ve seen our attempts before, but this time, we’ll move like shadows.
Change your routes. Disrupt their sightlines.
When they can’t see us, they can’t stop us.

Always,

Clancy
\n`;
          phase4Active = false;
          //to do, not allow 'the compass lies' to be an answer anymore
          // to do function() to trigger next phase, screen 5 flash etc
          setTimeout(() => {
            //overlay.remove();
            startPhaseFive();
          }, 2000);
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

// ---------- Bishop / footsteps mechanic ----------
let bishopTimer = null;
let bishopActive = false;
let bishopResponseTimeout = null;
let bishopListener = null;
let autoHideThoughtTimer = null;

// showThought/hideThought helpers using your existing DOM
function showThought(text, noAutoHide = false) {
  clearTimeout(autoHideThoughtTimer);
  thoughtsBox.classList.remove('hidden');
  thoughtsText.textContent = text;
  if (!noAutoHide) {
    autoHideThoughtTimer = setTimeout(() => {
      hideThought();
    }, 3000);
  }
}

function hideThought() {
  clearTimeout(autoHideThoughtTimer);
  thoughtsBox.classList.add('hidden');
  thoughtsText.textContent = '';
}

// call this to schedule a bishop event (random 10-30s)
function triggerBishop() {
  // cancel any previous bishop timer
  if (bishopTimer) {
    clearTimeout(bishopTimer);
    bishopTimer = null;
  }

  const delay = Math.floor(Math.random() * (3000 - 1000 + 1)) + 10000; // 10-30s
  bishopTimer = setTimeout(() => {
    // Bishop arriving
    bishopActive = true;

    // show footsteps thought (don't auto-hide — wait for response)
    showThought('*footsteps*', true);

    // visually flash the hide button
    hideButton.classList.add('flash-red');

    // Start the 3s response window
    bishopResponseTimeout = setTimeout(() => {
      if (bishopActive) { // Player failed to click in time
        bishopActive = false;
        hideButton.classList.remove('flash-red');
        startLoseSequence();

        // CLEANUP: remove special listener (if any)
        if (bishopListener) {
          hideButton.removeEventListener('click', bishopListener);
          bishopListener = null;
        }
      }
    }, 5000);

    // Add a one-time click listener to the hide button for this bishop event
    bishopListener = () => {
      if (!bishopActive) return;
      // Player clicked in time — success
      bishopActive = false;
      clearTimeout(bishopResponseTimeout);
      hideButton.classList.remove('flash-red');
      showThought('Good job — they didn\'t see you.', false);

      // remove this listener immediately (one-time)
      hideButton.removeEventListener('click', bishopListener);
      bishopListener = null;

      triggerBishop();
    };

    hideButton.addEventListener('click', bishopListener);

  }, delay);
}

function cancelBishop() {
  if (bishopTimer) clearTimeout(bishopTimer);
  if (bishopResponseTimeout) clearTimeout(bishopResponseTimeout);
  if (bishopListener) hideButton.removeEventListener('click', bishopListener);
  bishopTimer = null;
  bishopResponseTimeout = null;
  bishopListener = null;
  bishopActive = false;
  hideButton.classList.remove('flash-red');
  hideThought();
}

// ---------- You Lose Sequence ----------
    function startLoseSequence() {
        cancelBishop(); // stop any other bishop timers
        pauseFlashing();
        let screen3Unlocked = false;
        let phase3Unlocked = false;
        let centerpuzzle = false;

        // to do make everything on screen disabled, no clicking, maybe dim background
        const dialogue = [
        { speaker: "Nico", text: "What are you doing?!" },
        { speaker: "You", text: "Uh… nothing!" },
        { speaker: "Nico", text: "Don't lie to me, Bishop. I’ve seen enough." },
        { speaker: "You", text: "Wait—Nico, please—" },
        { speaker: "Nico", text: "You’re done. The Bishops were right about you." },
        { speaker: "System", text: "*signal lost...*" }
        ];
    
        let index = 0;
    
        function showNextLine() {
        if (index >= dialogue.length) {
            // Dialogue done — show YOU LOSE screen
            showLoseOverlay();
            return;
        }
    
        const line = dialogue[index];
        showThought(`${line.speaker}: ${line.text}`, true);
        index++;
    
        setTimeout(showNextLine, 2500); // delay between dialogue lines
        }
    
        showNextLine();
    }
    
    function showLoseOverlay() {
        const overlay = document.createElement("div");
        overlay.className = "lose-overlay";
        overlay.innerHTML = `
        <div class="lose-box">
            <h1>YOU LOSE</h1>
            <p>The Bishops have caught you.</p>
            <p>Try again?</p>
            <button id="retry-btn">always</button>
        </div>
        `;
        document.body.appendChild(overlay);
    
        const retry = overlay.querySelector("#retry-btn");
        retry.addEventListener("click", () => {
        location.reload(); // refresh and restart game
        });
    }
  
 // ======================
// INTERACTIVE ITEM LOGIC
// ======================

    let itemThoughts = {
        dragon: [
        "Cool dragon.",
        "His name is Trash.",
        "I wonder where he came from...",
        "Feels like he’s watching me.",
        "I feel inspired by him.",
        "He has a best friend named Clifford.",
        "Clancy would always say he helped write the album."
        ],
        book: [
        "Ah yes, the guide book of Vialism.",
        "A bunch of propaganda.",
        "I shouldn't let the bishops hear me say that...",
        "Can't believe I used to think this was for the greater good...",
        "I don't even want to hold it..."
        ],
        sai: [
        "Scaled and Icy, wonderful album Clancy created.",
        "I remember watching him write the lyrics.",
        "My favorite is Mullberry Street.",
        "Most of the bishops think 'Scaled and Icy' means 'Scaled back and Isolated'... but clancy told me otherwise.",
        "There's a hidden anagram in the title. It was the first message I solved for the banditos."
        ],
        mug: [
        "Just a mug.",
        "The bishops are only allowed to drink black coffee.",
        "Such an optomistic message for a dull city...",
        "Maybe I should wash it... or not.",
        "We are not allowed to bring this mug home, it's too colorful.",
        "I'm finally starting to see yellow again."
        ],
        lavalamp: [
        "A lava lamp. Still glowing.",
        "The wax moves hypnotically.",
        "Almost looks like it’s forming letters...",
        "Can it see me too?"
        ]
    };
    
    // Track click counts to cycle through different thoughts
    let itemClickCounts = {};
    
    // Reusable function to set up interactive items
    function setupInteractiveItem(itemId, imagePath) {
        const item = document.getElementById(itemId);
        if (!item) return;
    
        item.style.cursor = "pointer";
    
        item.addEventListener("click", () => {
        const count = itemClickCounts[itemId] || 0;
        const thoughts = itemThoughts[itemId] || ["..."];
        const thoughtText = thoughts[count % thoughts.length];
    
        // Create popup overlay
        const overlay = document.createElement("div");
        overlay.classList.add("item-overlay");
        overlay.innerHTML = `
            <div class="item-popup">
            <img src="${imagePath}" alt="${itemId}" class="item-image" />
            <div class="item-thought">${thoughtText}</div>
            <button class="close-item">×</button>
            </div>
        `;
        document.body.appendChild(overlay);
    
        overlay.querySelector(".close-item").addEventListener("click", () => {
            overlay.remove();
        });
    
        itemClickCounts[itemId] = count + 1;
        });
    }
    
    // Initialize all items once DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
        setupInteractiveItem("dragon", "assets/dragon.png");
        setupInteractiveItem("book", "assets/book.png");
        setupInteractiveItem("sai", "assets/sai.png");
        setupInteractiveItem("mug", "assets/mug.png");
        setupInteractiveItem("lavalamp", "assets/lavalamp.png");
    });

  function startPhaseFour() {
    phase4Active = true;
    const screen5 = document.getElementById('screen5');
    if (!screen5) return;
  
    // Flash red to signal new phase
    screen5.classList.add('incoming-flash');
    screen5Flashing = true;
  
    screen5.addEventListener('click', () => {
      if (!screen5Flashing) return;
      screen5.classList.remove('incoming-flash');
      screen5Flashing = false;
      openPhase4Terminal(currentBanditoName);
    }, { once: true });
  }
  
  function openPhase4Terminal(banditoName) {
    phase4Active = true;
  
    const overlay = document.createElement('div');
    overlay.className = 'terminal-overlay';
    overlay.innerHTML = `
      <div class="terminal phase3">
        <button id="phase3-close" style="position:absolute; top:5px; right:10px;">X</button>
        <pre id="phase3-output"></pre>
      </div>
    `;
    document.body.appendChild(overlay);
  
    const output = overlay.querySelector('#phase3-output');
    const input = overlay.querySelector('#phase3-input');
    const close = overlay.querySelector('#phase3-close');
  
    output.textContent = `clancy> Good work, Bandito ${banditoName}\n`;
    setTimeout(() => {
      output.textContent += `clancy> the citizens are moving east, back towards the city walls\n\n`;
      output.textContent += `clancy> here's your next encrypted message...\n`;
      output.textContent += `${currentBanditoName},

          You’ve moved through the fog unseen before, but the air grows heavier now.
        
          They see when you arrive.
        
          Eyes in the sky that do not blink, lenses dressed in feathers of black.
          The watchers linger where light fades — above walls, on rusted wire, near the city’s edge.
        
          Surveillance is outside.
          The creature that watches you is the answer.
        
          Be careful what looks down upon you.
        
          Always,

          - Clancy\n`;
      input.focus();
    }, 700);
  
    close.addEventListener('click', () => {
      overlay.remove();
      //phase4Active = false;
    });
  }
  
  screen5.addEventListener('click', () => {
    if (!phase4Active) return;
    startPhaseFour()
  })