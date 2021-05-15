package client

type EquipmentTelemetry struct {
	Data TelemetryCollection
}

type TelemetryCollection struct {
	Count uint
	Telemetries []InverterTelemetry
}

type InverterTelemetry struct {
	Date string
	TotalActivePower float32
	DcVoltage float32
	GroundFaultResistance float32
	PowerLimit float32
	TotalEnergy float32
	Temperature float32
	InverterMode string
	OperationMode uint
	L1Data PhaseData
}

type PhaseData struct {
	AcCurrent float32
	AcFrequency float32
	ApparentPower float32
	ActivePower float32
	ReactivePower float32
	CosPhi float32
}
