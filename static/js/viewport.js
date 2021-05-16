'use strict';
const { useState, useEffect, useRef } = React

function Battery(props) {
    return (
        <div className="battery">
            <div className="row bg-primary text-white">
                <div className="col-sm">Battery {props.num}</div>
            </div>
        </div>
    )
}

function InverterDetail(props) {
    const [error, setError] = useState(null);
    //const [isLoaded, setIsLoaded] = useState(false);
    const [details, setDetails] = useState({ count: 0, telemetries: []});

    useEffect(() => {
        fetch("../api/inventory/inverters/" + props.inverter.SN + "/telemetry")
            .then(res => res.json())
            .then(
                (result) => {
                    //setIsLoaded(true);
                    setDetails(result);
                },
                (error) => {
                    //setIsLoaded(true);
                    setError(error);
                }
            )
    },[])

    if (error) {
        return <div className={"inverter-detail"}>error</div>
    } else if (details.count == 0) {
        return <div className={"inverter-detail"}>Loading...</div>
    } else {
        console.log(details)
        let last = details.telemetries[details.count - 1]
        return (
            <div className={"inverter-detail"}>
                <div className="row">
                    <div className="col-sm">Mode: {last.inverterMode}</div>
                    <div className="col-sm">Temp: {last.temperature}C</div>
                    <div className="col-sm">Power: {last.L1Data.apparentPower}VA</div>
                </div>
                <div className="row">
                    <div className="col-sm">Panels: {props.inverter.connectedOptimizers}</div>
                </div>
            </div>
        )
    }
}

function Inverter(props) {
    return (
        <div className="inverter" key={props.num}>
            <div className="row bg-dark text-white">
                <div className="col-sm-2">{props.inverter.name}</div>
                <div className="col-sm-4">Serial: {props.inverter.SN}</div>
                <div className="col-sm-6">Model: {props.inverter.model}</div>
            </div>
            <div className="row">
                <div className="col-sm-8 inverter-container"><InverterDetail inverter={props.inverter}/></div>
                <div className="col-sm-4 battery-container"><Battery num={props.num}/></div>
            </div>
        </div>
    )
}

function App() {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch("../api/inventory/inverters")
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
    } else if (!isLoaded) {
        return <div className="container">Loading...</div>
    } else {
        return (
            <div className="container">
                {items.map((v, i) => {
                    return <Inverter inverter={v} num={i} key={i}/>
                })}
            </div>
        )
    }
}

const domContainer = document.querySelector('#viewport');
ReactDOM.render(<App/>, domContainer);