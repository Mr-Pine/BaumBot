import * as Discord from "discord.js";

export let command = {
    data: {
        name: "plshelp",
        description: "Helfe deinem Freund mit etwas Inspiration",
        options: [
            {
                name: "hilfsbedürftiger",
                description: "Wem muss geholfen werden?",
                required: true,
                type: 6
            }
        ]
    }
}

export function execute(interaction: any, client: Discord.Client, args: { name: string, value: any }[]) {
    let member = args.find(arg => arg.name == "hilfsbedürftiger")?.value

    client.channels.fetch("704662634246701166").then(helpChannel => {
        getVoice(interaction, client, member).then(voice => {
            if (voice.channelID != null) {
                voice.setChannel(helpChannel, "War mal nötig")
                let anyClient = client as any
                anyClient.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: `Bin <@${member.value}> zur Hilfe!`
                        }
                    }
                });

                try {
                    (helpChannel as Discord.VoiceChannel).join().then(connection => {
                        const dispatcher = connection.play("./Sounds/plshelp/plshelp.mp3")
                        var started = false
                        var counter = 0
                        dispatcher.on("finish", () => {
                            (helpChannel as Discord.VoiceChannel).leave()
                        })
                    }).catch(err => console.log(err))
                } catch (err) {
                    console.log(err)
                    console.log(interaction.member)
                }
            } else {
                (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: `Ich kann nur Leuten im Sprachchat helfen :confused:`
                        }
                    }
                });
            }
        })
    })
}

async function getVoice(interaction: any, client: Discord.Client, member: string) {
    const guild = await client.guilds.fetch(interaction.guild_id)
    const voice = await guild.voiceStates.cache.get(member) || new Discord.VoiceState(guild, { user_id: member });
    return voice
}