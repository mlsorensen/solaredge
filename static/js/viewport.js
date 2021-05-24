'use strict';
const { useState, useEffect, useRef } = React
const {DiscreteColorLegend, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, FlexibleWidthXYPlot, LineSeries, LineMarkSeries, AreaSeries} = reactVis;

function CtoF(c) {
    let f = ((c * 9/5) + 32).toFixed(2)
    return parseFloat(f)
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
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

    useInterval(() => {
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
    },30000)

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
                    <div className={"col-12"}>Rate: <span style={powerStyle}> {last.power.toFixed(2)}W </span></div>
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
                        title={"Power"}
                        hideXLabels={true}
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
                        title={"Battery %"}
                    />
                </div>
                </span>
        )
    }
}

function GenericFlexWidthAreaChart(props) {
    return (
        <FlexibleWidthXYPlot height={150} className="row px-1">
            <HorizontalGridLines />
            <VerticalGridLines tickTotal={6}/>
            {props.hideXLabels ? <XAxis hideTicks/> : <XAxis tickTotal={6} tickFormat={formatXAxisLabel}/>}
            <YAxis tickTotal={5} title={props.title}/>
            <AreaSeries opacity={0.4} data={props.data} color={props.color}/>
            <LineMarkSeries size={0} opacity={1} strokeWidth={.5} data={props.data} color={props.color}/>
        </FlexibleWidthXYPlot>
    )
}

function GenericFlexWidthAreaChart2(props) {
    return (
        <FlexibleWidthXYPlot height={150} className="row px-1">

            <VerticalGridLines tickTotal={5}/>
            {props.hideXLabels ? <XAxis hideTicks/> : <XAxis tickTotal={5} tickFormat={formatXAxisLabel}/>}
            <YAxis title={props.title}/>
            <AreaSeries opacity={0.4} data={props.dataNegative} color={props.colorNegative}/>
            <AreaSeries opacity={0.4} data={props.dataPositive} color={props.colorPositive}/>
            <LineSeries opacity={1} strokeWidth={.5} data={props.dataNegative} color={props.colorNegative}/>
            <LineSeries opacity={1} strokeWidth={.5} data={props.dataPositive} color={props.colorPositive}/>
        </FlexibleWidthXYPlot>
    )
}

function InverterEnergyChart(props) {
    return (
        <FlexibleWidthXYPlot height={300} className="row px-1">
            <HorizontalGridLines />
            <DiscreteColorLegend items={props.legend} orientation={"horizontal"} style={{position: 'absolute', left: '60%', top: '15px'}}/>
            <VerticalGridLines tickTotal={5}/>
            {props.hideXLabels ? <XAxis hideTicks/> : <XAxis tickTotal={5} tickFormat={formatXAxisLabel}/>}
            <YAxis title={props.title}/>
            <AreaSeries opacity={0.3} data={props.data1} color={props.color1}/>
            <AreaSeries opacity={0.3} data={props.data2} color={props.color2}/>
            <AreaSeries opacity={0.3} data={props.data3} color={props.color3}/>
            <LineSeries opacity={1} strokeWidth={1} data={props.data1} color={props.color1}/>
            <LineSeries opacity={1} strokeWidth={1} data={props.data2} color={props.color2}/>
            <LineSeries opacity={1} strokeWidth={1} data={props.data3} color={props.color3}/>
        </FlexibleWidthXYPlot>
    )
}

function formatXAxisLabel(x) {
    let minutes = (x - 288) * 5
    let offset = -60000 * minutes
    let label = new Date(Date.now() - offset)
    return label.toLocaleString("en-US", {hour: "2-digit", minute:"2-digit"})
}

function InverterDetail(props) {
    const [error, setError] = useState(null);
    const [inverterDetails, setInverterDetails] = useState({ count: 0, telemetries: []});
    const [batteryDetails, setBatteryDetails] = useState({ telemetryCount: 0, telemetries: []});

    useEffect(() => {
        fetch("../api/telemetry/inverters/" + props.inverter.SN)
            .then(res => res.json())
            .then(
                (result) => {
                    setInverterDetails(result);
                },
                (error) => {
                    setError(error);
                }
            )
        fetch("../api/telemetry/batteries/" + props.battery.SN)
            .then(res => res.json())
            .then(
                (result) => {
                    setBatteryDetails(result);
                },
                (error) => {
                    setError(error);
                }
            )
    },[])

    useInterval(() => {
        fetch("../api/telemetry/inverters/" + props.inverter.SN)
            .then(res => res.json())
            .then(
                (result) => {
                    setInverterDetails(result);
                },
                (error) => {
                    setError(error);
                }
            )
        fetch("../api/telemetry/batteries/" + props.battery.SN)
            .then(res => res.json())
            .then(
                (result) => {
                    setBatteryDetails(result);
                },
                (error) => {
                    setError(error);
                }
            )
    },30000)

    if (error) {
        return <div className={"inverter-detail"}>error</div>
    } else if (inverterDetails.count === 0 || batteryDetails.telemetryCount === 0) {
        return <div className={"inverter-detail"}>Loading...</div>
    } else {
        let inverterLast = inverterDetails.telemetries[inverterDetails.telemetries.length - 1]
	let apparentPower = 0
	let acCurrent = 1
	if (inverterLast.inverterMode == "MPPT") {
	    apparentPower = inverterLast.L1Data.apparentPower
	    acCurrent = inverterLast.L1Data.acCurrent
	}
        return (
            <div className={"inverter-detail"}>
                <div className="row">
                    <div className="col-6">Mode: {inverterLast.inverterMode}</div>
                    <div className="col-6">Temp: {CtoF(inverterLast.temperature)}&deg;F</div>
                </div>
                <div className="row">
                    <div className="col-6">Power: {apparentPower.toFixed(2)}VA</div>
                    <div className="col-6">Panels: {props.inverter.connectedOptimizers}</div>
                </div>
                <div className="row">
                    <div className="col-6">AC Voltage: {(apparentPower/acCurrent).toFixed(2)}</div>
                    <div className="col-6">DC Voltage: {inverterLast.dcVoltage}</div>
                </div>
                <div className="row">
                    <div className="col-6">Firmware: {props.inverter.cpuVersion}</div>
                    <div className="col-6">Last Update: {inverterLast.date}</div>
                </div>

                <div>
                    <InverterEnergyChart
                        data1={inverterDetails.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.L1Data.apparentPower > 0 ? t.L1Data.apparentPower : 0 , y0: 0}
                            }
                        )}
                        data2={batteryDetails.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.power > 0 ? t.power : 0 , y0:0}
                            }
                        )}
                        data3={batteryDetails.telemetries.map(
                            function(t,i) {
                                return {x: i, y: t.power < 0 ? Math.abs(t.power) : 0, y0: 0}
                            }
                        )}

                        color1={'#3e619c'}
                        color2={'#e07932'}
                        color3={'#c14a66'}
                        title={"Power"}
                        hideXLabels={true}
                        legend={[
                            {"title": "AC output", "color": '#3e619c'},
                            {"title":"Battery Discharge","color": '#e07932'},
                            {"title":"Battery Charge","color": '#c14a66'}
                        ]}
                    />
                </div>
                <div>
                    <GenericFlexWidthAreaChart
                        data={inverterDetails.telemetries.map(
                            function(t,i) {
                                return {x: i, y:CtoF(t.temperature)}
                            }
                        )}
                        color={'blue'}
                        title={"Temp °F"}
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
                    <div className="col-8 inverter-container bg-light"><InverterDetail inverter={props.inverter} battery={props.battery}/></div>
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

    useInterval(() => {
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
    },30000)

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
