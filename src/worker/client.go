package worker

import (
	"bytes"
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
)

const isapiPath = "/ISAPI/AccessControl/AcsEvent?format=json"

// fetchEvents - ดึง events จากเครื่องพร้อม pagination จนครบ
func fetchEvents(dev Device, user, pass, startTime, endTime string) ([]HikEvent, error) {
	client := &http.Client{Timeout: 30 * time.Second}
	url := "http://" + dev.Host + isapiPath
	searchID := fmt.Sprintf("hik-%s-%d", dev.Name, time.Now().Unix())

	var all []HikEvent
	position := 0

	for {
		body, _ := json.Marshal(map[string]any{
			"AcsEventCond": map[string]any{
				"searchID":             searchID,
				"searchResultPosition": position,
				"maxResults":           30,
				"startTime":            startTime,
				"endTime":              endTime,
				"major":                5,
				"minor":                0,
			},
		})

		resp, err := doDigestPost(client, url, user, pass, body)
		if err != nil {
			return nil, err
		}

		var result HikResponse
		data, _ := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err := json.Unmarshal(data, &result); err != nil {
			return nil, fmt.Errorf("parse response: %w", err)
		}

		all = append(all, result.AcsEvent.InfoList...)

		if result.AcsEvent.ResponseStatusStrg != "MORE" {
			break
		}
		position += result.AcsEvent.NumOfMatches
	}

	return all, nil
}

// doDigestPost - POST with Digest Auth (2 round trips: challenge → authenticated)
func doDigestPost(client *http.Client, url, user, pass string, body []byte) (*http.Response, error) {
	// round 1: get challenge
	req, _ := http.NewRequest("POST", url, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusUnauthorized {
		return resp, nil
	}

	// parse challenge
	wwwAuth := resp.Header.Get("WWW-Authenticate")
	realm := digestParam(wwwAuth, "realm")
	nonce := digestParam(wwwAuth, "nonce")
	qop := digestParam(wwwAuth, "qop")

	// compute digest response
	cnonce := fmt.Sprintf("%x", time.Now().UnixNano())
	nc := "00000001"
	ha1 := md5hex(user + ":" + realm + ":" + pass)
	ha2 := md5hex("POST:" + isapiPath)

	var dr string
	if strings.Contains(qop, "auth") {
		dr = md5hex(ha1 + ":" + nonce + ":" + nc + ":" + cnonce + ":auth:" + ha2)
	} else {
		dr = md5hex(ha1 + ":" + nonce + ":" + ha2)
	}

	auth := fmt.Sprintf(
		`Digest username="%s", realm="%s", nonce="%s", uri="%s", qop=auth, nc=%s, cnonce="%s", response="%s"`,
		user, realm, nonce, isapiPath, nc, cnonce, dr,
	)

	// round 2: authenticated request
	req2, _ := http.NewRequest("POST", url, bytes.NewReader(body))
	req2.Header.Set("Content-Type", "application/json")
	req2.Header.Set("Authorization", auth)
	return client.Do(req2)
}

func md5hex(s string) string {
	return fmt.Sprintf("%x", md5.Sum([]byte(s)))
}

var reDigestParam = regexp.MustCompile(`(\w+)="([^"]*)"`)

func digestParam(header, key string) string {
	for _, m := range reDigestParam.FindAllStringSubmatch(header, -1) {
		if m[1] == key {
			return m[2]
		}
	}
	return ""
}
