import * as Discord from "discord.js";

export const command = {
    data: {
        name: "soundboard",
        description: "Play a sound from a collection of sounds",
        options: [
            {
                name: "schaller",
                description: "O-Töne von Herr Schaller? Waaaaaaaas? Abgefaaaaaah'n",
                type: 1,
                options: [
                    {
                        name: "sound",
                        description: "The sound played",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                value: "./Sounds/feierabend_leck_moodle.mp3",
                                name: "Moodle, BBB, Boah leck, endlich Feierabend"
                            },
                            {
                                value: "./Sounds/waermi_auf_de_ranze.mp3",
                                name: "Wärmi auf de Ranze! Ah herrlich!"
                            },
                            {
                                value: "./Sounds/mach_ich_mit_bin_dabei.mp3",
                                name: "Da mach ich mit! Da bin ich dabei!"
                            },
                            {
                                value: "./Sounds/waas_abgefahren.mp3",
                                name: "Waaaaaaas?! Abgefaaaaah'n!"
                            },
                        ]
                    },
                    {
                        name: "anzeigen",
                        description: "Zeigt an, dass du diesen Command verwendet hast",
                        type: 5,
                        required: false,
                        default: false
                    }
                ]
            },
            {
                name: "verschiedenes",
                description: "Verschiedene Sounds",
                type: 1,
                options: [
                    {
                        name: "sound",
                        description: "The sound played",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                value: "./Sounds/hello_how_are_you_im_under_the_water.mp3",
                                name: "Please help me, I'm under the water"
                            },
                            {
                                value: "./Sounds/pro gamer move.mp3",
                                name: "I'm gonna do what's called a pro gamer move"
                            },
                            {
                                value: "./Sounds/Big Brain Time.mp3",
                                name: "Yeah, this is big brain time"
                            },
                            {
                                value: "./Sounds/YEET Sound.mp3",
                                name: "YEET"
                            },
                            {
                                value: "./Sounds/stop it_get some help.mp3",
                                name: "Stop it. Get some help."
                            },
                            {
                                value: "./Sounds/Now thats a lot of damage meme.mp3",
                                name: "Now that's a lot of damage"
                            },
                        ]
                    },
                    {
                        name: "anzeigen",
                        description: "Zeigt an, dass du diesen Command verwendet hast",
                        type: 5,
                        required: false,
                        default: false
                    }
                ]
            }
        ]
    }
}

export async function execute(interaction: any, client: Discord.Client, args: { name: string, value: any }[]) {
    const sound = args.find(arg => arg.name.toLowerCase() == "sound")?.value
    let show_source = args.find(arg => arg.name.toLowerCase() == "anzeigen")
    show_source = show_source ? show_source.value : false
    try {
        const voiceChannel = (await getVoice(interaction, client, interaction.member.user.id)).channel as Discord.VoiceChannel
        voiceChannel.join().then(connection => {
            const dispatcher = connection.play(sound)
            let started = false
            let counter = 0
            dispatcher.on("finish", () => {
                voiceChannel.leave()
            })
        }).catch(err => console.log(err))
    } catch (err) {
        console.log(err)
        console.log(interaction.member)
    }
    (client as any).api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: `Du hast einen Sound abgespielt!`,
                flags: show_source ? 0 : (1 << 6)
            },
        }
    });
}

async function getVoice(interaction: any, client: Discord.Client, member: string) {
    const guild = await client.guilds.fetch(interaction.guild_id)
    const voice = await guild.voiceStates.cache.get(member) || new Discord.VoiceState(guild, { user_id: member });
    return voice
}