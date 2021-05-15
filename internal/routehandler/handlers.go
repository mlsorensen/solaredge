package routehandler

import (
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

func Inventory(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintf(w, "inventory")
}

func EquipmentTelemetry(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	fmt.Fprintf(w, "equipment %v", vars)
}
