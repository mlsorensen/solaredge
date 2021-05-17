'use strict';
const { useState, useEffect } = React
const {XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, FlexibleWidthXYPlot, LineSeries, LineMarkSeries, VerticalBarSeries, AreaSeries} = reactVis;

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
        //let powerClassName = (last.power < 0 ? "text-warning" : "") + (last.power > 0 ? "text-success" : "")
        let powerStyle = {'color':'black'}
        if (last.power !== 0) {
            powerStyle = (last.power >= 0 ? {'color':'#52c243'} : {'color':'#c14a66'})
        }
        return (
                <span className={"border-left border-dark"}>
                <div className={"row bg-primary bg-gradient text-white"}>
                    <div className={"col-12"}>{props.battery.name}</div>
                </div>
                <div className={"row"}>
                    <div className={"col-12"}>{props.battery.SN}</div>
                </div>
                <div className={"row"}>
                    <div className={"col-12"}>Rate: <span style={powerStyle}> {last.power.toFixed(2)}VA </span></div>
                </div>
                <div className={"row"}>
                    <div className={"col-12"}>Level: {last.batteryPercentageState.toFixed(2)}%</div>
                </div>
                <div className={"row"}>
                    <div className={"col-12"}>Temp: {CtoF(last.internalTemp)}&deg;F</div>
                </div>
                <div>
                    <GenericFlexWidthAreaChart2
                        dataPositive={details.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.power > 0 ? t.power : 0 , y0:0}
                            }
                        )}
                        dataNegative={details.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.power < 0 ? t.power : 0, y0: 0}
                            }
                        )}
                        colorPositive={'#52c243'}
                        colorNegative={'#c14a66'}
                    />
                </div>
                <div>
                    <GenericFlexWidthAreaChart
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

function GenericFlexWidthAreaChart(props) {
    return (
        <FlexibleWidthXYPlot height={150} className="row"  >
            <HorizontalGridLines />
            <VerticalGridLines tickTotal={3}/>
            <XAxis tickTotal={3}/>
            <YAxis />
            <AreaSeries opacity={0.4} data={props.data} color={props.color}/>
            <LineMarkSeries size={0} opacity={1} strokeWidth={.5} data={props.data} color={props.color}/>
        </FlexibleWidthXYPlot>
    )
}

function GenericFlexWidthAreaChart2(props) {
    return (
        <FlexibleWidthXYPlot height={150} className="row"  >
            <HorizontalGridLines />
            <VerticalGridLines tickTotal={3}/>
            <XAxis hideTicks/>
            <YAxis />
            <AreaSeries opacity={0.4} data={props.dataNegative} color={props.colorNegative}/>
            <AreaSeries opacity={0.4} data={props.dataPositive} color={props.colorPositive}/>
            <LineSeries opacity={1} strokeWidth={.5} data={props.dataNegative} color={props.colorNegative}/>
            <LineSeries opacity={1} strokeWidth={.5} data={props.dataPositive} color={props.colorPositive}/>
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
                <div className="row">
                    <div className="col-6">AC Voltage: {(last.L1Data.apparentPower/last.L1Data.acCurrent).toFixed(2)}</div>
                    <div className="col-6">DC Voltage: {last.dcVoltage}</div>
                </div>
                <div className="row">
                    <div className="col-6">Firmware: {props.inverter.cpuVersion}</div>
                    <div className="col-6">Last Update: {last.date}</div>
                </div>
                <div className="row">
                    <div className="col-6">-</div>
                    <div className="col-6"></div>
                </div>
                <div>
                    <GenericFlexWidthAreaChart2
                        dataPositive={details.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.L1Data.apparentPower > 0 ? t.L1Data.apparentPower : 0 , y0: 0}
                            }
                        )}
                        dataNegative={[]}
                        colorPositive={'green'}
                        colorNegative={'red'}
                    />
                </div>
                <div>
                    <GenericFlexWidthAreaChart
                        data={details.telemetries.map(
                            function(t,i) {
                                return {x: i, y:CtoF(t.temperature), y0:60}
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
                    <div className="col-6 inverter-container bg-light"><InverterDetail inverter={props.inverter}/></div>
                    <div className="col-6 battery-container border-dark border-left" style={{"backgroundColor": "#ececec","borderLeft":"1px solid black"}}>
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
