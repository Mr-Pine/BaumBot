import { Client, MessageEmbed, TextChannel } from "discord.js"
import fetch, { Headers } from "node-fetch"
import { LaunchExtended } from "./launchExtended"
import { LaunchSpaceX } from "./launchSpaceX"
import { Launch } from "./rocketlaunch"
import { allLaunches } from './rocketManager'

import * as starlink from "./starlink22.json"//DEBUG

export const endpoints = {
    "LL2": {
        "Launches": "https://ll.thespacedevs.com/2.2.0/launch/"
    }
}

export async function rocketTest(client: Client) {
    console.log("hello rocket")

    let spaceXJSON = starlink

    let spaceXLaunch = new LaunchSpaceX(starlink)
    await spaceXLaunch.initialized;

    allLaunches.launches[spaceXLaunch.id] = spaceXLaunch

    return true
}

export async function getAPIData(endpointURL: string) {
    let headers = new Headers([["Accept", "application/json"]])
    let response = await fetch(endpointURL, { method: "GET", headers: headers })
    let json = await response.json()
    return json;
}

export async function getExtended(id: string): Promise<LaunchExtended>;
export async function getExtended(launch: Launch | LaunchExtended): Promise<LaunchExtended>;
export async function getExtended(launchOrID: Launch | LaunchExtended | string) {

    if (launchOrID instanceof LaunchExtended) {
        if (launchOrID.sourceJSON.r_spacex_api_id != null && !(launchOrID instanceof LaunchSpaceX)) {
            let spaceXLaunch = launchOrID as LaunchSpaceX
            await spaceXLaunch.setSpaceXData(launchOrID.sourceJSON.r_spacex_api_id)
            return spaceXLaunch
        }
        //await launchOrID.update() //DEBUG
        return launchOrID
    }

    const extendedUrl = (typeof launchOrID !== "string") ? launchOrID.infoUrl : endpoints.LL2.Launches + launchOrID
    let json = await getAPIData(extendedUrl)

    if (json.r_spacex_api_id != null) {
        let spaceXLaunch = new LaunchSpaceX(json)

        //await spaceXLaunch.update() //DEBUG

        await spaceXLaunch.initialized
        return spaceXLaunch
    }

    let extendedLaunch = new LaunchExtended(json)
    //await extendedLaunch.update() //DEBUG

    return extendedLaunch;
}

export async function getUpcomingEmbed(launches: Launch[]) {
    let embed = new MessageEmbed()
        .setTitle("Upcoming Rocketlaunches")
        .setDescription("the 6 next rocket lauches")
        .setURL("https://everydayastronaut.com/prelaunch-previews/")
        .setColor(0xfca103)
        .setTimestamp(new Date());

    launches.forEach(async launch => {
        let fieldData = launch.embedField
        embed.addField(fieldData.name, fieldData.value, false)
    })

    return embed
}