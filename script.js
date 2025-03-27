/*
███╗   ███╗ █████╗ ███╗   ███╗██╗   ██╗███╗   ██╗
████╗ ████║██╔══██╗████╗ ████║██║   ██║████╗  ██║
██╔████╔██║███████║██╔████╔██║██║   ██║██╔██╗ ██║
██║╚██╔╝██║██╔══██║██║╚██╔╝██║██║   ██║██║╚██╗██║
██║ ╚═╝ ██║██║  ██║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
                                          
    🚀 Created by: Mamun
    🔹 Project: Your Project Name
    🕒 Date: 2025-03-25
    📌 Description: Your Description Here
*/
/* ***************************************************Start Dynamic html*********************************************************** */
document.addEventListener("DOMContentLoaded", function () {
    const app = document.getElementById("app");
    
    // Login Container
    const loginContainer = document.createElement("div");
    loginContainer.classList.add("login-container");
    loginContainer.innerHTML = `
        <h2>Mamun Smart Home</h2>
        <div class="form-group">
            <i class="fas fa-envelope"></i>
            <input type="email" id="email" placeholder="Email">
        </div>
        <div class="form-group">
            <i class="fas fa-lock"></i>
            <input type="password" id="password" placeholder="Password">
        </div>
        <button onclick="login()">Log In</button>
    `;
    app.appendChild(loginContainer);

    // Control Panel
    const controlContainer = document.createElement("div");
     controlContainer.classList.add("container", "control-container", "hidden");
    controlContainer.innerHTML = `
        <div class="control-panel">
            <div class="status-panel">
                <h2>Smart Plug 2 with Blynk</h2>
                <div id="device-status" class="status-box">লোড হচ্ছে...</div>
            </div>
            <div class="header">
                <div class="clock">
                    <div class="time">
                        <span id="hours">12</span>:<span id="minutes">00</span>:<span id="seconds">00</span>
                        <div class="ampm" id="ampm">AM</div>
                    </div>
                </div>
                <button class="toggle-btn" onclick="toggleAll()">. . .</button>
            </div>
        </div>
    `;
    app.appendChild(controlContainer);

    // Function to create relay elements
    function createRelay(relayNumber) {
        const relayDiv = document.createElement("div");
        relayDiv.classList.add("device");
        relayDiv.id = `relay${relayNumber}`;
        relayDiv.innerHTML = `
            <h3>Relay ${relayNumber}</h3>
            <div class="slider-container">
                <label class="switch">
                    <input type="checkbox" id="relay${relayNumber}Switch" onchange="toggleRelay(${relayNumber})">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="timer-container">
                <div class="timer off" id="timer${relayNumber}">00:00</div>
                <input type="number" id="timeInput${relayNumber}" class="styled-input" placeholder="Minutes" min="1">
                <select id="actionSelect${relayNumber}" class="styled-select" onchange="updateButtonColor(${relayNumber})">
                    <option value="on">Turn ON</option>
                    <option value="off">Turn OFF</option>
                    <option value="reset">Reset Timer</option>
                </select>
                <button id="timerButton${relayNumber}" onclick="setTimer(${relayNumber})" class="styled-button-off">Set Timer</button>
            </div>
            <div class="alarm-container">
                <div id="countdownDisplay${relayNumber}" class="countdown-display">00:00:00</div>
                <input type="time" id="alarmTime${relayNumber}" class="styled-input">
                <select id="alarmAction${relayNumber}" class="styled-select">
                    <option value="on">Turn ON</option>
                    <option value="off">Turn OFF</option>
                    <option value="resetalarm">Reset Alarm</option>
                </select>
                <button id="setAlarm${relayNumber}" onclick="setAlarm(${relayNumber})" class="styled-button-off">Set Alarm</button>
            </div>
        `;
        controlContainer.appendChild(relayDiv);
    }
    
    // Create 4 relays
    for (let i = 1; i <= 4; i++) {
        createRelay(i);
    }
});
/* ***************************************************End Dynamic html *********************************************************** */

