package client

type InventoryData struct {
	Inventory Inventory `json:"Inventory"`
}
type Inventory struct {
	Meters    []Meter    `json:"meters"`
	Batteries []Battery  `json:"batteries"`
	Inverters []Inverter `json:"inverters"`
}

type Meter struct {
	Name                       string `json:"name,omitempty"`
	Model                      string `json:"model,omitempty"`
	FirmwareVersion            string `json:"firmwareVersion,omitempty"`
	ConnectedTo                string `json:"connectedTo,omitempty"`
	ConnectedSolaredgeDeviceSN string `json:"ConnectedSolaredgeDeviceSN,omitempty"`
	Type                       string `json:"type,omitempty"`
	Form                       string `json:"form,omitempty"`
	SerialNumber               string `json:"SN,omitempty"`
}

type Battery struct {
	Name                string  `json:"name,omitempty"`
	Manufacturer        string  `json:"manufacturer,omitempty"`
	Model               string  `json:"model,omitempty"`
	FirmwareVersion     string  `json:"firmwareVersion,omitempty"`
	ConnectedTo         string  `json:"connectedTo,omitempty"`
	ConnectedInverterSn string  `json:"connectedInverterSn,omitempty"`
	NameplateCapacity   float32 `json:"nameplateCapacity,omitempty"`
	SerialNumber        string  `json:"SN,omitempty"`
}

type Inverter struct {
	Name                string `json:"name,omitempty"`
	Manufacturer        string `json:"manufacturer,omitempty"`
	Model               string `json:"model,omitempty"`
	CommunicationMethod string `json:"communicationMethod,omitempty"`
	CpuVersion          string `json:"cpuVersion,omitempty"`
	SerialNumber        string `json:"SN,omitempty"`
	ConnectedOptimizers uint   `json:"connectedOptimizers,omitempty"`
}

type EquipmentTelemetry struct {
	Data TelemetryCollection `json:"data"`
}

type TelemetryCollection struct {
	Count       uint                `json:"count"`
	Telemetries []InverterTelemetry `json:"telemetries"`
}

type InverterTelemetry struct {
	Date                  string    `json:"date,omitempty"`
	TotalActivePower      float32   `json:"totalActivePower,omitempty"`
	DcVoltage             float32   `json:"dcVoltage,omitempty"`
	GroundFaultResistance float32   `json:"groundFaultResistance,omitempty"`
	PowerLimit            float32   `json:"powerLimit,omitempty"`
	TotalEnergy           float32   `json:"totalEnergy,omitempty"`
	Temperature           float32   `json:"temperature,omitempty"`
	InverterMode          string    `json:"inverterMode,omitempty"`
	OperationMode         uint      `json:"operationMode,omitempty"`
	L1Data                PhaseData `json:"L1Data"`
}

type PhaseData struct {
	AcCurrent     float32 `json:"acCurrent,omitempty"`
	AcFrequency   float32 `json:"acFrequency,omitempty"`
	ApparentPower float32 `json:"apparentPower,omitempty"`
	ActivePower   float32 `json:"activePower,omitempty"`
	ReactivePower float32 `json:"reactivePower,omitempty"`
	CosPhi        float32 `json:"cosPhi,omitempty"`
}
