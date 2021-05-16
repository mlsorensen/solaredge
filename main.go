package main

import (
	"github.com/mlsorensen/solaredge/internal/routehandler"
	"github.com/mlsorensen/solaredge/pkg/client"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

const (
	siteIdEnvVar = "SITEID"
	apiKeyEnvVar = "APIKEY"
)

func main() {
	// client checks if it is configured and returns errors, no need to check if these are empty
	client.InitClient(os.Getenv(apiKeyEnvVar), os.Getenv(siteIdEnvVar), 600)

	r := mux.NewRouter()

	fs := http.FileServer(http.Dir("./static"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/inventory", routehandler.Inventory).Methods("GET")
	api.HandleFunc("/inventory/inverters", routehandler.Inverters).Methods("GET")
	api.HandleFunc("/inventory/batteries", routehandler.Batteries).Methods("GET")
	api.HandleFunc("/inventory/meters", routehandler.Meters).Methods("GET")
	api.HandleFunc("/telemetry/inverters/{serial}", routehandler.InverterTelemetry).Methods("GET")
	api.HandleFunc("/telemetry/batteries/{serial}", routehandler.BatteryTelemetry).Methods("GET")

	http.Handle("/", r)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
