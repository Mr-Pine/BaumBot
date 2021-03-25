import { Launch, LaunchProvider, Rocket} from "./rocketlaunch";

export class LaunchExtended extends Launch{
    launchWindow: {start: Date, end: Date}
    provider: LaunchProviderExtended
    rocket: RocketExtended
    webcast: {live: boolean, url: string}

    constructor(sourceJSON: any){
        super(sourceJSON)

        this.launchWindow = {
            start: new Date(sourceJSON.window_start),
            end: new Date(sourceJSON.window_end)
        }

        this.provider = new LaunchProviderExtended(sourceJSON.launch_service_provider)
        this.rocket = new RocketExtended(sourceJSON.rocket)

        this.webcast = {live: sourceJSON.webcast_live, url: sourceJSON.vidURLs[0]}
    }

    getExtended = async () => {
        return await this;
    }
}

class LaunchProviderExtended extends LaunchProvider{
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
    wikipedia: string

    constructor(json: any){
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
    }
}

class RocketExtended extends Rocket{
    infoUrl: string
    description: string
    dimensions: {launchLength: number, diameter: number, mass: number}
    firstFlight: Date
    capacityLeo: number
    launches: {count: number, successful: number}
    //TODO missing properties

    constructor(json: any){
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

