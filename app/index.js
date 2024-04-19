import * as document from "document";
import * as messaging from "messaging";
import { getRandomValues } from "crypto";
import { HeartRateSensor } from "heart-rate";
import { clock } from "clock";
import { me as appbit } from "appbit";

let sendingData = false;
let loggedIn = false;

if (!appbit.permissions.granted("access_heart_rate")) {
    console.log("We're not allowed to read a users' heart rate!");
}

messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("Connection opened");
});

messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`Connection error: ${err.code} - ${err.message}`);
})

messaging.peerSocket.addEventListener("message", (evt) => {
    console.error("Data from companion received");
    if (evt.data.status == 200) {
        console.error("Logged in: " + evt.data.status + " " + evt.data.authToken);
    } else {
        console.error("Not logged in: " + evt.data.status);
    }
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

function formatTime(date, clock = false) {
    let year = date.getFullYear();
    let month = date.getMonth();
    let day = date.getDate();
    let hours = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();

    if (month < 10) {
        month = `0${month}`;
    }

    if (day < 10) {
        day = `0${day}`;
    }

    if (hours < 10) {
        hours = `0${hours}`;
    }

    if (mins < 10) {
        mins = `0${mins}`;
    }

    if (secs < 10) {
        secs = `0${secs}`;
    }

    if (clock) {
        return `${hours}:${mins}:${secs}`;
    }

    return `${year}-${month}-${day} ${hours}:${mins}:${secs}`;
}

// Clock
clock.granularity = "seconds";

const clockElement = document.getElementById("clock");
let today;

clock.addEventListener("tick", (evt) => {
    today = evt.date;
    if (loggedIn) { clockElement.text = formatTime(today, true); }
});


// Heart Rate
function sendHeartRateData(heartRate) {
    const data = {
        dateTime: formatTime(today),
        heartRate: heartRate
    }
    
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data);
    }
}

const element = document.getElementById("heartRate");

if (HeartRateSensor) {
    const hrm = new HeartRateSensor({ frequency: 1});
    hrm.addEventListener("reading", () => {
        if (!loggedIn) {
            element.text = randomKey();
        } else {
            element.text = hrm.heartRate;
            if (sendingData) { sendHeartRateData(hrm.heartRate); };
        }
    });
    hrm.start();
} else {
    console.log("This device does not have a HeartRateSeonsor!");
}

// Toggle data transfer
const buttonElement = document.getElementById("dataToggle");
const backgroundElement = document.getElementById("background");
const statusElement = document.getElementById("status");

buttonElement.addEventListener("click", (evt) => {
    if (loggedIn) {
        sendingData = !sendingData;
        
        if (sendingData) {
            backgroundElement.style.fill = "green";
            statusElement.text = "Transmitting data"
        } else {
            backgroundElement.style.fill = "red";
            statusElement.text = "Tab to send data"
        }
    }
})

// Toggle login button
const loginButtonElement = document.getElementById("loginButton");

loginButtonElement.addEventListener("click", (evt) => {
    const data = {
        login: true,
        key: randomKey()
    }

    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
        messaging.peerSocket.send(data);
    }
    
    loggedIn = true;
    backgroundElement.style.fill = "red";
    loginButtonElement.style.display = "none";
})