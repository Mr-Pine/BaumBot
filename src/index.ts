import * as Discord from "discord.js"
import * as plshelp from "./commands/plshelp"
import * as vote from "./commands/vote"
import config from "./config.json"

let client = new Discord.Client()

console.log('process.argv', process.argv);
let resendCommands = process.argv.includes("--resend")

client.on('ready', () => {
    console.log('ready');

    if (resendCommands) sendCommands(client);
})

function sendCommands(client: Discord.Client) {
    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post({
        data: {
            name: "ping",
            description: "pinging",
            options: [
                {
                    name: "number",
                    description: "number of !",
                    type: "4"
                }
            ]
        }
    })

        (client as any).api.applications(client.user?.id)/* .guilds("492426074396033035") */.commands.post({
            data: {
                name: "Soundboard",
                description: "Play a sound from a collection of sounds",
                options: [
                    {
                        name: "Schaller",
                        description: "O-Töne von Herr Schaller? Waaaaaaaas? Abgefaaaaaah'n",
                        type: 1,
                        options: [
                            {
                                name: "Sound",
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
                                name: "Anzeigen",
                                description: "Zeigt an, dass du diesen Command verwendet hast",
                                type: 5,
                                required: false,
                                default: false
                            }
                        ]
                    },
                    {
                        name: "Verschiedenes",
                        description: "Verschiedene Sounds",
                        type: 1,
                        options: [
                            {
                                name: "Sound",
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
                                name: "Anzeigen",
                                description: "Zeigt an, dass du diesen Command verwendet hast",
                                type: 5,
                                required: false,
                                default: false
                            }
                        ]
                    }
                ]
            }
        })

        (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(vote.command)
        (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(plshelp.command)
}

client.ws.on('INTERACTION_CREATE' as any, async interaction => {
    let command = interaction.data.name.toLowerCase()
    var topArgs = interaction.data.options
    var args: { name: string, value: any }[] = [];
    if (topArgs && topArgs.length > 0) {
        args = topArgs[0].options ? topArgs[0].options : topArgs
    }

    switch (command) {
        case "ping":

            var numberArg = args.find(arg => arg.name.toLowerCase() == "number")
            var number = 0
            if (numberArg) {
                number = numberArg.value
            }
            const reply = "pong" + "!".repeat(number)
            console.log(number);
            (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: reply
                    }
                }
            });
            break;
        case "soundboard":
            let sound = args.find(arg => arg.name.toLowerCase() == "sound")?.value
            let show_source = args.find(arg => arg.name.toLowerCase() == "anzeigen")
            try {
                const voiceChannel = (await getVoice(interaction, client, interaction.member.user.id)).channel as Discord.VoiceChannel
                voiceChannel.join().then(connection => {
                    const dispatcher = connection.play(sound)
                    var started = false
                    var counter = 0
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
                    type: show_source ? 5 : 2,
                }
            });
            break;
        case "vote":
            vote.execute(interaction, client, topArgs)
            break;
        case "plshelp":
            plshelp.execute(interaction, client, args)
    }
})

client.login(config.token)

async function getVoice(interaction: any, client: Discord.Client, member: string) {
    const guild = await client.guilds.fetch(interaction.guild_id)
    const voice = await guild.voiceStates.cache.get(member) || new Discord.VoiceState(guild, { user_id: member });
    return voice
}