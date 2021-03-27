import * as Discord from "discord.js"
import * as plshelp from "./commands/plshelp"
import * as vote from "./commands/vote"
import * as rocketManager from "./rockets/rocketManager"
import config from "./config.json"
import { rocketTest } from "./rockets/rocketindex"

const client = new Discord.Client()

console.log('process.argv', process.argv);
const resendCommands = process.argv.includes("--resend")

client.on('ready', () => {
    console.log('ready');

    if (resendCommands) sendCommands(client);

    let laal = rocketTest(client)

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
    });

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
    });

    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(vote.command);
    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(plshelp.command);
    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(rocketManager.command);
}

client.ws.on('INTERACTION_CREATE' as any, async interaction => {
    const command = interaction.data.name.toLowerCase()
    let topArgs = interaction.data.options
    let args: { name: string, value: any }[] = [];
    if (topArgs && topArgs.length > 0) {
        args = topArgs[0].options ? topArgs[0].options : topArgs
    }

    switch (command) {
        case "ping":
            let numberArg = args.find(arg => arg.name.toLowerCase() == "number")
            let number = 0
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
            break;
        case "vote":
            vote.execute(interaction, client, topArgs)
            break;
        case "plshelp":
            plshelp.execute(interaction, client, args)
            break;
        case "rockets":
            rocketManager.execute(interaction, client, topArgs)
    }
})

client.login(config.token)

async function getVoice(interaction: any, client: Discord.Client, member: string) {
    const guild = await client.guilds.fetch(interaction.guild_id)
    const voice = await guild.voiceStates.cache.get(member) || new Discord.VoiceState(guild, { user_id: member });
    return voice
}

export async function createAPIMessage(interaction: any, content: any, client: Discord.Client, flags?: number) {
    let apiMessage = await (Discord.APIMessage.create(client.channels.resolve(interaction.channel_id) as Discord.TextChannel, content)
        .resolveData()
        .resolveFiles());

    (apiMessage.data as any).flags = flags

    return { ...apiMessage.data, files: apiMessage.files };
}

process.on("SIGINT", _ => {
    client.user?.setStatus("invisible").then(() => {
        console.log("SIGINT exiting")
        process.exit(0)
    })
})