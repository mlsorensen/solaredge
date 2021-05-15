package client

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const baseurl = "https://monitoringapi.solaredge.com"
const timeFormat = "2006-01-02 15:04:05"

type Client struct {
	apiKey string
	siteId string
}

type Query struct {
	url        string
	apiKey     string
	timeSeries bool
}

func (c *Client) GetInventory() (inv Inventory, err error) {
	id := InventoryData{}

	if !c.isConfigured() {
		return inv, errors.New("client is not configured")
	}

	var q = strings.Join([]string{baseurl, "site", c.siteId, "inventory"}, "/")
	query := Query{q, c.apiKey, false}

	resp, err := http.Get(query.build())
	if err != nil {
		return inv, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return inv, err
	}

	err = json.Unmarshal(body, &id)
	if err != nil {
		return inv, err
	}
	inv = id.Inventory

	return inv, err
}

func (c *Client) GetEquipmentTelemetry(serial string) (et EquipmentTelemetry, err error) {
	if !c.isConfigured() {
		return et, errors.New("client is not configured")
	}

	var q = strings.Join([]string{baseurl, "equipment", c.siteId, serial, "data"}, "/")
	query := Query{q, c.apiKey, true}

	resp, err := http.Get(query.build())
	if err != nil {
		return et, err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return et, err
	}

	err = json.Unmarshal(body, &et)
	return et, err
}

func (c *Client) isConfigured() bool {
	if len(c.apiKey) == 0 || len(c.siteId) == 0 {
		return false
	}
	return true
}

func (c *Client) SetApiKey(s string) {
	c.apiKey = s
}

func (c *Client) SetSiteId(s string) {
	c.siteId = s
}

func (q *Query) build() string {
	var u = q.url + "?api_key=" + q.apiKey
	if q.timeSeries {
		u = appendTimeFrame(u)
	}
	return u
}

func appendTimeFrame(query string) string {
	return query + "&startTime=" + getStartTimeStr() + "&endTime=" + getEndTimeStr()
}

func getStartTimeStr() string {
	end := time.Now()
	start := end.Add(-12 * time.Hour)
	return url.QueryEscape(start.Format(timeFormat))
}

func getEndTimeStr() string {
	return url.QueryEscape(time.Now().Format(timeFormat))
}
