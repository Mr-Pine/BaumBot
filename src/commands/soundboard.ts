import * as Discord from "discord.js";
import * as Voice from "@discordjs/voice"
import { createAPIMessage } from "..";

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
            },
            {
                name: "panel",
                description: "Knöpfe für alle Sounds",
                type: 1,
            }
        ]
    }
}

export async function execute(interaction: any, client: Discord.Client, args: { name: string, value: any }[]) {
    if (args[0].name == "panel") {
        await showPanel(client, interaction);
        return;
    }
    const soundSource = args.find(arg => arg.name.toLowerCase() == "sound")?.value
    let showSourceArg = args.find(arg => arg.name.toLowerCase() == "anzeigen")
    let showSource = showSourceArg ? showSourceArg.value as boolean : false
    
    playSound(interaction, client, soundSource, showSource);
}

export async function handleButtons(interaction: any, client: Discord.Client, customID: string){
    playSound(interaction, client, customID, false)
}

async function playSound(interaction: any, client: Discord.Client, soundSource: string, show_source: boolean){
    try {
        const voiceChannel = (await getVoice(interaction, client, interaction.member.user.id)).channel as Discord.VoiceChannel
        let connection = Voice.joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild_id,
            adapterCreator: await (await client.guilds.fetch(interaction.guild_id)).voiceAdapterCreator
        })
        connection.on(Voice.VoiceConnectionStatus.Ready, () => {
            let player = Voice.createAudioPlayer();
            player.play(Voice.createAudioResource(soundSource))
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
    (client as any).api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: `<@${interaction.member.user.id}> hast einen Sound abgespielt!`,
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

async function showPanel(client: Discord.Client, interaction: any) {

    let panelComponents = [{
        type: 1,
        components: [
            {
                type: 2,
                style: 1,
                custom_id: "soundboard\\./Sounds/hello_how_are_you_im_under_the_water.mp3",
                label: "Please help me, I'm under the water"
            },
            {
                type: 2,
                style: 1,
                custom_id: "soundboard\\./Sounds/pro gamer move.mp3",
                label: "I'm gonna do what's called a pro gamer move"
            },
            {
                type: 2,
                style: 1,
                custom_id: "soundboard\\./Sounds/Big Brain Time.mp3",
                label: "Yeah, this is big brain time"
            },
            {
                type: 2,
                style: 1,
                custom_id: "soundboard\\./Sounds/YEET Sound.mp3",
                label: "YEET"
            },
            {
                type: 2,
                style: 1,
                custom_id: "soundboard\\./Sounds/stop it_get some help.mp3",
                label: "Stop it. Get some help."
            },
        ]
    },
    {
        type: 1,
        components: [
            {
                type: 2,
                style: 1,
                custom_id: "soundboard\\./Sounds/Now thats a lot of damage meme.mp3",
                label: "Now that's a lot of damage"
            },
        ]
    },
    {
        type: 1,
        components: [
            {
                type: 2,
                style: 3,
                custom_id: "soundboard\\./Sounds/feierabend_leck_moodle.mp3",
                label: "Moodle, BBB, Boah leck, endlich Feierabend"
            },
            {
                type: 2,
                style: 3,
                custom_id: "soundboard\\./Sounds/waermi_auf_de_ranze.mp3",
                label: "Wärmi auf de Ranze! Ah herrlich!"
            },
            {
                type: 2,
                style: 3,
                custom_id: "soundboard\\./Sounds/mach_ich_mit_bin_dabei.mp3",
                label: "Da mach ich mit! Da bin ich dabei!"
            },
            {
                type: 2,
                style: 3,
                custom_id: "soundboard\\./Sounds/waas_abgefahren.mp3",
                label: "Waaaaaaas?! Abgefaaaaah'n!"
            }
        ]
    }
    ];


    (client as any).api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: await createAPIMessage(interaction, "Soundboard by BaumBot", client, undefined, panelComponents),
        }
    });
}