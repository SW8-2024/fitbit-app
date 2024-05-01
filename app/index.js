import * as document from "document";
import * as messaging from "messaging";
import { getRandomValues } from "crypto";
import { HeartRateSensor } from "heart-rate";
import { clock } from "clock";
import { me as appbit } from "appbit";

const backgroundElement = document.getElementById("background");
const statusElement = document.getElementById("status");

const clockElement = document.getElementById("clock");
const heartRateElement = document.getElementById("heartRate");

const buttonElement = document.getElementById("dataToggle");
const loginButtonElement = document.getElementById("loginButton");

let sendingData = false;
let loggedIn = false;
let loginWait = false;
let token = "";

const sleep = ms => new Promise(r => setTimeout(r, ms));

if (!appbit.permissions.granted("access_heart_rate")) {
    console.log("We're not allowed to read a users' heart rate!");
}

messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("Connection opened");
})

messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`Connection error: ${err.code} - ${err.message}`);
})

messaging.peerSocket.addEventListener("message", async (evt) => {
    console.error("Data from companion received");
    if (evt.data.status == 200) {
        loggedIn = true;
        console.error("Logged in: " + evt.data.status + " " + evt.data.msg);
    } else {
        loggedIn = false;
        console.error("Not logged in: " + evt.data.status + " " + evt.data.msg);
    }

    loginWait = false;
})

function randomKey() {
    let key = new Uint16Array(1);
    getRandomValues(key);

    key = Number(key).toString();
    if (key.length != 5) { 
        return randomKey(); 
    }

    return key;
}

function formatTime(date) {
    let hours = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();

    if (hours < 10) {
        hours = `0${hours}`;
    }

    if (mins < 10) {
        mins = `0${mins}`;
    }

    if (secs < 10) {
        secs = `0${secs}`;
    }

    return `${hours}:${mins}:${secs}`;
}

// Clock
clock.granularity = "seconds";
clock.addEventListener("tick", (evt) => {
    if (loggedIn) { clockElement.text = formatTime(evt.date); }
});

// Heart Rate
function sendHeartRateData(heartRate) {
    let dateTimeNow = new Date();

    const data = {
        bpm: heartRate,
        dateTime: new Date(dateTimeNow.getTime() - (dateTimeNow.getTimezoneOffset() * 60000)).toISOString()
    }
    
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data);
    }
}

if (HeartRateSensor) {
    const hrm = new HeartRateSensor({ frequency: 1});
    hrm.addEventListener("reading", () => {
        if (!loginWait) { token = randomKey(); }

        if (!loginWait && !loggedIn) {
            heartRateElement.text = token;
            loginButtonElement.style.display = "inline";
        } else if (loginWait && !loggedIn) {
            heartRateElement.text = token;
            loginButtonElement.style.display = "none";
            statusElement.text = "Write key in app to pair.."
        } else {
            heartRateElement.text = hrm.heartRate;
            if (sendingData) {
                sendHeartRateData(hrm.heartRate); 
            } else {
                backgroundElement.style.fill = "red";
                statusElement.text = "Tab to send data";
            }
        }
    });

    hrm.start();

} else {
    console.log("This device does not have a HeartRateSeonsor!");
}

// Toggle data transfer
buttonElement.addEventListener("click", (evt) => {
    if (loggedIn) {
        sendingData = !sendingData;
        
        // Keep for responsiveness 
        if (sendingData) {
            backgroundElement.style.fill = "green";
            statusElement.text = "Transmitting data";
        } else {
            backgroundElement.style.fill = "red";
            statusElement.text = "Tab to send data"
        }
    }
})

// Toggle login button
loginButtonElement.addEventListener("click", async (evt) => {
    const data = {
        login: true,
        token: token
    }

    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        loginWait = true;
        messaging.peerSocket.send(data);
    }
})