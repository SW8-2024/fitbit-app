import * as document from "document";
import * as messaging from "messaging";
import { HeartRateSensor } from "heart-rate";
import { clock } from "clock";
import { me as appbit } from "appbit";

let sendingData = false;

if (!appbit.permissions.granted("access_heart_rate")) {
    console.log("We're not allowed to read a users' heart rate!");
}

messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("Connection opened");
});

messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`Connection error: ${err.code} - ${err.message}`);
})

// Heart Rate
function sendHeartRateData(heartRate) {
    const data = {
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
        element.text = hrm.heartRate;
        if (sendingData) { sendHeartRateData(hrm.heartRate); };
    });
    hrm.start();
} else {
    console.log("This device does not have a HeartRateSeonsor!");
}

// Clock
clock.granularity = "seconds";

const clockElement = document.getElementById("clock");

clock.addEventListener("tick", (evt) => {
    const today = evt.date;
    const hours = today.getHours();
    const mins = today.getMinutes();
    const secs = today.getSeconds();
    clockElement.text = `${hours}:${mins}:${secs}`;
});

// Toggle data transfer
const buttonElement = document.getElementById("dataToggle");
const backgroundElement = document.getElementById("background");
const statusElement = document.getElementById("status");

buttonElement.addEventListener("click", (evt) => {
    sendingData = !sendingData;

    if (sendingData) {
        backgroundElement.style.fill = "green";
        statusElement.text = "Transmitting data"
    } else {
        backgroundElement.style.fill = "red";
        statusElement.text = "Tab to send data"
    }
})