/* **************************************************Start Login function********************************************************** */

        // Dummy Login Credentials
        const validEmail = "afrinakhatun6037@gmail.com";
        const validPassword = "2323";

        // Login Function
        function login() {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (email === validEmail && password === validPassword) {
                document.querySelector(".login-container").classList.add("hidden");
                document.querySelector(".control-container").classList.remove("hidden");
                fetchRelayStates();
            } else {
                alert("Invalid email or password!");
            }
        }
/* **************************************************Start Login function********************************************************** */
/* ***************************************************Start checkNodeMCUStatus function************************************************************* */
const BLYNK_AUTH_TOKEN = "B3zGySOexKemlM6Sj_FV4w1Cw3PYPGi2"; // আপনার Blynk টোকেন


 function checkNodeMCUStatus() {
            const statusBox = document.getElementById("device-status");
            statusBox.textContent = "লোড হচ্ছে...";
            statusBox.className = "status-box loading";

            fetch(`https://blynk.cloud/external/api/isHardwareConnected?token=${BLYNK_AUTH_TOKEN}`)
                .then(response => response.text())
                .then(status => {
                    if (status.trim() === "true") {
                        statusBox.textContent = "Online ✅";
                        statusBox.className = "status-box online";
                    } else {
                        statusBox.textContent = "Offline ❌";
                        statusBox.className = "status-box offline";
                    }
                })
                .catch(error => {
                    console.error("স্ট্যাটাস আনতে সমস্যা হয়েছে:", error);
                    statusBox.textContent = "স্ট্যাটাস আনতে সমস্যা ❌";
                    statusBox.className = "status-box offline";
                });
        }

        
/* ***************************************************End checkNodeMCUStatus function************************************************************* */
/* *******************************************************Start toggleRelay function***************************************************************** */
// Toggle Relay Function using Blynk Virtual Pin
async function toggleRelay(relayNumber) {
    const relaySwitch = document.getElementById(`relay${relayNumber}Switch`);
    const isChecked = relaySwitch.checked; // Check if the switch is ON or OFF
    const newState = isChecked ? 1 : 0; // 1 for ON, 0 for OFF
    const virtualPin = `V${relayNumber}`; // Relay 1 = V1, Relay 2 = V2, etc.

    try {
        // Send state to Blynk Virtual Pin
        const response = await fetch(`https://blynk.cloud/external/api/update?token=${BLYNK_AUTH_TOKEN}&${virtualPin}=${newState}`);
        if (response.ok) {
            console.log(`Relay ${relayNumber} is now ${isChecked ? "ON" : "OFF"}`);
        } else {
            console.error(`Failed to update relay ${relayNumber}:`, response.statusText);
            alert(`Error: Could not update relay ${relayNumber}.`);
        }
    } catch (error) {
        console.error("Error while toggling relay:", error);
        alert("An error occurred while toggling the relay.");
    }
}

// Fetch Relay States from Blynk
async function fetchRelayStatesFromBlynk() {
    try {
        for (let i = 1; i <= 4; i++) { // Assuming 4 relays
            const virtualPin = `V${i}`;
            const response = await fetch(`https://blynk.cloud/external/api/get?token=${BLYNK_AUTH_TOKEN}&${virtualPin}`);
            const state = await response.text();
            const relaySwitch = document.getElementById(`relay${i}Switch`);
            relaySwitch.checked = state === "1"; // Update UI with Blynk state
        }
    } catch (error) {
        console.error("Failed to fetch relay states from Blynk:", error);
        alert("Could not fetch relay states.");
    }
}


