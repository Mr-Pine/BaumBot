import fetch, { Headers } from "node-fetch";
import { LaunchExtended, LaunchProviderExtended, RocketExtended } from "./launchExtended";
import { Mission, Launchpad, LaunchStatus, LaunchProvider } from "./rocketlaunch";

export class LaunchSpaceX extends LaunchExtended {

    launchpad: LaunchpadSpaceX
    initialized: Promise<any>;
    spaceXJSON: any
    sourceJSON: any | undefined
    rocket: RocketSpaceX

    patchUrl: string

    constructor(spaceXID: string)
    constructor(sourceJSON: any)
    constructor(SpXIDorJSON: any) {
        /* if (typeof SpXIDorJSON !== "string") {
            super(SpXIDorJSON)
            
        } else {
            super()
        }

        this.initialized = new Promise(async resolve => {
            if (typeof SpXIDorJSON === "string") {
                await this.setSpaceXDataCommon(SpXIDorJSON)
            } else {
                await this.setSpaceXData(SpXIDorJSON.r_spacex_api_id)
            }


            resolve(undefined)
        }) */
        super()
        if (typeof SpXIDorJSON !== "string") {
            this.initialized = new Promise(async resolve => {
                await this.updateData(SpXIDorJSON)

                resolve(undefined)
            })
        }
    }

    async updateData(SpXIDorJSON: any) {
        if (typeof SpXIDorJSON !== "string") {
            await super.updateData(SpXIDorJSON)
        }

        if (typeof SpXIDorJSON === "string") {
            await this.setSpaceXDataCommon(SpXIDorJSON)
        } else {
            await this.setSpaceXData(SpXIDorJSON.r_spacex_api_id)
        }
    }

    private async setSpaceXDataCommon(id: string) {
        let json = await LaunchSpaceX.getSpaceXJSON("launches", id) //TODO use query route!; https://github.com/r-spacex/SpaceX-API/blob/master/docs/v4/queries.md 

        this.net = new Date(json.date_utc)
        this.launchWindow = { start: this.net, end: this.net }
        this.rocket = new RocketSpaceX(json)
        await this.rocket.initialized
        //TODO: implement ProviderSpaceX
        this.name = json.name
        this.id, this.sourceJSON, this.symbolImageUrl = "null"
        this.mission = undefined //TODO: Mission SpaceX
        this.net = new Date(json.date_utc)
        this.launchpad = new LaunchpadSpaceX(json.launchpad as string)
        await this.launchpad.initialized
        this.status
        this.webcast = { live: json.links.webcast != null, url: json.links.webcast }

        this.setSpaceXData(json)

    }

    async setSpaceXData(id: string): Promise<void>
    async setSpaceXData(json: any): Promise<void>
    async setSpaceXData(jsonOrId: any | string) {
        let json;
        if (typeof jsonOrId === "string") {
            json = await LaunchSpaceX.getSpaceXJSON("launches", jsonOrId) as any
        } else {
            json = jsonOrId
        }

        this.rocket = this.sourceJSON ? new RocketSpaceX(json, this.sourceJSON.rocket) : new RocketSpaceX(json)
        await this.rocket.initialized;
        if (this.mission) this.mission.description = json.details
        this.spaceXJSON = json
        this.patchUrl = json.links.patch.large
        if (json.links.flickr.original.length != 0) this.symbolImageUrl = json.links.flickr.original[0]
        this.webcast.url = json.links.webcast
        this.net = new Date(json.date_utc)
    }

    static async getSpaceXJSON(route: string, id?: string) {
        let headers = new Headers([["Accept", "application/json"]])
        let apiUrl = `https://api.spacexdata.com/v4/${route}/` + (typeof id !== "undefined" ? id : "")
        let response = await fetch(apiUrl, { method: "GET", headers: headers })
        let json = await response.json()

        return json
    }

    getEmbed() {
        let embed = super.getEmbed()
        if (this.patchUrl) embed.setThumbnail(this.patchUrl)
        let core = this.rocket.core
        embed.addField(
            `Core: ${core.identifier}`,
            `Flight: ${core.flightNumber} / ${core.launchCount}\n` +
            `Landing: ${!core.landingAttempt ? "not " : ""} attempted and ${!core.landingAttempt ? "not " : ""} successful\n` +
            `Landing type: ${core.landingType}` //TODO: and landing on ${core.landingPad.name}
        )
        let fields = embed.fields;
        let statusField = fields[fields.length - 2]
        fields[fields.length - 2] = fields[fields.length - 1];
        fields[fields.length - 1] = statusField;
        embed.fields = fields;
        return embed
    }

