import * as Discord from "discord.js";
import * as Voice from "@discordjs/voice"
import { getVoice } from "..";

export const command = {
    name: "plshelp",
    description: "Helfe deinem Freund mit etwas Inspiration",
    options: [
        {
            name: "hilfsbedürftiger",
            description: "Wem muss geholfen werden?",
            required: true,
            type: 'USER' as Discord.ApplicationCommandOptionType
        }
    ]
}

export async function execute(interaction: Discord.CommandInteraction, client: Discord.Client) {
    const member = interaction.options.getMember("hilfsbedürftiger", true) as Discord.GuildMember

    client.channels.fetch("704662634246701166").then(helpChannel => {
        getVoice(interaction, client, member.id).then(async voice => {
            if (voice) {
                if (voice.channelId != null) {
                    voice.setChannel(helpChannel as Discord.VoiceChannelResolvable, "War mal nötig")
                    const anyClient = client as any
                    interaction.reply(`Bin <@${member.id}> zur Hilfe!`)

                    try {
                        let connection = Voice.joinVoiceChannel({
                            channelId: (helpChannel as Discord.VoiceChannel).id,
                            guildId: interaction.guildId as string,
                            adapterCreator: await (interaction.guild as Discord.Guild).voiceAdapterCreator
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
                    interaction.reply(`Ich kann nur Leuten im Sprachchat helfen :confused:`);
                }
            }
        })
    })
}

