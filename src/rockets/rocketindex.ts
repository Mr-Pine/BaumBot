import fetch, { Headers } from "node-fetch"
import { Launch } from "./rocketlaunch"

const endpoints = {
    "LL2": {
        "Launches": "https://ll.thespacedevs.com/2.0.0/launch/"
    }
}

export async function rocketTest(){
    console.log("hello rocket")

    const launches = await getAPIData(`${endpoints.LL2.Launches}upcoming/`)

    var launch = new Launch(launches.results[0])

    return launch
}

async function getAPIData(endpointURL: string){
    let headers = new Headers([["Accept", "application/json"]])
    let response = await fetch(endpointURL, {method: "GET", headers: headers})
    let json = await response.json()
    return json;
}