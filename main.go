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
	c := client.Client{}

	// client checks if it is configured and returns errors, no need to check if these are empty
	c.SetSiteId(os.Getenv(siteIdEnvVar))
	c.SetApiKey(os.Getenv(apiKeyEnvVar))

	r := mux.NewRouter()

	fs := http.FileServer(http.Dir("./static"))
	r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", fs))

	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/inventory", routehandler.Inventory).Methods("GET")
	api.HandleFunc("/equipmentTelemetry/{serial}", routehandler.EquipmentTelemetry).Methods("GET")

	http.Handle("/", r)

	log.Fatal(http.ListenAndServe(":8080", nil))
}
