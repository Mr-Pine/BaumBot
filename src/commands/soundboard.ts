import * as Discord from "discord.js";
import * as Voice from "@discordjs/voice"
import { getVoice } from "..";

export const command = {
    name: "soundboard",
    description: "Play a sound from a collection of sounds",
    options: [
        {
            name: "schaller",
            description: "O-Töne von Herr Schaller? Waaaaaaaas? Abgefaaaaaah'n",
            type: "SUB_COMMAND" as Discord.ApplicationCommandOptionType,
            options: [
                {
                    name: "sound",
                    description: "The sound played",
                    type: "STRING" as Discord.ApplicationCommandOptionType,
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
                    type: "BOOLEAN" as Discord.ApplicationCommandOptionType,
                    required: false,
                    default: false
                }
            ]
        },
        {
            name: "verschiedenes",
            description: "Verschiedene Sounds",
            type: "SUB_COMMAND" as Discord.ApplicationCommandOptionType,
            options: [
                {
                    name: "sound",
                    description: "The sound played",
                    type: "STRING" as Discord.ApplicationCommandOptionType,
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
                    type: "BOOLEAN" as Discord.ApplicationCommandOptionType,
                    required: false,
                    default: false
                }
            ]
        },
        {
            name: "panel",
            description: "Knöpfe für alle Sounds",
            type: "SUB_COMMAND" as Discord.ApplicationCommandOptionType,
        }
    ]
}

export async function execute(interaction: Discord.CommandInteraction, client: Discord.Client) {
    if (interaction.options.getSubcommand() == "panel") {
        await showPanel(client, interaction);
        return;
    }
    const soundSource = interaction.options.getString("sound", true)
    const showSource = interaction.options.getBoolean("anzeigen") || false

    playSound(interaction, client, soundSource, showSource);
}

export async function handleButtons(interaction: any, client: Discord.Client, customID: string) {
    playSound(interaction, client, customID, false)
}

async function playSound(interaction: Discord.CommandInteraction | Discord.MessageComponentInteraction, client: Discord.Client, soundSource: string, show_source: boolean) {
    let voice = await getVoice(interaction, client, interaction.user.id)
    if (voice) {
        try {
            const voiceChannel = voice.channel as Discord.VoiceChannel
            let connection = Voice.joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId as string,
                adapterCreator: await (interaction.guild as Discord.Guild).voiceAdapterCreator
            })
            let player = Voice.createAudioPlayer();
            connection.subscribe(player)
            connection.on(Voice.VoiceConnectionStatus.Ready, () => {
                player.play(Voice.createAudioResource(soundSource))
                player.on(Voice.AudioPlayerStatus.Idle, () => {
                    player.stop()
                    connection.destroy()
                })
            })
        } catch (err) {
            console.log(err)
            console.log(interaction.member)
        }
    }
    interaction.reply({content: `<@${interaction.user.id}> hast einen Sound abgespielt!`, ephemeral: !show_source})
}



async function showPanel(client: Discord.Client, interaction: Discord.CommandInteraction) {

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
    
    interaction.reply({content: "Soundboard by BaumBot", components: panelComponents})
}