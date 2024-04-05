import * as document from "document";
import * as messaging from "messaging";
import { HeartRateSensor } from "heart-rate";
import { me as appbit } from "appbit";

if (!appbit.permissions.granted("access_heart_rate")) {
    console.log("We're not allowed to read a users' heart rate!");
}

messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("Connection opened");
});

messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`Connection error: ${err.code} - ${err.message}`);
})

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
        sendHeartRateData(hrm.heartRate);
    });
    hrm.start();
} else {
    console.log("This device does not have a HeartRateSeonsor!");
}