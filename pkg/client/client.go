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

func (c *Client) GetInventory() (inv Inventory, err error) {
	var q = strings.Join([]string{baseurl, "site", c.siteId, "inventory"}, "/")
	body, err := c.get(q, false)
	if err != nil {
		return inv, err
	}

	id := InventoryData{}
	err = json.Unmarshal(body, &id)
	if err != nil {
		return inv, err
	}
	inv = id.Inventory

	return inv, err
}

func (c *Client) GetEquipmentTelemetry(serial string) (et EquipmentTelemetry, err error) {
	var q = strings.Join([]string{baseurl, "equipment", c.siteId, serial, "data"}, "/")

	body, err := c.get(q, true)
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

func (c *Client) get(u string, needTime bool) ([]byte, error) {
	if !c.isConfigured() {
		return []byte{}, errors.New("client is not configured")
	}

	u = c.appendApiKey(u)
	if needTime {
		u = c.appendTimeFrame(u)
	}

	resp, err := http.Get(u)
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close()

	bytes, err := ioutil.ReadAll(resp.Body)
	return bytes, err
}

func (c *Client) SetApiKey(s string) {
	c.apiKey = s
}

func (c *Client) SetSiteId(s string) {
	c.siteId = s
}

func (c *Client) appendApiKey(query string) string {
	return query + "?api_key=" + c.apiKey
}

func (c *Client) appendTimeFrame(query string) string {
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
