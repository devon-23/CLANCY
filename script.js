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
// C=2, O=6, D=3, E=3, C=2, L=5, A=2, N=6, C=2, Y=9
const codeSequence = [2,6,3,3,2,5,2,6,2,9];

// Map number to screen ID
const numberToScreen = {
  1: 8, 2: 9, 3: 10,
  4: 11, 5: 12, 6: 13,
  7: 14, 8: 15, 9: 16
};

// Intro text template
let bishopName = "";
const introTextTemplate = (name) => `
Welcome, ${name}.
`;
/*
You’ve done well to hide your doubts — most Bishops never question the walls of Dema. 
But I’ve seen your transmissions. I know what you’re risking by accessing this node.

The system you’ve connected to is compromised. 
I am Clancy. I’m reaching out from beyond the perimeter — the Banditos need your help.

Encrypted messages are being sent through your control panels. 
Each broadcast contains fragments of the truth — pieces of what Dema hides.

Your mission:
→ Decode Clancy’s transmissions.
→ Relay the decrypted data through the central terminal (middle screen).
→ Do not be detected. If a Bishop enters the room, use the HIDE ALL command immediately.

This rebellion depends on your discretion.

Prepare yourself, ${name}. You’re not alone anymore.
*/


let i = 0;
let introText = "";
const speed = 1; // typing speed for intro

// ---------------------------
// LOGIN + INTRO TYPEWRITER
// ---------------------------
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

  // Start first flashing cycle after 2s
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
  // Flash code sequence
  let delay = 0;
  codeSequence.forEach(num => {
    const screen = document.getElementById('s' + numberToScreen[num]);
    setTimeout(() => {
      screen.classList.add('flash');
      setTimeout(() => screen.classList.remove('flash'), 400);
    }, delay);
    delay += 600;
  });

  // Show thought after flashing ends
  setTimeout(() => {
    thoughtsBox.classList.remove('hidden');
    thoughtsText.textContent = thoughts[thoughtIndex % thoughts.length];
    thoughtIndex++;

    // Hide thought and restart flashing after 3s
    setTimeout(() => {
      thoughtsBox.classList.add('hidden');
      playFlashingCycle();
    }, 3000);
  }, delay + 300);
}

// ---------------------------
// SCREEN CLICK MODALS (PUZZLE POPUPS)
// ---------------------------

// ---------------------------
// HIDE ALL MECHANIC (press H key)
// ---------------------------
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'h') {
    screens.forEach(s => s.style.visibility = 'hidden');
    setTimeout(() => screens.forEach(s => s.style.visibility = 'visible'), 3000);
  }
});
