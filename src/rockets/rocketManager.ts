import * as Discord from "discord.js"
import { createAPIMessage } from "..";
import { Launch } from "./rocketlaunch";
import { getAPIData, getUpcomingEmbed, getExtended, endpoints } from "./rocketindex"

export const command = {
    data: {
        name: "rockets",
        description: "Get Launches, Rockets, etc",
        options: [
            {
                name: "launches",
                description: "Get Rocket launches, all or a specific",
                type: 1,
                options: [
                    {
                        name: "id",
                        description: "ID of a specific Launch",
                        type: 3,
                        required: false
                    },
                    {
                        name: "force",
                        description: "Force an update of the data",
                        type: 5,
                        required: false
                    }
                ]
            }
        ]
    }
}

export let allLaunches: { upcoming: string[], launches: { [id: string]: Launch } } = { upcoming: [], launches: {} };

export async function execute(interaction: any, client: Discord.Client, topArgs: { options: { name: string, value: any }[], name: string }[]) {
    const subCommand = topArgs[0].name
    const args = topArgs[0].options

    switch (subCommand) {
        case "launches":

            let idArg = args ? args.find(arg => arg.name == `id`) : undefined
            let forceArg = args ? args.find(arg => arg.name == `force`) : undefined
            let force = typeof forceArg == "undefined" ? false : forceArg.value;

            if (typeof idArg === "undefined") {

               

                const launchLibraryJSON = await getAPIData(`${endpoints.LL2.Launches}upcoming/?limit=6`)
                allLaunches.upcoming = [] as string[];

                (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5
                    }
                });

                if((launchLibraryJSON.detail as string)?.startsWith("Request was throttled")) {
                    await (client as any).api.webhooks(client.user?.id, interaction.token).messages('@original').patch({
                        data: await createAPIMessage(interaction, "Please wait until available again...", client), //TODO accept old data
                    });
                    return;
                }

                for (let i = 0; i < launchLibraryJSON.results.length; i++) {
                    let launchJson = launchLibraryJSON.results[i]
                    if (typeof allLaunches.launches[launchJson.id] == "undefined") {
                        let launch = new Launch(launchJson)
                        launch.net = new Date("2021-04-23T23:00:00Z")
                        allLaunches.launches[launch.id] = launch
                        console.log("getting new data")
                    } else {
                        let result = await allLaunches.launches[launchJson.id].update(force, launchJson) //update with combined data from upcoming launches if forced

                        if(result === false) await (client as any).api.webhooks(client.user?.id, interaction.token).messages('@original').patch({data: await createAPIMessage(interaction, "please wait until available again", client)});

                        console.log("updating")
                    }
                    allLaunches.upcoming.push(launchJson.id)
                    console.log(`upcoming Launches: ${allLaunches.upcoming}`)
                };




                await (client as any).api.webhooks(client.user?.id, interaction.token).messages('@original').patch({
                    data: await createAPIMessage(interaction, await getUpcomingEmbed(Object.values(allLaunches.launches).filter(launch => allLaunches.upcoming.includes(launch.id))), client),
                });
            } else {
                const id: string = idArg.value;

                let launch = Object.keys(allLaunches.launches).includes(id) ? await getExtended(allLaunches.launches[id]) : await getExtended(id);
                await launch.update(force, undefined)
                allLaunches.launches[id] = launch;

                await (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: await createAPIMessage(interaction, launch.getEmbed(), client),
                    }
                });

                console.log("hi")
            }
    }
}