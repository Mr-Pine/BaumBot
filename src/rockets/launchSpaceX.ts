import fetch, { Headers } from "node-fetch";
import { LaunchExtended, LaunchProviderExtended, RocketExtended } from "./launchExtended";
import { Mission, Launchpad, LaunchStatus, LaunchProvider } from "./rocketlaunch";

export class LaunchSpaceX extends LaunchExtended {

    launchpad: LaunchpadSpaceX
    initialized: Promise<any>;

    patchUrl: string

    constructor(spaceXID: string)
    constructor(sourceJSON: any)
    constructor(SpXIDorJSON: any) {
        if (typeof SpXIDorJSON !== "string") {
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
        })



    }

    private async setSpaceXDataCommon(id: string) {
        let json = await LaunchSpaceX.getSpaceXJSON("launches", id)

        this.net = new Date(json.date_utc)
        this.launchWindow = { start: this.net, end: this.net }
        //TODO: implement ProviderSpaceX and RocketSpaceX
        this.name = json.name
        this.id, this.sourceJSON, this.symbolImageUrl = "null"
        this.mission = undefined //TODO: Mission SpaceX
        this.net = new Date(json.date_utc)
        this.launchpad = new LaunchpadSpaceX(json.launchpad as string)
        await this.launchpad.initialized
        this.status
        this.webcast = {live: json.links.webcast != null, url: json.links.webcast}

        this.setSpaceXData(id)

    }

    private async setSpaceXData(id: string) {
        let json = await LaunchSpaceX.getSpaceXJSON("launches", id)

        this.patchUrl = json.links.patch.large
        if (json.links.flickr.original.length != 0) this.symbolImageUrl = json.links.flickr.original[0]
        this.webcast.url = json.webcast
        this.net = new Date(json.date_utc)
    }

    static async getSpaceXJSON(route: string, id?: string) {
        let headers = new Headers([["Accept", "application/json"]])
        let apiUrl = `https://api.spacexdata.com/v4/${route}/` + (typeof id !== "undefined" ? id : "")
        let response = await fetch(apiUrl, { method: "GET", headers: headers })
        let json = await response.json()

        return json
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