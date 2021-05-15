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

	fmt.Printf("Got data with %d items", data.Data.Count)
}