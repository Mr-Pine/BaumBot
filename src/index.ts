import * as Discord from "discord.js"
import * as Voice from "@discordjs/voice"
import * as plshelp from "./commands/plshelp"
import * as vote from "./commands/vote"
import * as soundboard from "./commands/soundboard"
import * as rocketManager from "./rockets/rocketManager"
import config from "./config.json"
import { rocketTest } from "./rockets/rocketindex"

const client = new Discord.Client({
    intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_BANS, Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Discord.Intents.FLAGS.GUILD_INTEGRATIONS, Discord.Intents.FLAGS.GUILD_WEBHOOKS, Discord.Intents.FLAGS.GUILD_INVITES, Discord.Intents.FLAGS.GUILD_VOICE_STATES, Discord.Intents.FLAGS.GUILD_PRESENCES,
    Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING, Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING]
})

console.log('process.argv', process.argv);
const resendCommands = process.argv.includes("--resend")

client.on('ready', () => {
    console.log('ready');

    if (resendCommands) sendCommands(client);

    //let laal = rocketTest(client)

})

async function sendCommands(client: Discord.Client) {
    /* (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post({
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

    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(vote.command);
    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(plshelp.command);
    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(rocketManager.command);
    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(soundboard.command);*/
    let pingData = {
        name: "ping",
        description: "pinging you back",
        options: [
            {
                name: "number",
                description: "number of !",
                type: 'INTEGER' as Discord.ApplicationCommandOptionType
            }
        ]
    }
    const pingCmd = await client.guilds.cache.get("492426074396033035")?.commands.create(pingData)
    const voteCmd = await client.guilds.cache.get("492426074396033035")?.commands.create(vote.command)
    const plshelpCmd = await client.guilds.cache.get("492426074396033035")?.commands.create(plshelp.command)
    const rocketCmd = await client.guilds.cache.get("492426074396033035")?.commands.create(rocketManager.command)
    const soundboardCmd = await client.guilds.cache.get("492426074396033035")?.commands.create(soundboard.command)
}

client.on("interactionCreate", async interaction => {
    console.log(interaction);

    if (interaction.isCommand()) {

        const command = interaction.commandName.toLowerCase()

        switch (command) {
            case "ping":
                let number = interaction.options.getInteger("number") || 0
                const reply = "pong" + "!".repeat(number)
                console.log(number);
                interaction.reply(reply)
                break;
            case "soundboard":
                soundboard.execute(interaction, client)
                break;
            case "vote":
                vote.execute(interaction, client)
                break;
            case "plshelp":
                plshelp.execute(interaction, client)
                break;
            case "rockets":
                rocketManager.execute(interaction, client)
                break;
        }
    } else if (interaction.isButton()) {
        console.log("button");
        let customID = interaction.customId;
        let croppedID = customID.substr(customID.lastIndexOf('\\') + 1);
        if (customID.startsWith("soundboard\\")) {
            soundboard.handleButtons(interaction, client, croppedID)
        }
    }
})

client.login(config.token)

export async function createAPIMessage(interaction: Discord.CommandInteraction, content: any, client: Discord.Client, componentObject?: any, ephemeral = false) {
    let apiMessage = await (Discord.MessagePayload.create(client.channels.resolve(interaction.channelId) as Discord.TextChannel, content)
        .resolveData()
        .resolveFiles());
    if (componentObject) {
        (apiMessage.data as any).components = componentObject;
    }
    (apiMessage.data as any).flags = ephemeral ? 64 : 0;

    return apiMessage;
}

export async function getVoice(interaction: Discord.Interaction, client: Discord.Client, member: string) {
    const voice = await (interaction.guild as Discord.Guild).voiceStates.cache.get(member)
    return voice
}

process.on("SIGINT", _ => {
    client.user?.setStatus("invisible")
    console.log("SIGINT exiting")
    process.exit(0)
})