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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function login(api) {
    const data = {
        status: "",
        authToken: ""
    }

    await sleep(1000); // simulate time to response 
    return fetch(api, {
        method: "GET",
        headers: {
            "Content-type": "application/json"
        }
    }).then(async (res) => {
        if (res.ok) {
            const result = await res.text();
            return data = {
                status: res.status,
                authToken: JSON.parse(result).name
            };
        } else {
            return data = {
                status: res.status,
                authToken: ""
            };
        }
    })
}

messaging.peerSocket.addEventListener("message", async (evt) => {

    if (evt.data.login) {
        console.error("Login event received");
        console.error("Loging key: " + evt.data.key);
        const res = await login("https://rickandmortyapi.com/api/character/1");
        messaging.peerSocket.send(res);
    } else {
        console.error("Data event received");
        console.error(JSON.stringify(evt.data));
        //postHeartRate("https://localhost:8080/api/data/heart-rate", evt.data)
        //getData("https://rickandmortyapi.com/api/character/1")
    }
});