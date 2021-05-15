package main

import (
	"fmt"
	"github.com/mlsorensen/solaredge/pkg/client"
)

const apiKey = "YYGC5OTPQOD8BIDWC47WWJJ5AQX5WQCV"
const siteId = "2001637"

func main() {
	c := client.Client{}
	c.SetSiteId(siteId)
	c.SetApiKey(apiKey)

	data, err := c.GetEquipmentTelemetry("73036092-68")
	if err != nil {
		panic(err)
	}

	fmt.Printf("Got data with %d items\n", data.Data.Count)

	inv, err := c.GetInventory()
	if err != nil {
		panic(err)
	}

	fmt.Printf("Found inventory: %d inverters, %d batteries\n", len(inv.Inverters), len(inv.Batteries))

	for _, v := range inv.Inverters {
		fmt.Printf("Found inverter: %s, %s\n", v.Name, v.SerialNumber)
	}
}
