import fetch, { Headers } from "node-fetch"
import { LaunchExtended } from "./launchExtended"
import { getAPIData } from "./rocketindex"

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
    lastUpdated: number;
    extended = false;

    constructor()
    constructor(sourceJSON: any)
    constructor(sourceJSON?: any) {
        if (typeof sourceJSON !== "undefined") {
            this.updateData(sourceJSON)
        }
    }

    updateData(sourceJSON: any) {
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
        this.lastUpdated = (new Date()).getTime() - this.net.getTime();
        this.lastUpdatedT = 0;
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

    static updateTable = [
        24 * 60 * 60 * 1000, //every day
        12 * 60 * 60 * 1000, //12h
        6 * 60 * 60 * 1000, //6h
        3 * 60 * 60 * 1000, //3h
        2 * 60 * 60 * 1000, //2h
        1 * 60 * 60 * 1000, //1h
        30 * 60 * 1000, //30m
        20 * 60 * 1000, //20m
        10 * 60 * 1000, //10m
        5 * 60 * 1000, //5m
        1 * 60 * 1000, //1m
    ]

    lastUpdatedT: number;

    async getOwnAPIData() {
        let headers = new Headers([["Accept", "application/json"]])
        let response = await fetch(this.infoUrl, { method: "GET", headers: headers })
        let json = await response.json()
        return json;
    }

    async update(force = false, launchJSON: any | undefined) {
        if (force && typeof launchJSON != "undefined") {
            return await this.doUpdate(this.lastUpdatedT, launchJSON);
        }

        let tminusTime = Math.abs((new Date()).getTime() - this.net.getTime());

        for (var i = Launch.updateTable.length - 1; i >= 0; i--) {
            let value = Launch.updateTable[i]
            if (tminusTime < value && this.lastUpdatedT < i) {
                console.log(`Update @ ${i}`)
                return await this.doUpdate(i)
            }

            if (i == 0) {
                let difference = Math.abs(this.lastUpdated - ((new Date()).getTime() - this.net.getTime()))
                let multiple = difference / Launch.updateTable[0]
                if (multiple >= 1) {
                    console.log("over one day")
                    return !this.extended ? await this.doUpdate(i, launchJSON) : await this.doUpdate(i)
                }
            }
        }

        return true
    }

    async doUpdate(i: number, launchJSON?: any) {
        this.lastUpdatedT = i

        let json = (typeof launchJSON == "undefined") ? await this.getOwnAPIData() : launchJSON

        if((json.detail as string)?.startsWith("Request was throttled")) {
            return false
        }

        this.updateData(json)
        this.lastUpdated = (new Date()).getTime() - this.net.getTime()
        this.lastUpdatedT = i
        console.log("doing update")
        return true;
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