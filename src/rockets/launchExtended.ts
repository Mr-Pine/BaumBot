import { MessageEmbed } from "discord.js";
import { Launch, LaunchProvider, Rocket } from "./rocketlaunch";

export class LaunchExtended extends Launch {
    launchWindow: { start: Date, end: Date }
    provider: LaunchProviderExtended
    rocket: RocketExtended
    webcast: { live: boolean, url: string }

    constructor()
    constructor(sourceJSON: any)
    constructor(sourceJSON?: any) {
        super(sourceJSON)

        if (typeof sourceJSON === "undefined") return;

        this.launchWindow = {
            start: new Date(sourceJSON.window_start),
            end: new Date(sourceJSON.window_end)
        }

        this.provider = new LaunchProviderExtended(sourceJSON.launch_service_provider)
        this.rocket = new RocketExtended(sourceJSON.rocket)

        this.webcast = { live: sourceJSON.webcast_live, url: sourceJSON.vidURLs[0] }
    }

    getExtended = async () => {
        return await this;
    }

    getEmbed() {
        let embed = new MessageEmbed()
            .setTitle(`${this.tMinus()} | ${this.name}`)
            .addField("Launch Date", this.net.toLocaleString('de-DE'))
            .setColor(0xfc9d03);
        if (typeof this.mission !== 'undefined') {
            embed.addField(
                `Mission: ${this.mission.name}`,
                this.mission.description +
                `\n\nType: ${this.mission.type}\n` +
                (this.mission.orbit ? `Orbit: ${this.mission.orbit?.name}` : "")
            )
        }
        embed.addField(
            `Launched by: ${this.provider.name}`,
            this.provider.description +
            `\n\nFounding year: ${this.provider.foundingYear}\n` +
            `Country: ${this.provider.countryCode}`
        );
        embed.addField(
            `Rocket`,
            `Name: ${this.rocket.name}`
        );
        embed.addField(
            `Launch status: ${this.status.abbreviation}`,
            this.status.name
        );
        embed.addField(
            `Webcast`,
            this.webcast.live ? `[Webcast now live!](${this.webcast.url})` : `No livestream available (yet)`
        )

        if (this.infographicUrl) embed.setImage(this.infographicUrl)
        if (this.symbolImageUrl) embed.setImage(this.symbolImageUrl)


        return embed
    }
}

export class LaunchProviderExtended extends LaunchProvider {
    type: string
    countryCode: string
    description: string
    foundingYear: string
    administrator: string
    launches: {
        attempted: number
        successful: number
        landings: {
            attempted: number
            successful: number
        }
    }
    logoUrl: string
    wikipedia: string

    constructor(json: any) {
        super(json)

        this.type = json.type
        this.countryCode = json.country_code
        this.description = json.description
        this.foundingYear = json.founding_year
        this.administrator = json.administrator
        this.launches = {
            attempted: json.total_launch_count,
            successful: json.successful_launches,
            landings: {
                attempted: json.attempted_landings,
                successful: json.successful_landings
            }
        }

        this.wikipedia = json.wiki_url
        this.logoUrl = json.logo_url
    }
}

export class RocketExtended extends Rocket {
    infoUrl: string
    description: string
    dimensions: { launchLength: number, diameter: number, mass: number }
    firstFlight: Date
    capacityLeo: number
    launches: { count: number, successful: number }
    //TODO missing properties

    constructor(json: any) {
        super(json)

        this.infoUrl = json.configuration.url
        this.description = json.configuration.description
        this.dimensions = {
            launchLength: json.configuration["length"],
            diameter: json.configuration.diameter,
            mass: json.configuration.launch_mass
        }
        this.firstFlight = new Date(json.configuration.maiden_flight)
        this.capacityLeo = json.configuration.leo_capacity
        this.launches = {
            count: json.configuration.total_launch_count,
            successful: json.configuration.successful_launches
        }
    }
}

