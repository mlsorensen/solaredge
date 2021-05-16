'use strict';
const { useState, useEffect, useRef } = React

function CtoF(c) {
    return ((c * 9/5) + 32).toFixed(2)
}

function Battery(props) {
    const [error, setError] = useState(null);
    const [details, setDetails] = useState({ telemetryCount: 0, telemetries: []});

    useEffect(() => {
        fetch("../api/inventory/batteries/" + props.battery.SN + "/telemetry")
            .then(res => res.json())
            .then(
                (result) => {
                    setDetails(result);
                },
                (error) => {
                    setError(error);
                }
            )
    },[])

    if (error) {
        return <div className={"inverter-detail"}>error</div>
    } else if (details.telemetryCount === 0) {
        return <div className={"inverter-detail"}>Loading...</div>
    } else {
        console.log(details)
        let last = details.telemetries[details.telemetries.length - 1]
        return (
            <div className="battery">
                <div className={"row bg-primary bg-gradient text-white"}>{props.battery.name}</div>
                <div className={"row bg-light"}>{props.battery.SN}</div>
                <div className={"row bg-light " + (last.power < 0 ? "text-warning" : "") + (last.power > 0 ? "text-success" : "")}>Rate: {last.power.toFixed(2)}VA</div>
                <div className={"row bg-light"}>Level: {last.batteryPercentageState.toFixed(2)}%</div>
                <div className={"row bg-light"}>Temp: {CtoF(last.internalTemp)}&deg;F</div>
            </div>
        )
    }
}

function InverterDetail(props) {
    const [error, setError] = useState(null);
    const [details, setDetails] = useState({ count: 0, telemetries: []});

    useEffect(() => {
        fetch("../api/inventory/inverters/" + props.inverter.SN + "/telemetry")
            .then(res => res.json())
            .then(
                (result) => {
                    setDetails(result);
                },
                (error) => {
                    setError(error);
                }
            )
    },[])

    if (error) {
        return <div className={"inverter-detail"}>error</div>
    } else if (details.count === 0) {
        return <div className={"inverter-detail"}>Loading...</div>
    } else {
        let last = details.telemetries[details.telemetries.length - 1]
        return (
            <div className={"inverter-detail"}>
                <div className="row">
                    <div className="col-sm-4">Mode: {last.inverterMode}</div>
                    <div className="col-sm-4">Temp: {CtoF(last.temperature)}&deg;F</div>
                </div>
                <div className="row">
                    <div className="col-sm-4">Power: {last.L1Data.apparentPower.toFixed(2)}VA</div>
                    <div className="col-sm-4">Panels: {props.inverter.connectedOptimizers}</div>
                </div>
            </div>
        )
    }
}

function Inverter(props) {
    return (
        <div className="inverter" key={props.num}>
            <div className="row bg-dark bg-gradient text-white">
                <div className="col-sm-2">{props.inverter.name}</div>
                <div className="col-sm-4">Serial: {props.inverter.SN}</div>
                <div className="col-sm-6">Model: {props.inverter.model}</div>
            </div>
            <div className="row">
                <div className="col-sm-8 inverter-container"><InverterDetail inverter={props.inverter}/></div>
                <div className="col-sm-4 battery-container"><Battery battery={props.battery}/></div>
            </div>
        </div>
    )
}

function App() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch("../api/inventory")
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setItems(result);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    },[])

    if (error) {
        return <div className={"container"}>error</div>
    } else if (!isLoaded || items.inverters === undefined) {
        return <div className="container">Loading...</div>
    } else {
        return (
            <div className="container">
                {items.inverters.map((v, i) => {
                    let b = items.batteries.find( element => element.connectedInverterSn === v.SN )
                    console.log(b)
                    return <Inverter inverter={v} battery={b} num={i} key={i}/>
                })}
            </div>
        )
    }
}

const domContainer = document.querySelector('#viewport');
ReactDOM.render(<App/>, domContainer);