/* *******************************************************End toggleRelay function***************************************************************** */
/* *******************************************************Start setTimer function***************************************************************** */
async function setTimer(relayNumber) {
    const timeInput = document.getElementById(`timeInput${relayNumber}`);
    const actionSelect = document.getElementById(`actionSelect${relayNumber}`);
    const timerDisplay = document.getElementById(`timer${relayNumber}`);
    const button = document.getElementById(`timerButton${relayNumber}`); // বাটনের রেফারেন্স

    const action = actionSelect.value;

  button.className = 'styled-button-on';
  
    if (action === "reset") {
        resetTimer(relayNumber);
   button.className = 'styled-button-off';
        return;
    }

    const minutes = parseInt(timeInput.value);
    if (isNaN(minutes) || minutes <= 0) {
        alert("Please enter a valid time!");
        return;
    }

    let timeLeft = minutes * 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, "0")}:00`;
    timerDisplay.classList.add("on");
    timerDisplay.classList.remove("off");


    const interval = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            timerDisplay.classList.remove("on");
            timerDisplay.classList.add("off");


            // Blynk API কল করে রিলে স্টেট পরিবর্তন
            toggleRelayWithBlynk(relayNumber, action === "on" ? 1 : 0);
            console.log(`Timer for relay ${relayNumber} completed. Action: ${action}`);
        }
        timeLeft--;
    }, 1000);

    timerDisplay.dataset.interval = interval;
}

async function resetTimer(relayNumber) {
    const timerDisplay = document.getElementById(`timer${relayNumber}`);
    const button = document.getElementById(`timerButton${relayNumber}`); // বাটন রেফারেন্স

    const existingInterval = timerDisplay.dataset.interval;
    if (existingInterval) {
        clearInterval(existingInterval);
    }

    timerDisplay.textContent = "00:00";
 ;

    console.log(`Timer for relay ${relayNumber} has been reset.`);
}

async function toggleRelayWithBlynk(relayNumber, newState) {
    const virtualPin = `V${relayNumber}`; // Relay 1 = V1, Relay 2 = V2, etc.

    try {
        const response = await fetch(`https://blynk.cloud/external/api/update?token=${BLYNK_AUTH_TOKEN}&${virtualPin}=${newState}`);
        if (response.ok) {
            console.log(`Relay ${relayNumber} updated to ${newState === 1 ? "ON" : "OFF"} via Blynk.`);
        } else {
            console.error(`Failed to update relay ${relayNumber}:`, response.statusText);
            alert(`Error: Could not update relay ${relayNumber}.`);
        }
    } catch (error) {
        console.error("Error while toggling relay:", error);
        alert("An error occurred while toggling the relay.");
    }
}
/* *******************************************************End setTimer function***************************************************************** */
/* *******************************************************Start setAlarm function***************************************************************** */
async function setAlarm(relayNumber) {
    const alarmTimeInput = document.getElementById(`alarmTime${relayNumber}`);
    const alarmActionSelect = document.getElementById(`alarmAction${relayNumber}`);
    const countdownDisplay = document.getElementById(`countdownDisplay${relayNumber}`);
    const alarmButton = document.getElementById(`setAlarm${relayNumber}`);

    const alarmTime = alarmTimeInput.value;
    const action = alarmActionSelect.value;

alarmButton.className = 'styled-button-on';

    if (action === "resetalarm") {
        resetAlarm(relayNumber);
    alarmButton.className = 'styled-button-off';
        return;
    }

    if (!alarmTime) {
        alert("Please set a valid alarm time!");
        return;
    }

    const alarmDate = new Date();
    const [hours, minutes] = alarmTime.split(":").map(Number);
    alarmDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (alarmDate <= now) {
        alert("Alarm time must be in the future!");
        return;
    }


    // Calculate remaining time
    const interval = setInterval(() => {
        const now = new Date();
        const timeLeft = alarmDate - now;

        if (timeLeft <= 0) {
            clearInterval(interval);
            countdownDisplay.textContent = "00:00:00";

            // Blynk API কল করে রিলে স্টেট পরিবর্তন
            toggleRelayWithBlynk(relayNumber, action === "on" ? 1 : 0);

         
            console.log(`Alarm for relay ${relayNumber} triggered. Action: ${action}`);
        } else {
            const hrs = String(Math.floor(timeLeft / 3600000)).padStart(2, "0");
            const mins = String(Math.floor((timeLeft % 3600000) / 60000)).padStart(2, "0");
            const secs = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0");
            countdownDisplay.textContent = `${hrs}:${mins}:${secs}`;
        }
    }, 1000);

    // Save interval ID for reset functionality
    countdownDisplay.dataset.interval = interval;

    console.log(`Alarm set for relay ${relayNumber} at ${alarmTime}, action: ${action}`);

}

