import * as Discord from "discord.js";
import * as Voice from "@discordjs/voice"

export const command = {
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

export async function execute(interaction: any, client: Discord.Client, args: { name: string, value: any }[]) {
    const member = args.find(arg => arg.name == "hilfsbedürftiger")?.value

    client.channels.fetch("704662634246701166").then(helpChannel => {
        getVoice(interaction, client, member).then(async voice => {
            if (voice) {
                if (voice.channelId != null) {
                    voice.setChannel(helpChannel as Discord.VoiceChannelResolvable, "War mal nötig")
                    const anyClient = client as any
                    anyClient.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 4,
                            data: {
                                content: `Bin <@${member.value}> zur Hilfe!`
                            }
                        }
                    });

                    try {
                        let connection = Voice.joinVoiceChannel({
                            channelId: (helpChannel as Discord.VoiceChannel).id,
                            guildId: interaction.guild_id,
                            adapterCreator: await (await client.guilds.fetch(interaction.guild_id)).voiceAdapterCreator
                        })
                        connection.on(Voice.VoiceConnectionStatus.Ready, () => {
                            let player = Voice.createAudioPlayer();
                            player.play(Voice.createAudioResource("./Sounds/plshelp/plshelp.mp3"))
                            connection.subscribe(player)
                            player.on(Voice.AudioPlayerStatus.Idle, () => {
                                player.stop()
                                connection.destroy()
                            })
                        })
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
            }
        })
    })
}

async function getVoice(interaction: any, client: Discord.Client, member: string) {
    const guild = await client.guilds.fetch(interaction.guild_id)
    const voice = await guild.voiceStates.cache.get(member)
    return voice
}