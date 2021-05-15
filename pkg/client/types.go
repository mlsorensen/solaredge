package client

type InventoryData struct {
	Inventory Inventory
}
type Inventory struct {
	Meters    []Meter
	Batteries []Battery
	Inverters []Inverter
}

type Meter struct {
	Name                       string
	Manufacturer               string
	Model                      string
	FirmwareVersion            string
	ConnectedTo                string
	ConnectedSolaredgeDeviceSN string
	Type                       string
	Form                       string
	SerialNumber               string `json:"SN,omitempty"`
}

type Battery struct {
	Name                string
	Manufacturer        string
	Model               string
	FirmwareVersion     string
	ConnectedTo         string
	ConnectedInverterSn string
	NameplateCapacity   float32
	SerialNumber        string `json:"SN,omitempty"`
}

type Inverter struct {
	Name                string
	Manufacturer        string
	Model               string
	CommunicationMethod string
	CpuVersion          string
	SerialNumber        string `json:"SN,omitempty"`
	ConnectedOptimizers uint
}

type EquipmentTelemetry struct {
	Data TelemetryCollection
}

type TelemetryCollection struct {
	Count       uint
	Telemetries []InverterTelemetry
}

type InverterTelemetry struct {
	Date                  string
	TotalActivePower      float32
	DcVoltage             float32
	GroundFaultResistance float32
	PowerLimit            float32
	TotalEnergy           float32
	Temperature           float32
	InverterMode          string
	OperationMode         uint
	L1Data                PhaseData
}

type PhaseData struct {
	AcCurrent     float32
	AcFrequency   float32
	ApparentPower float32
	ActivePower   float32
	ReactivePower float32
	CosPhi        float32
}
