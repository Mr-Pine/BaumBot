import { Client, MessageEmbed, TextChannel } from "discord.js"
import fetch, { Headers } from "node-fetch"
import { LaunchExtended } from "./launchExtended"
import { LaunchSpaceX } from "./launchSpaceX"
import { Launch } from "./rocketlaunch"

export const endpoints = {
    "LL2": {
        "Launches": "https://lldev.thespacedevs.com/2.0.0/launch/"
    }
}

export async function rocketTest(client: Client) {
    console.log("hello rocket")

    const launchLibraryJSON = await getAPIData(`${endpoints.LL2.Launches}upcoming/?limit=6`)

    let launches: Launch[] = []

    launchLibraryJSON.results.forEach((launchJson: any) => {
        launches.push(new Launch(launchJson))
    });

    let extended = await getExtended(launches[0])

    let upcomingEmbed = getUpcomingEmbed(launches)

    /* client.channels.fetch("704275816598732840").then((botWiese) => {
        (botWiese as TextChannel).send(upcomingEmbed)
    }) */

    let spaceXLaunch = new LaunchSpaceX("5eb87d42ffd86e000604b384")
    await spaceXLaunch.initialized;

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
    
    if(launchOrID instanceof LaunchExtended){
        return launchOrID
    }

    const extendedUrl = (typeof launchOrID !== "string") ? launchOrID.infoUrl : endpoints.LL2.Launches + launchOrID
    let json = await getAPIData(extendedUrl)

    return new LaunchExtended(json)
}

export function getUpcomingEmbed(launches: Launch[]) {
    let embed = new MessageEmbed()
        .setTitle("Upcoming Rocketlaunches")
        .setDescription("the 6 next rocket lauches")
        .setURL("https://everydayastronaut.com/prelaunch-previews/")
        .setColor(0xfca103)
        .setTimestamp(new Date());

    launches.forEach(launch => {
        let fieldData = launch.embedField
        embed.addField(fieldData.name, fieldData.value, false)
    })

    return embed
}