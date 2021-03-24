import { Client } from "discord.js"

export let command = {
    data: {
        name: "Vote",
        description: "Mache eine Umfrage",
        options: [
            {
                name: "start",
                description: "Eine Umfrage starten",
                type: 1,
                options: [
                    {
                        name: "Name",
                        description: "Der Name der Umfrage",
                        type: 3,
                        required: true
                    },
                    {
                        name: "Option_1",
                        description: "Gib die erste Option für deine Umfrage ein",
                        type: 3,
                        required: true
                    }, {
                        name: "Option_2",
                        description: "Gib die zweite Option für deine Umfrage ein",
                        type: 3,
                        required: true
                    }, {
                        name: "Option_3",
                        description: "Gib die dritte Option für deine Umfrage ein",
                        type: 3,
                    }, {
                        name: "Option_4",
                        description: "Gib die vierte Option für deine Umfrage ein",
                        type: 3,
                    },
                    {
                        name: "Anonym",
                        description: "Diese Umfrage anonym starten?",
                        type: 5,
                        required: false,
                    },
                    {
                        name: "Zwischenergebnisse",
                        description: "Neue Zwischenergebnisse anzeigen wenn jemand abgestimmt hat?",
                        type: 5,
                        required: false
                    }
                ]
            }
        ]
    }
}

var vote = {
    options: [] as string[],
    anonymous: true,
    tempRes: false,
    result: {},
    voteCount: 0,
    voted: [],
    creator: "",
    active: false,
    name: ""
}

export function execute(interaction: any, client: Client, topArgs: { options: { name: string, value: any }[], name: string }[]) {
    let subCommand = topArgs[0].name
    let args = topArgs[0].options

    switch (subCommand) {
        case "start":
            if (vote.active) {
                (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: "Es läuft schon eine Umfrage"
                        }
                    }
                });
                return;
            }

            vote.creator = interaction.member.user.id
            vote.active = true

            vote.name = args.find(arg => arg.name == "name")?.value
            console.log(args)

            for (var i = 0; i < 4; i++) {
                let option = args.find(arg => arg.name == `option_${i + 1}`)
                if (option) vote.options.push(option.value)
            }

            let anonymous = args.find(arg => arg.name == `anonym`)
            if (anonymous) vote.anonymous = anonymous.value

            let tempRes = args.find(arg => arg.name == `zwischenergebnisse`)
            if (tempRes) vote.tempRes = tempRes.value

            var subCommandObject = {
                name: "cast",
                description: "Stimme ab",
                type: 1,
                options: [
                    {
                        name: "vote",
                        description: vote.name,
                        type: 4,
                        required: true,
                        choices: [] as {name: string, value: string}[]
                    }
                ]
            }

            vote.options.forEach((option, index) => {
                subCommandObject.options[0].choices.push({
                    name: option,
                    value: (index + 1).toString()
                })
            })

            var commandObject = JSON.parse(JSON.stringify(module.exports.command));
            commandObject.data.options.push(subCommandObject)

            commandObject.data.options.push({
                name: "end",
                description: "Die Umfrage beenden",
                type: 1,
            })

            (client as any).api.applications(client.user?.id).guilds(interaction.guild_id).commands.post(commandObject)

            (client as any).api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: (module.exports.vote.anonymous ? "Umfrage gestartet!" : "Öffentliche Umfrage gestartet")
                    }
                }
            });

            break;
    }
}