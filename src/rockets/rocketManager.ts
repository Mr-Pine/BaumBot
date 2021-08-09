import * as Discord from "discord.js"
import { createAPIMessage } from "..";
import { Launch } from "./rocketlaunch";
import { getAPIData, getUpcomingEmbed, getExtended, endpoints } from "./rocketindex"

export const command = {
        name: "rockets",
        description: "Get Launches, Rockets, etc",
        options: [
            {
                name: "launches",
                description: "Get Rocket launches, all or a specific",
                type: "SUB_COMMAND" as Discord.ApplicationCommandOptionType,
                options: [
                    {
                        name: "id",
                        description: "ID of a specific Launch",
                        type: "STRING" as Discord.ApplicationCommandOptionType,
                        required: false
                    },
                    {
                        name: "force",
                        description: "Force an update of the data",
                        type: "BOOLEAN" as Discord.ApplicationCommandOptionType,
                        required: false
                    }
                ]
            }
        ]
}

export let allLaunches: { upcoming: string[], launches: { [id: string]: Launch } } = { upcoming: [], launches: {} };

export async function execute(interaction: Discord.CommandInteraction, client: Discord.Client) {
    switch (interaction.options.getSubcommand()) {
        case "launches":

            let idArg = interaction.options.getString("id") || undefined
            let force = interaction.options.getBoolean("force") || false

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
                const id: string = idArg;

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