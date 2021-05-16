'use strict';
const { useState, useEffect } = React
const {XYPlot, XAxis, YAxis, HorizontalGridLines, FlexibleWidthXYPlot, LineMarkSeries, VerticalBarSeries, AreaSeries} = reactVis;

function CtoF(c) {
    return ((c * 9/5) + 32).toFixed(2)
}

function Battery(props) {
    const [error, setError] = useState(null);
    const [details, setDetails] = useState({ telemetryCount: 0, telemetries: []});

    useEffect(() => {
        fetch("../api/telemetry/batteries/" + props.battery.SN)
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
        let last = details.telemetries[details.telemetries.length - 1]
        let powerClassName = (last.power < 0 ? "text-warning" : "") + (last.power > 0 ? "text-success" : "")
        return (
                <span className={"border-left border-dark"}>
                <div className={"row bg-primary bg-gradient text-white"}>
                    <div className={"col-12"}>{props.battery.name}</div>
                </div>
                <div className={"row"}>
                    <div className={"col-12"}>{props.battery.SN}</div>
                </div>
                <div className={"row"}>
                    <div className={"col-12"}>Rate: <span className={powerClassName}> {last.power.toFixed(2)}VA </span></div>
                </div>
                <div className={"row"}>
                    <div className={"col-12"}>Level: {last.batteryPercentageState.toFixed(2)}%</div>
                </div>
                <div className={"row"}>
                    <div className={"col-12"}>Temp: {CtoF(last.internalTemp)}&deg;F</div>
                </div>
                <div>
                    <GenericFlexWidthChart
                        data={details.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.power, y0:0}
                            }
                        )}
                        color={'#4b7fa1'}
                    />
                </div>
                <div>
                    <GenericFlexWidthChart
                        data={details.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.batteryPercentageState, y0:0}
                            }
                        )}
                        color={'#4ba19e'}
                    />
                </div>
                </span>
        )
    }
}

function GenericFlexWidthChart(props) {
    return (
        <FlexibleWidthXYPlot height={150} className="row"  >
            <HorizontalGridLines />
            <XAxis hideTicks/>
            <YAxis />
            <AreaSeries curve="curveNatural" data={props.data} color={props.color}/>
        </FlexibleWidthXYPlot>
    )
}

function InverterDetail(props) {
    const [error, setError] = useState(null);
    const [details, setDetails] = useState({ count: 0, telemetries: []});

    useEffect(() => {
        fetch("../api/telemetry/inverters/" + props.inverter.SN)
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
                    <div className="col-6">Mode: {last.inverterMode}</div>
                    <div className="col-6">Temp: {CtoF(last.temperature)}&deg;F</div>
                </div>
                <div className="row">
                    <div className="col-6">Power: {last.L1Data.apparentPower.toFixed(2)}VA</div>
                    <div className="col-6">Panels: {props.inverter.connectedOptimizers}</div>
                </div>
                <div>
                    <GenericFlexWidthChart
                        data={details.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.L1Data.apparentPower, y0:0}
                            }
                        )}
                        color={'green'}
                    />
                </div>
                <div>
                    <GenericFlexWidthChart
                        data={details.telemetries.map(
                            function(t,i) {
                                return {x: i, y:CtoF(t.temperature), y0:0}
                            }
                        )}
                        color={'blue'}
                    />
                </div>

            </div>
        )
    }
}

function Inverter(props) {
    return (
        <div className="inverter row p-1" key={props.num}>
            <span className="rounded border border-dark overflow-hidden">
                <div className="row bg-dark bg-gradient text-white">
                    <div className="col-2">{props.inverter.name}</div>
                    <div className="col-4">Serial: {props.inverter.SN}</div>
                    <div className="col-6">Model: {props.inverter.model}</div>
                </div>
                <div className="row">
                    <div className="col-8 inverter-container bg-light"><InverterDetail inverter={props.inverter}/></div>
                    <div className="col-4 battery-container border-dark border-left" style={{"backgroundColor": "#ececec","borderLeft":"1px solid black"}}>
                        <Battery battery={props.battery}/>
                    </div>
                </div>
            </span>
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
                    return <Inverter inverter={v} battery={b} num={i} key={i}/>
                })}
            </div>
        )
    }
}

const domContainer = document.querySelector('#viewport');
ReactDOM.render(<App/>, domContainer);