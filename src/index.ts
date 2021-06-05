import * as Discord from "discord.js"
import * as plshelp from "./commands/plshelp"
import * as vote from "./commands/vote"
import * as soundboard from "./commands/soundboard"
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
    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(rocketManager.command); */
    (client as any).api.applications(client.user?.id).guilds("492426074396033035").commands.post(soundboard.command);
}

client.ws.on('INTERACTION_CREATE' as any, async interaction => {
    console.log(interaction);

    if (interaction.type == 2) {

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
                soundboard.execute(interaction, client, args)
                break;
            case "vote":
                vote.execute(interaction, client, topArgs)
                break;
            case "plshelp":
                plshelp.execute(interaction, client, args)
                break;
            case "rockets":
                rocketManager.execute(interaction, client, topArgs)
                break;
        }
    } else if (interaction.type = 3) {
        console.log("button");
        let customID = interaction.data.custom_id as string;
        let croppedID = customID.substr(customID.lastIndexOf('\\') + 1);
        if(customID.startsWith("soundboard\\")){
            soundboard.handleButtons(interaction, client, croppedID)
        }
    }
})

client.login(config.token)

export async function createAPIMessage(interaction: any, content: any, client: Discord.Client, flags?: number, componentObject?: any) {
    let apiMessage = await (Discord.APIMessage.create(client.channels.resolve(interaction.channel_id) as Discord.TextChannel, content)
        .resolveData()
        .resolveFiles());

    (apiMessage.data as any).flags = flags;
    (apiMessage.data as any).components = componentObject;

    return { ...apiMessage.data, files: apiMessage.files };
}

process.on("SIGINT", _ => {
    client.user?.setStatus("invisible").then(() => {
        console.log("SIGINT exiting")
        process.exit(0)
    })
})