async function resetAlarm(relayNumber) {
    const countdownDisplay = document.getElementById(`countdownDisplay${relayNumber}`);
    const alarmButton = document.getElementById(`setAlarm${relayNumber}`);

    const existingInterval = countdownDisplay.dataset.interval;
    if (existingInterval) {
        clearInterval(existingInterval); // Clear the existing timer
    }

    countdownDisplay.textContent = "--:--:--"; // Reset countdown display


    console.log(`Alarm for relay ${relayNumber} has been reset.`);
}

async function toggleRelayWithBlynk(relayNumber, newState) {
    const virtualPin = `V${relayNumber}`; // Relay 1 = V1, Relay 2 = V2, etc.

    try {
        const response = await fetch(`https://blynk.cloud/external/api/update?token=${BLYNK_AUTH_TOKEN}&${virtualPin}=${newState}`);
        if (response.ok) {
            console.log(`Relay ${relayNumber} updated to ${newState === 1 ? "ON" : "OFF"} via Blynk.`);
        } else {
            console.error(`Failed to update relay ${relayNumber}:`, response.statusText);
            alert(`Error: Could not update relay ${relayNumber}.`);
        }
    } catch (error) {
        console.error("Error while toggling relay:", error);
        alert("An error occurred while toggling the relay.");
    }
}
/* *******************************************************End setAlarm function***************************************************************** */
/* *******************************************************Start Clock function***************************************************************** */
 function updateClock() {
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            const ampmEl = document.getElementById('ampm');

            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;

            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
            ampmEl.textContent = ampm;
        }

       
/* *******************************************************End Clock function***************************************************************** */
/* ***************************************************Start Timer Alarm toggle function************************************************************* */

function toggleAll() { 
    let timers = document.querySelectorAll(".timer-container");
    let alarms = document.querySelectorAll(".alarm-container");
    let toggleBtn = document.querySelector(".toggle-btn");
    let controlPanel = document.querySelector(".control-panel");

    let isAlarmVisible = alarms[0].style.display !== "none"; // প্রথম অ্যালার্ম দৃশ্যমান কিনা চেক করা

    if (isAlarmVisible) {
        // যদি Alarm দেখা যায়, তাহলে তা Hide করে Timer দেখাও
        alarms.forEach(alarm => alarm.style.display = "none");
        timers.forEach(timer => timer.style.display = "flex");
        controlPanel.style.width = "1000px"; // Control Panel Width 1000px হবে
        toggleBtn.textContent = "Go to Alarm"; // বাটনের নাম পরিবর্তন
    } else {
        // যদি Timer দেখা যায়, তাহলে তা Hide করে Alarm দেখাও
        timers.forEach(timer => timer.style.display = "none");
        alarms.forEach(alarm => alarm.style.display = "flex");
        controlPanel.style.width = "1000px"; // Control Panel Width 1100px হবে
        toggleBtn.textContent = "Go to Timer"; // বাটনের নাম পরিবর্তন
    }
}

document.addEventListener("DOMContentLoaded", function () { 
    setTimeout(() => {
        toggleAll();
        updateClock();
        setInterval(updateClock, 1000);

        console.log("Fetching relay states from Blynk...");
        setInterval(fetchRelayStatesFromBlynk, 300); // 3 সেকেন্ডে একবার 

        console.log("Checking NodeMCU status...");
        checkNodeMCUStatus(); // প্রথমবার চেক করো
        setInterval(checkNodeMCUStatus, 60000); // 5 সেকেন্ডে একবার চেক করবে
    }, 100);
});

/* ***************************************************End Timer Alarm toggle function************************************************************* */