    async doUpdate(i: number, launchJSON?: any) {
        this.lastUpdatedT = i

        let json = typeof launchJSON == "undefined" ? await this.getOwnAPIData() : launchJSON

        if((json.detail as string)?.startsWith("Request was throttled")) {
            return false
        }

        typeof launchJSON == "undefined" ? await this.updateData(json) : super.updateData(json)
        this.lastUpdated = (new Date()).getTime() - this.net.getTime()
        this.lastUpdatedT = i
        console.log("doing update")
        return true;
    }
}

class LaunchpadSpaceX extends Launchpad {

    initialized: Promise<any>;

    agencyID = 121

    constructor(id: string)
    constructor(json: any)
    constructor(jsonID?: any) {
        super()

        if (typeof jsonID === "string") {
            this.initialized = new Promise(async resolve => {

                let json = await LaunchSpaceX.getSpaceXJSON("launchpads", jsonID)
                this.id = json.id
                this._name = json.full_name
                this._locationName = `${json.locality}, ${json.region}`
                resolve(undefined)
            })
        } else {
            this.id = jsonID.id
            this._name = jsonID.full_name
            this._locationName = `${jsonID.locality}, ${jsonID.region}`
            this.initialized = new Promise(resolve => { resolve(undefined) })
        }
    }
}

class RocketSpaceX extends RocketExtended {
    capacity: { leo: number, gto: number, mars: number }
    initialized: Promise<any>
    core: CoreSpaceX

    get capacityInfo() {
        return `capacity to: LEO: ${this.capacity.leo / 1000}t, GTO: ${this.capacity.gto / 1000}t, MARS: ${this.capacity.mars / 1000}t`
    }

    constructor(spaceXJson: any)
    constructor(spaceXJson: any, ll2JSON: any)
    constructor(spaceXJson: any, ll2JSON?: any) {
        if (typeof ll2JSON === "undefined") {
            super(); //TODO implement properties
            this.capacity = {} as { leo: number, gto: number, mars: number }
        } else {
            super(ll2JSON)
        }

        this.initialized = new Promise(async resolve => {
            let rocketJSON = await LaunchSpaceX.getSpaceXJSON('rockets', spaceXJson.rocket)

            rocketJSON.payload_weights.forEach((weight: any) => {
                this.capacity[weight.id as "leo" | "gto" | "mars"] = weight.kg
            })

            this.core = new CoreSpaceX(spaceXJson.cores[0])
            await this.core.initialize

            resolve(undefined)
        })


    }
}

class CoreSpaceX {
    initialize: Promise<any>

    coreID: string

    flightNumber: number
    landingType: string
    private landingTypes = { asds: "Autonomous spaceport drone ship", rtls: "Return to launch site" }
    landingPadID: string
    landingAttempt: boolean
    landingSuccess: boolean

    blockNumber: number
    protected _serialNumber: string
    landings: { asds: { attempted: number, success: number }, rtls: { attempted: number, success: number } }
    launchCount: number

    get identifier() {
        return `${this._serialNumber}-${this.flightNumber}`
    }

    constructor(core: any) {
        this.coreID = core.core
        this.flightNumber = core.flight
        this.landingType = this.landingTypes[core.landing_type.toLowerCase() as "asds" | "rtls"]
        this.landingPadID = core.landpad
        this.landingAttempt = core.landing_attempt
        this.landingSuccess = core.landing_success

        let coreJSON;

        this.initialize = new Promise(async resolve => {
            coreJSON = await LaunchSpaceX.getSpaceXJSON('cores', this.coreID)

            this.blockNumber = coreJSON.block
            this._serialNumber = coreJSON.serial
            this.landings = { asds: { attempted: coreJSON.asds_attempts, success: coreJSON.asds_landings }, rtls: { attempted: coreJSON.rtls_attempts, success: coreJSON.rtls_success } }
            this.launchCount = coreJSON.launches.length

            resolve(undefined)
        })
    }
}

//TODO SpaceX Payload