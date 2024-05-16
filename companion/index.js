import { me as companion } from "companion";
import * as messaging from "messaging";

let authToken = "";

if (!companion.permissions.granted("access_internet")) {
    console.error("We're not allowed to access the internet!");
}

async function postHeartRate(api, data) {
    return fetch(api, {
        method: "POST",
        headers: {
            "accept": "*/*",
            "Content-type": "application/json",
            "Authorization": "Bearer " + authToken
        },
        body: JSON.stringify(data)
    }).then((res) => {
        if (res.ok) {
            return data = {
                status: res.status,
                msg: "OK"
            };
        } else {
            return data = {
                status: res.status,
                msg: "Error"
            };
        }
    }).catch((err) => {
        console.error(err);
        return data = {
            status: err,
            msg: "Error"
        };
    });
}

async function login(api, watchKey) {
    const data = {
        status: "",
        msg: ""
    }

    return fetch(api, {
        method: "POST",
        headers: {
            "accept": "*/*",
            "Content-type": "application/json",
        },
        body: JSON.stringify({ token: watchKey })
    }).then(async (res) => {
        const result = await res.text();
        if (res.ok) {
            return data = {
                status: res.status,
                msg: JSON.parse(result).accessToken
            };
        } else if (res.status == 504) {
            return data = {
                status: res.status,
                msg: "Gateway Time-out"
            };
        } else {
            return data = {
                status: res.status,
                msg: JSON.parse(result)
            };
        }
    }).catch((err) => {
        console.error(err);
        return data = {
            status: err,
            msg: "Error"
        };
    });
}

messaging.peerSocket.addEventListener("message", async (evt) => {
    if (evt.data.login) {
        console.log("Login event received: " + evt.data.token);
        const res = await login("https://chillchaser.ovh/api/watch/login", evt.data.token);
        
        // Setting authToken to the received value
        authToken = res.msg;
        messaging.peerSocket.send(res);
    } else {
        const res = await postHeartRate("https://chillchaser.ovh/api/DataCollection/heartRate", evt.data);
        console.log(`Post ${JSON.stringify(evt.data)} ${res.status} ${res.msg}`);
        messaging.peerSocket.send(res);
    }
});