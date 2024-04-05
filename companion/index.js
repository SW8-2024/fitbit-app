import { me as companion } from "companion";
import * as messaging from "messaging";

if (!companion.permissions.granted("access_internet")) {
    console.log("We're not allowed to access the internet!");
}

function postHeartRate(api, data) {
    fetch(api, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data)
    }).then((res) => {
        if (res.ok) {
            res.text().then(text => console.log(text))
        } else {
            console.log("error")
        }
    })
}

function getData(api) {
    fetch(api, {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        }
    }).then((res) => {
        if (res.ok) {
            res.text().then(text => console.log(text))
        } else {
            console.log("error")
        }
    })
}

messaging.peerSocket.addEventListener("message", (evt) => {
    console.error(JSON.stringify(evt.data));
    //postHeartRate("https://localhost:8080/api/data/heart-rate", evt.data)
    getData("https://rickandmortyapi.com/api/character/1")
});