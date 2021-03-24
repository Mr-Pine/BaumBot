import { APIMessage, Client, MessageEmbed, TextChannel } from "discord.js"

export const command = {
    data: {
        name: "Vote",
        description: "Mache eine Umfrage",
        options: [
            {
                name: "start",
                description: "Eine Umfrage starten",
                type: 1,
                options: [
                    {
                        name: "Name",
                        description: "Der Name der Umfrage",
                        type: 3,
                        required: true
                    },
                    {
                        name: "Option_1",
                        description: "Gib die erste Option für deine Umfrage ein",
                        type: 3,
                        required: true
                    }, {
                        name: "Option_2",
                        description: "Gib die zweite Option für deine Umfrage ein",
                        type: 3,
                        required: true
                    }, {
                        name: "Option_3",
                        description: "Gib die dritte Option für deine Umfrage ein",
                        type: 3,
                    }, {
                        name: "Option_4",
                        description: "Gib die vierte Option für deine Umfrage ein",
                        type: 3,
                    },
                    {
                        name: "Anonym",
                        description: "Diese Umfrage anonym starten?",
                        type: 5,
                        required: false,
                    },
                    {
                        name: "Zwischenergebnisse",
                        description: "Neue Zwischenergebnisse anzeigen wenn jemand abgestimmt hat?",
                        type: 5,
                        required: false
                    }
                ]
            }
        ]
    }
}

let vote = {
    options: [] as string[],
    anonymous: true,
    tempRes: false,
    result: {} as { [s: string]: number },
    voteCount: 0,
    voted: [] as string[],
    creator: "",
    active: false,
    name: ""
}

export async function execute(interaction: any, client: Client, topArgs: { options: { name: string, value: any }[], name: string }[]) {
    const subCommand = topArgs[0].name
    const args = topArgs[0].options

    switch (subCommand) {
        case "start":
            if (vote.active) {
                (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: "Es läuft schon eine Umfrage"
                        }
                    }
                });
                return;
            }

            vote.creator = interaction.member.user.id
            vote.active = true

            vote.name = args.find(arg => arg.name == "name")?.value
            console.log(args)

            for (let i = 0; i < 4; i++) {
                const option = args.find(arg => arg.name == `option_${i + 1}`)
                if (option) vote.options.push(option.value)
            }

            const anonymous = args.find(arg => arg.name == `anonym`)
            if (anonymous) vote.anonymous = anonymous.value

            const tempRes = args.find(arg => arg.name == `zwischenergebnisse`)
            if (tempRes) vote.tempRes = tempRes.value

            let subCommandObject = {
                name: "cast",
                description: "Stimme ab",
                type: 1,
                options: [
                    {
                        name: "vote",
                        description: vote.name,
                        type: 4,
                        required: true,
                        choices: [] as { name: string, value: number }[]
                    }
                ]
            }

            vote.options.forEach((option, index) => {
                subCommandObject.options[0].choices.push({
                    name: option,
                    value: (index + 1)
                })
            })

            let commandObject = JSON.parse(JSON.stringify(command));
            commandObject.data.options.push(subCommandObject)

            let endObject = {
                name: "end",
                description: "Die Umfrage beenden",
                type: 1,
            }

            commandObject.data.options.push(endObject);

            (client as any).api.applications(client.user?.id).guilds(interaction.guild_id).commands.post(commandObject);

            (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: (vote.anonymous ? "Umfrage gestartet!" : "Öffentliche Umfrage gestartet")
                    }
                }
            });

            break;
        case "cast":
            console.log(interaction.member.nick)
            if (!vote.voted.includes(interaction.member.user.id)) {
                const voteCast = args.find(arg => arg.name == "vote")?.value
                console.log(voteCast)
                vote.result[voteCast] = vote.result[voteCast] ? vote.result[voteCast] + 1 : 1
                vote.voteCount++;
                vote.voted.push(interaction.member.user.id)
                console.log(vote.voted)

                let tempResText = ""
                if (vote.tempRes) {
                    tempResText = ":\n\n"
                    vote.options.forEach((option, index) => {
                        let count = (vote.result as any)[(index + 1)]
                        tempResText += `${option}: ${count ? count : 0}\n`
                    })
                }


                (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: await createAPIMessage(interaction, `Du hast für '${vote.options[voteCast - 1]}'abgestimmt. ${vote.voteCount} Leute haben abgestimmt` + tempResText, client, vote.anonymous ? 64 : 0)
                    }
                });
            } else {
                const embed = new MessageEmbed()
                    .setColor(0x0341fc)
                    .setDescription(`${interaction.member.nick} hat versucht, doppelt abzustimmen`);

                (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: await createAPIMessage(interaction, embed, client)
                    }
                });
            }
            break;
        case "end":
            if (interaction.member.user.id != vote.creator) return;

            console.log(command);

            (client as any).api.applications(client.user?.id).guilds(interaction.guild_id).commands.post(command)


            let description = ""
            let max = Math.max(...Object.values(vote.result))
            vote.options.forEach((option, index) => {
                let count = vote.result[index + 1]
                description = description + (count == max ? "**" : "") + `${option}: ${count ? count : 0}` + (count == max ? "**" : "") + `\n`
            })

            const embed = new MessageEmbed()
                .setColor(0x0341fc)
                .setTitle(`Abstimmung "${vote.name}" beendet:`)
                .setDescription(description);

            (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: await createAPIMessage(interaction, embed, client)
                }
            });
            vote = {
                options: [],
                anonymous: true,
                tempRes: false,
                result: {},
                voteCount: 0,
                voted: [],
                creator: "",
                active: false,
                name: ""
            };

            break;
    }
}

async function createAPIMessage(interaction: any, content: any, client: Client, flags?: number) {
    let apiMessage = await (APIMessage.create(client.channels.resolve(interaction.channel_id) as TextChannel, content)
        .resolveData()
        .resolveFiles());

    (apiMessage.data as any).flags = flags

    return { ...apiMessage.data, files: apiMessage.files };
}