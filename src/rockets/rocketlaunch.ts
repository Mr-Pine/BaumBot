import { LaunchExtended } from "./launchExtended"

export class Launch {

    name: string
    id: string
    sourceJSON: any
    symbolImageUrl: string
    infographicUrl: string
    provider: LaunchProvider
    mission: Mission | undefined
    net: Date
    launchpad: Launchpad
    rocket: Rocket
    status: LaunchStatus
    infoUrl: string

    constructor()
    constructor(sourceJSON: any)
    constructor(sourceJSON?: any) {

        if (typeof sourceJSON !== "undefined") {
            this.sourceJSON = sourceJSON
            this.name = sourceJSON.name
            this.id = sourceJSON.id
            this.symbolImageUrl = sourceJSON.image              //TODO: Check if
            this.infographicUrl = sourceJSON.infographicUrl     //TODO: really necessary here...
            this.provider = new LaunchProvider(sourceJSON.launch_service_provider)
            this.mission = (sourceJSON.mission !== null) ? new Mission(sourceJSON.mission) : undefined
            this.net = new Date(sourceJSON.net)
            this.launchpad = new Launchpad(sourceJSON.pad)
            this.rocket = new Rocket(sourceJSON.rocket)
            this.status = new LaunchStatus(sourceJSON.status)
            this.infoUrl = sourceJSON.url
        }
    }

    get embedField() {
        let missionName = this.mission ? this.mission.name : this.name.substr(this.name.indexOf("|") + 1).trim()
        return {
            name: `${this.tMinus()} | ${this.name}`,
            value: `${this.mission ? this.mission.description : "no description available"}\n\n` +
                `**Quick Stats**:\n` +
                `Mission Name: ${missionName}\n` +
                `Launch Time: ${this.net.toLocaleString('de-DE')}\n` +
                `Launch at: ${this.launchpad.nameLocation}\n` +
                `Launch Status: ${this.status.name}\n\n` +
                `more info: \`/rockets launches id:${this.id}\`\n`
        }
    }

    tMinus() {
        let now = new Date();
        let diff = (this.net.getTime() - now.getTime()) / 1000;
        let diffAbs = Math.abs(diff)

        let days = Math.floor(diffAbs / (60 * 60 * 24))
        let hours = Math.floor((diffAbs % (60 * 60 * 24)) / (60 * 60));
        let minutes = Math.floor((diffAbs % (60 * 60)) / 60);

        return `T${Math.sign(-diff) < 1 ? '-' : '+'} ${days}d ${hours}h ${minutes}m`
    }
}

export class LaunchProvider {
    id: number
    name: string

    constructor(json: any) {
        this.id = json.id
        this.name = json.name
    }
}

export class Mission {
    id: number
    name: string
    orbit: Orbit | null;
    type: string
    description: string

    constructor(json: any) {
        this.id = json.id
        this.name = json.name
        this.orbit = (json.orbit !== null) ? new Orbit(json.orbit) : null
        this.type = json.type
        this.description = json.description
    }
}

export class Orbit {
    protected _name: string
    protected _abbreviation: string
    protected _id: number

    private idTable = {
        "8": "Niedriger Erdorbit"
    } as { [id: string]: string }

    get name() {
        return (`${this._name} (${this._abbreviation})` + (this.idTable[this._id.toString()] ? ` - ${this.idTable[this._id.toString()]}` : ""));
    }

    constructor(json: any) {
        this._name = json.name
        this._abbreviation = json.abbrev
        this._id = json.id
    }
}

export class Launchpad {
    agencyID: number //MAYBE: Get whole Agency
    id: number | string
    protected _name: string
    protected _locationName: string
    get nameLocation() { return `${this._name}, ${this._locationName}` }

    constructor()
    constructor(json: any)
    constructor(json?: any) {
        if (typeof json === "undefined") {
            return;
        }

        this.agencyID = json.agency_id
        this.id = json.id
        this._name = json.name
        this._locationName = json.location.name
    }
}

export class Rocket {
    id: number
    name: string
    variantId: number


    constructor()
    constructor(json: any)
    constructor(json?: any) {
        if (json) {
            this.id = json.id
            this.name = json.configuration.full_name
            this.variantId = json.configuration.id
        }
    }
}

export class LaunchStatus {
    id: number
    name: string
    abbreviation: string

    constructor(json: any) {
        this.id = json.id
        this.name = json.name
        this.abbreviation = json.abbrev
    }
}