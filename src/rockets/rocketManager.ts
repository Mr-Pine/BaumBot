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

let launchesUpcoming: {[id: string]: Launch};

export async function execute(interaction: any, client: Discord.Client, topArgs: { options: { name: string, value: any }[], name: string }[]) {
    const subCommand = topArgs[0].name
    const args = topArgs[0].options

    switch (subCommand) {
        case "launches":

        let idArg = args ? args.find(arg => arg.name == `id`) : undefined

        if(typeof idArg === "undefined"){
            if (typeof launchesUpcoming === "undefined") {
                const launchLibraryJSON = await getAPIData(`${endpoints.LL2.Launches}upcoming/?limit=6`)
                launchesUpcoming = {} as {[id: string]: Launch}

                launchLibraryJSON.results.forEach((launchJson: any) => {
                    let launch = new Launch(launchJson)
                    launchesUpcoming[launch.id] = launch
                });
            }

            (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: await createAPIMessage(interaction, getUpcomingEmbed(Object.values(launchesUpcoming)), client),
                }
            });
        } else {
            const id: string = idArg.value

            let launch = await getExtended(launchesUpcoming[id]);  //FIXME only working if previously got by getting previous launches

            (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: await createAPIMessage(interaction, launch.getEmbed(), client),
                }
            });
        }
    }
}