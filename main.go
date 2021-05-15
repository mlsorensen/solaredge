package main

import (
	"fmt"
	"github.com/mlsorensen/solaredge/pkg/client"
	"os"
)

const (
	siteIdEnvVar = "SITEID"
	apiKeyEnvVar = "APIKEY"
)

func main() {
	c := client.Client{}

	// client checks if it is configured and returns errors, no need to check
	c.SetSiteId(os.Getenv(siteIdEnvVar))
	c.SetApiKey(os.Getenv(apiKeyEnvVar))

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
