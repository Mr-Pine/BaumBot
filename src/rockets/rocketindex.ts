import { Client, MessageEmbed, TextChannel } from "discord.js"
import fetch, { Headers } from "node-fetch"
import { LaunchExtended } from "./launchExtended"
import { Launch } from "./rocketlaunch"

const endpoints = {
    "LL2": {
        "Launches": "https://ll.thespacedevs.com/2.0.0/launch/"
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

    client.channels.fetch("704275816598732840").then((botWiese) => {
        (botWiese as TextChannel).send(upcomingEmbed)
    })

    return true
}

async function getAPIData(endpointURL: string) {
    let headers = new Headers([["Accept", "application/json"]])
    let response = await fetch(endpointURL, { method: "GET", headers: headers })
    let json = await response.json()
    return json;
}

async function getExtended(launch: Launch) {
    let headers = new Headers([["Accept", "application/json"]])
    let response = await fetch(launch.infoUrl, { method: "GET", headers: headers })
    let json = await response.json()

    return new LaunchExtended(json)
}

function getUpcomingEmbed(launches: Launch[]) {
    let embed = new MessageEmbed()
        .setTitle("Upcoming Rocketlaunches")
        .setDescription("the 5 next rocket lauches")
        .setURL("https://everydayastronaut.com/prelaunch-previews/")
        .setColor(0xfca103)
        .setTimestamp(new Date());

    launches.forEach(launch => {
        let fieldData = launch.embedField
        embed.addField(fieldData.name, fieldData.value, false)
    })

    return embed
}