package client

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

const baseurl = "https://monitoringapi.solaredge.com"
const timeFormat = "2006-01-02 15:04:05"

var solarEdgeClient *client

type client struct {
	apiKey             string
	siteId             string
	cacheExpireSeconds time.Duration
	inventory          CachedQuery
	batteryTelemetry   CachedQuery
	inverterTelemetry  CachedQuery
	cache              QueryCache
}

type QueryCache struct {
	sync.RWMutex
	items map[string]CachedQuery
}

type CachedQuery struct {
	result    []byte
	timestamp time.Time
}

func InitClient(apiKey, siteId string, cacheExpireSeconds uint) {
	solarEdgeClient = &client{
		apiKey,
		siteId,
		time.Duration(cacheExpireSeconds) * time.Second,
		CachedQuery{},
		CachedQuery{},
		CachedQuery{},
		QueryCache{items: make(map[string]CachedQuery)},
	}
}

func GetClient() *client {
	if solarEdgeClient == nil {
		panic(errors.New("SolareEdge client was not initialized before it was used"))
	}
	return solarEdgeClient
}

func (c *client) GetInventory() (inv Inventory, err error) {
	var q = strings.Join([]string{baseurl, "site", c.siteId, "inventory"}, "/")
	body, err := c.get(q, false, nil)
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

func (c *client) GetInverterTelemetry(serial string) (et EquipmentTelemetry, err error) {
	var q = strings.Join([]string{baseurl, "equipment", c.siteId, serial, "data"}, "/")
	body, err := c.get(q, true, nil)
	if err != nil {
		return et, err
	}

	err = json.Unmarshal(body, &et)
	return et, err
}

func (c *client) GetBatteryTelemetry() (bt BatteryTelemetry, err error) {
	var q = strings.Join([]string{baseurl, "site", c.siteId, "storageData"}, "/")
	body, err := c.get(q, true, nil)
	if err != nil {
		return bt, err
	}

	err = json.Unmarshal(body, &bt)
	return bt, err
}

func (c *client) isConfigured() bool {
	if len(c.apiKey) == 0 || len(c.siteId) == 0 {
		return false
	}
	return true
}

func (c *client) get(u string, needTime bool, params map[string]string) ([]byte, error) {
	if !c.isConfigured() {
		return []byte{}, errors.New("client is not configured")
	}

	c.cache.Lock()
	defer c.cache.Unlock()

	if cachedItem, ok := c.cache.items[u]; ok {
		if !isExpired(cachedItem.timestamp, c.cacheExpireSeconds) {
			fmt.Printf("Reusing cached result for url %s\n", u)
			return cachedItem.result, nil
		} else {
			fmt.Printf("Cached result for url %s is expired\n", u)
		}
	} else {
		fmt.Printf("Cached result for url %s is not present\n", u)
	}

	// no cache for this url, or expired cache, fetch from server
	uWithParams := c.appendApiKey(u)
	if needTime {
		uWithParams = c.appendTimeFrame(uWithParams)
	}

	for k, v := range params {
		uWithParams = uWithParams + fmt.Sprintf("&%s=%s", k, v)
	}

	resp, err := http.Get(uWithParams)
	if err != nil {
		return []byte{}, err
	}
	defer resp.Body.Close()

	bytes, err := ioutil.ReadAll(resp.Body)
	// update cache
	c.cache.items[u] = CachedQuery{result: bytes, timestamp: time.Now()}

	return bytes, err
}

func (c *client) SetApiKey(s string) {
	c.apiKey = s
}

func (c *client) SetSiteId(s string) {
	c.siteId = s
}

func (c *client) appendApiKey(query string) string {
	return query + "?api_key=" + c.apiKey
}

func (c *client) appendTimeFrame(query string) string {
	return query + "&startTime=" + getStartTimeStr() + "&endTime=" + getEndTimeStr()
}

func getStartTimeStr() string {
	end := time.Now()
	start := end.Add(-24 * time.Hour)
	return url.QueryEscape(start.Format(timeFormat))
}

func getEndTimeStr() string {
	return url.QueryEscape(time.Now().Format(timeFormat))
}

func isExpired(t time.Time, expiry time.Duration) bool {
	return t.Add(expiry).Before(time.Now())
}
