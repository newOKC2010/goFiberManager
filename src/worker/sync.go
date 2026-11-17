package worker

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"
)

var allowedMinors = map[int]bool{75: true, 38: true}

// runSync - ดึง devices พร้อมกัน แล้ว log สรุป
func runSync(ctx context.Context, db *sql.DB, user, pass string, devices []Device) {
	loc, _ := time.LoadLocation("Asia/Bangkok")
	now := time.Now().In(loc)
	start := time.Date(now.Year(), now.Month(), now.Day()-1, 0, 0, 0, 0, loc).Format("2006-01-02T15:04:05-07:00")
	end := time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 0, loc).Format("2006-01-02T15:04:05-07:00")

	log.Printf("[HIK] เริ่มดึงข้อมูล | ช่วง: %s ถึง %s",
		now.AddDate(0, 0, -1).Format("02/01/2006"), now.Format("02/01/2006"))

	type result struct {
		name     string
		count    int
		newEmps  []string
		skipped  map[int]int
		err      error
	}

	results := make([]result, len(devices))
	var wg sync.WaitGroup

	for i, dev := range devices {
		wg.Add(1)
		go func(idx int, d Device) {
			defer wg.Done()
			events, err := fetchEvents(d, user, pass, start, end)
			if err != nil {
				insertHikErrorLog(db, d.Name, d.Host, err.Error())
				results[idx] = result{name: d.Name, err: err}
				return
			}
			newEmps, skipped, err := processEvents(ctx, db, events)
			results[idx] = result{name: d.Name, count: len(events), newEmps: newEmps, skipped: skipped, err: err}
		}(i, dev)
	}

	wg.Wait()

	// log ผลแต่ละเครื่อง
	totalEvents, totalNew := 0, 0
	allSkipped := map[int]int{}
	var allNewEmps []string

	for _, r := range results {
		if r.err != nil {
			log.Printf("[HIK] %-6s : ERROR — %v", r.name, r.err)
		} else {
			log.Printf("[HIK] %-6s : ✓ %d events", r.name, r.count)
			totalEvents += r.count
			totalNew += len(r.newEmps)
			allNewEmps = append(allNewEmps, r.newEmps...)
			for k, v := range r.skipped {
				allSkipped[k] += v
			}
		}
	}

	// log สรุป
	skippedTotal := 0
	for _, v := range allSkipped {
		skippedTotal += v
	}
	log.Printf("[HIK] สรุป: รวม %d events | ข้าม %d | พนักงานใหม่ %d คน",
		totalEvents, skippedTotal, totalNew)

	// log พนักงานใหม่ (ถ้ามี)
	for _, name := range allNewEmps {
		log.Printf("[HIK] พนักงานใหม่: %s", name)
	}
}

// processEvents - กรอง minor, group ตาม (emp, วัน), บันทึก DB
func processEvents(ctx context.Context, db *sql.DB, events []HikEvent) (newEmps []string, skipped map[int]int, _ error) {
	skipped = map[int]int{}
	loc, _ := time.LoadLocation("Asia/Bangkok")

	type key struct{ hrEmpID, date string }
	groups := map[key]*ScanGroup{}

	for _, e := range events {
		if !allowedMinors[e.Minor] {
			skipped[e.Minor]++
			continue
		}
		t, err := time.Parse(time.RFC3339, e.Time)
		if err != nil {
			continue
		}
		t = t.In(loc)

		hrEmpID := strings.TrimSpace(e.EmployeeNoString)
		if hrEmpID == "" {
			continue
		}

		k := key{hrEmpID, t.Format("2006-01-02")}
		if _, ok := groups[k]; !ok {
			fullName := strings.TrimSpace(e.Name)
			if fullName == "" {
				fullName = hrEmpID
			}
			groups[k] = &ScanGroup{
				HrEmpID:  hrEmpID,
				FullName: fullName,
				WorkDate: time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC),
			}
		}

		scanTime := t.Format("15:04")
		g := groups[k]
		found := false
		for _, v := range g.ScanTimes {
			if v == scanTime {
				found = true
				break
			}
		}
		if !found {
			g.ScanTimes = append(g.ScanTimes, scanTime)
		}
	}

	for _, g := range groups {
		isNew, err := ensureEmp(db, g.HrEmpID, g.FullName)
		if err != nil {
			log.Printf("[HIK] ensureEmp [%s]: %v", g.HrEmpID, err)
			continue
		}
		if isNew {
			newEmps = append(newEmps, fmt.Sprintf("%s (%s)", g.FullName, g.HrEmpID))
		}

		var empID int64
		if err = db.QueryRowContext(ctx, `SELECT id FROM emp_users WHERE hr_emp_id = $1`, g.HrEmpID).Scan(&empID); err != nil {
			log.Printf("[HIK] getEmpID [%s]: %v", g.HrEmpID, err)
			continue
		}

		scanJSON, _ := json.Marshal(g.ScanTimes)
		if err = upsertAttendance(db, empID, g.WorkDate, string(scanJSON)); err != nil {
			log.Printf("[HIK] upsertAttendance [%s %s]: %v", g.HrEmpID, g.WorkDate.Format("2006-01-02"), err)
		}
	}

	return newEmps, skipped, nil
}
