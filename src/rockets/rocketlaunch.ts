export class Launch {

    name: string
    id: string
    sourceJSON: any
    symbolImageUrl: string
    infographicUrl: string
    provider: LaunchProvider
    mission: Mission
    net: Date
    launchpad: Launchpad
    rocket: Rocket
    status: LaunchStatus
    infoUrl: string

    constructor(sourceJSON: any) {
        this.sourceJSON = sourceJSON
        this.name = sourceJSON.name
        this.id = sourceJSON.id
        this.symbolImageUrl = sourceJSON.symbolImageUrl
        this.infographicUrl = sourceJSON.infographicUrl
        this.provider = new LaunchProvider(sourceJSON.launch_service_provider)
        this.mission = new Mission(sourceJSON.mission)
        this.net = new Date(sourceJSON.net)
        this.launchpad = new Launchpad(sourceJSON.pad)
        this.rocket = new Rocket(sourceJSON.rocket)
        this.status = new LaunchStatus(sourceJSON.status)
        this.infoUrl = sourceJSON.url
    }
}

class LaunchProvider {
    id: number
    name: string

    constructor(json: any) {
        this.id = json.id
        this.name = json.name
    }
}

class Mission {
    id: number
    name: string
    orbit: Orbit
    type: string
    description: string

    constructor(json: any) {
        this.id = json.id
        this.name = json.name
        this.orbit = new Orbit(json.orbit)
        this.type = json.type
        this.description = json.description
    }
}

class Orbit {
    _name: string
    _abbreviation: string
    _id: number

    private idTable = {
        "8": "Niedriger Erdorbit"
    } as { [id: string]: string }

    get name() {
        return `${this._name} (${this._abbreviation}) - ${this.idTable[this._id.toString()]}`
    }

    constructor(json: any) {
        this._name = json.name
        this._abbreviation = json.abbrev
        this._id = json.id
    }
}

class Launchpad {
    agencyID: number //TODO: Get whole Agency
    id: number
    name: string
    locationName: string

    constructor(json: any) {
        this.agencyID = json.agency_id
        this.id = json.id
        this.name = json.name
        this.locationName = json.location.name
    }
}

class Rocket {
    id: number
    name: string
    variantId: number

    constructor(json: any) {
        this.id = json.id
        this.name = json.configuration.full_name
        this.variantId = json.configuration.id
    }
}

class LaunchStatus {
    id: number
    name: string

    constructor(json: any) {
        this.id = json.id
        this.name = json.name
    }
}