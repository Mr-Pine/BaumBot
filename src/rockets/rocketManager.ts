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
                    }
                ]
            }
        ]
    }
}

let allLaunches: {upcoming: string[], launches: {[id: string]: Launch}} =  {upcoming: [], launches: {}};

export async function execute(interaction: any, client: Discord.Client, topArgs: { options: { name: string, value: any }[], name: string }[]) {
    const subCommand = topArgs[0].name
    const args = topArgs[0].options

    switch (subCommand) {
        case "launches":

        let idArg = args ? args.find(arg => arg.name == `id`) : undefined

        if(typeof idArg === "undefined"){
            if (allLaunches.upcoming.length < 1) {
                const launchLibraryJSON = await getAPIData(`${endpoints.LL2.Launches}upcoming/?limit=6`)
                allLaunches.upcoming = [] as string[];

                launchLibraryJSON.results.forEach((launchJson: any) => {
                    let launch = new Launch(launchJson)
                    allLaunches.launches[launch.id] = launch
                    allLaunches.upcoming.push(launch.id)
                });
            }

            (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: await createAPIMessage(interaction, getUpcomingEmbed(Object.values(allLaunches.launches).filter(launch => allLaunches.upcoming.includes(launch.id))), client),
                }
            });
        } else {
            const id: string = idArg.value

            let launch = Object.keys(allLaunches.launches).includes(id) ? await getExtended(allLaunches.launches[id]) : await getExtended(id);
            allLaunches.launches[id] = launch;

            (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: await createAPIMessage(interaction, launch.getEmbed(), client),
                }
            });
        }
    }
}