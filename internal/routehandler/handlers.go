package routehandler

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/mlsorensen/solaredge/pkg/client"
	"net/http"
)

func Inventory(w http.ResponseWriter, req *http.Request) {
	inv, err := client.GetClient().GetInventory()
	if err != nil {
		fmt.Printf("failed to get inventory, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	resp, err := json.Marshal(inv)
	if err != nil {
		fmt.Printf("Failed to unmarshal inventory, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write(resp)
}

func Inverters(w http.ResponseWriter, req *http.Request) {
	inv, err := client.GetClient().GetInventory()
	if err != nil {
		fmt.Printf("failed to get inverters, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	resp, err := json.Marshal(inv.Inverters)
	if err != nil {
		fmt.Printf("Failed to unmarshal inverters, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write(resp)
}

func Batteries(w http.ResponseWriter, req *http.Request) {
	inv, err := client.GetClient().GetInventory()
	if err != nil {
		fmt.Printf("failed to get batteries, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	resp, err := json.Marshal(inv.Batteries)
	if err != nil {
		fmt.Printf("Failed to unmarshal batteries, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write(resp)
}

func Meters(w http.ResponseWriter, req *http.Request) {
	inv, err := client.GetClient().GetInventory()
	if err != nil {
		fmt.Printf("failed to get meters, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	resp, err := json.Marshal(inv.Meters)
	if err != nil {
		fmt.Printf("Failed to unmarshal meters, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Write(resp)
}

func InverterTelemetry(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	data, err := client.GetClient().GetInverterTelemetry(vars["serial"])

	if err != nil {
		fmt.Printf("failed to get inventory telemetry, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	resp, err := json.Marshal(data.Data)
	if err != nil {
		fmt.Printf("failed to unmarshal inventory telemetry, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	w.Write(resp)
}

func BatteryTelemetry(w http.ResponseWriter, req *http.Request) {
	serial := mux.Vars(req)["serial"]
	data, err := client.GetClient().GetBatteryTelemetry()

	if err != nil {
		fmt.Printf("failed to get battery telemetry, %v\n", err)
		w.WriteHeader(http.StatusInternalServerError)
	}

	for _, v := range data.StorageData.Batteries {
		if v.SerialNumber == serial {
			resp, err := json.Marshal(v)
			if err != nil {
				fmt.Printf("failed to unmarshal battery telemetry, %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
			}
			w.Write(resp)
			return
		}
	}

	fmt.Printf("Failed to find battery by serial %s", serial)
	w.WriteHeader(http.StatusNotFound)
}
