import { Launch } from "./rocketlaunch"

export function rocketTest(){
    console.log("hello rocket")

    let launch = new Launch("falcon 9 launch", new Date(), 1234)

    return launch
}