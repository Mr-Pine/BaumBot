import { ApplicationCommandOptionType, Client, CommandInteraction, Guild, GuildMember, MessageEmbed } from "discord.js"
import { createAPIMessage } from ".."

export const command = {
        name: "vote",
        description: "Mache eine Umfrage",
        options: [
            {
                name: "start",
                description: "Eine Umfrage starten",
                type: 1,
                options: [
                    {
                        name: "name",
                        description: "Der Name der Umfrage",
                        type: "STRING" as ApplicationCommandOptionType,
                        required: true
                    },
                    {
                        name: "option_1",
                        description: "Gib die erste Option für deine Umfrage ein",
                        type: "STRING" as ApplicationCommandOptionType,
                        required: true
                    }, {
                        name: "option_2",
                        description: "Gib die zweite Option für deine Umfrage ein",
                        type: "STRING" as ApplicationCommandOptionType,
                        required: true
                    }, {
                        name: "option_3",
                        description: "Gib die dritte Option für deine Umfrage ein",
                        type: "STRING" as ApplicationCommandOptionType,
                    }, {
                        name: "option_4",
                        description: "Gib die vierte Option für deine Umfrage ein",
                        type: "STRING" as ApplicationCommandOptionType,
                    },
                    {
                        name: "anonym",
                        description: "Diese Umfrage anonym starten?",
                        type: "BOOLEAN" as ApplicationCommandOptionType,
                        required: false,
                    },
                    {
                        name: "zwischenergebnisse",
                        description: "Neue Zwischenergebnisse anzeigen wenn jemand abgestimmt hat?",
                        type: "BOOLEAN" as ApplicationCommandOptionType,
                        required: false
                    }
                ]
            }
        ]
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

export async function execute(interaction: CommandInteraction, client: Client) {
    switch (interaction.options.getSubcommand()) {
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

            vote.creator = interaction.user.id
            vote.active = true

            vote.name = interaction.options.getString("name", true)

            for (let i = 0; i < 4; i++) {
                const option = interaction.options.getString(`option_${i + 1}`)
                if (option) vote.options.push(option)
            }

            const anonymous = interaction.options.getBoolean("anonym")
            if (anonymous) vote.anonymous = anonymous

            vote.tempRes = interaction.options.getBoolean("zwischenergebnisse") || false

            let subCommandObject = {
                name: "cast",
                description: "Stimme ab",
                type: 1,
                options: [
                    {
                        name: "vote",
                        description: vote.name,
                        type: 'INTEGER' as ApplicationCommandOptionType,
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
            commandObject.options.push(subCommandObject)

            let endObject = {
                name: "end",
                description: "Die Umfrage beenden",
                type: 1,
            }

            commandObject.options.push(endObject);

            const voteCmd = await client.guilds.cache.get("492426074396033035")?.commands.create(commandObject);

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
            console.log((interaction.member as GuildMember).displayName)
            if (!vote.voted.includes(interaction.user.id)) {
                const voteCast = interaction.options.getInteger("vote", true)
                console.log(voteCast)
                vote.result[voteCast] = vote.result[voteCast] ? vote.result[voteCast] + 1 : 1
                vote.voteCount++;
                vote.voted.push(interaction.user.id)
                console.log(vote.voted)

                let tempResText = ""
                if (vote.tempRes) {
                    tempResText = ":\n\n"
                    vote.options.forEach((option, index) => {
                        let count = (vote.result as any)[(index + 1)]
                        tempResText += `${option}: ${count ? count : 0}\n`
                    })
                }

                interaction.reply(await createAPIMessage(interaction, `Du hast für '${vote.options[voteCast - 1]}'abgestimmt. ${vote.voteCount} Leute haben abgestimmt` + tempResText, client, vote.anonymous ? 64 : 0))
            } else {
                const embed = new MessageEmbed()
                    .setColor(0x0341fc)
                    .setDescription(`${(interaction.member as GuildMember).displayName} hat versucht, doppelt abzustimmen`);

                (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: await createAPIMessage(interaction, embed, client)
                    }
                });
            }
            break;
        case "end":
            if (interaction .user.id != vote.creator) return;

            console.log(command);

            await client.guilds.cache.get("492426074396033035")?.commands.create(command)


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