package worker

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"
	_ "time/tzdata"

	loadEnv "manager/src/loadenv"
)

// RunWorker - start worker goroutine, หยุดเมื่อ ctx ถูก cancel
func RunWorker(ctx context.Context, db *sql.DB) {
	cfg := loadEnv.LoadHikvision()
	if !cfg.Enabled {
		log.Println("[HIK] ปิดการทำงาน (HIK_WORKER_ENABLED=false)")
		return
	}
	if len(cfg.Devices) == 0 {
		log.Println("[HIK] ไม่พบเครื่อง (ISAPI_DEVICES is empty)")
		return
	}

	devices := make([]Device, len(cfg.Devices))
	names := make([]string, len(cfg.Devices))
	for i, d := range cfg.Devices {
		devices[i] = Device{Name: d.Name, Host: d.Host}
		names[i] = fmt.Sprintf("%s(%s)", d.Name, d.Host)
	}

	log.Printf("[HIK] เปิดระบบดึง API | เครื่อง: %s | ดึงทุก %s",
		strings.Join(names, ", "), cfg.Interval)

	ticker := time.NewTicker(cfg.Interval)
	defer ticker.Stop()

	var mu sync.Mutex
	running := false

	doSync := func() {
		mu.Lock()
		if running {
			mu.Unlock()
			log.Println("[HIK] รอบก่อนยังไม่จบ ข้ามรอบนี้")
			return
		}
		running = true
		mu.Unlock()
		defer func() {
			mu.Lock()
			running = false
			mu.Unlock()
		}()
		runSync(ctx, db, cfg.User, cfg.Password, devices)
	}

	go doSync() // รอบแรกทันที

	for {
		select {
		case <-ctx.Done():
			log.Println("[HIK] หยุดทำงาน")
			return
		case <-ticker.C:
			go doSync()
		}
	}
}
