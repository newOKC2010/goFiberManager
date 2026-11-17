package loadEnv

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
}

func LoadEmail() EmailConfig {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}
	return EmailConfig{
		Email:    os.Getenv("EMAIL"),
		Password: os.Getenv("EMAIL_PASSWORD"),
	}
}

func LoadMOPHAlert() MOPHAlertConfig {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}
	return MOPHAlertConfig{
		URL:       os.Getenv("MOPH_ALERT_URL"),
		Method:    os.Getenv("MOPH_ALERT_METHOD"),
		ClientID:  os.Getenv("MOPH_ALERT_CLIENT_ID"),
		SecretKey: os.Getenv("MOPH_ALERT_SECRET_KEY"),
	}
}

func LoadDBconnec() string {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}
	return os.Getenv("DB_URL")
}

func LoadPort() string {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}
	return os.Getenv("PORT")
}

func LoadCreateModel() string {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}
	return os.Getenv("CREATE_MODEL")
}

func LoadCORS() CORS {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}
	credentials, _ := strconv.ParseBool(os.Getenv("CORS_CREDENTIALS"))
	return CORS{
		Origins:     strings.Split(os.Getenv("CORS_ORIGINS"), ","),
		Credentials: credentials,
		Methods:     strings.Split(os.Getenv("CORS_METHODS"), ","),
		Headers:     strings.Split(os.Getenv("CORS_HEADERS"), ","),
	}
}

func LoadJWT() JWT {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}
	return JWT{
		Secret:   os.Getenv("JWT_SECRET"),
		ExpireIn: os.Getenv("JWT_EXPIRES_IN"),
	}
}

func LoadOTPExpiresIn() string {
	if err := godotenv.Load(); err != nil {
		panic(err)
	}
	return os.Getenv("OTP_EXPIRES_IN")
}

func LoadAlertTargets() AlertTargets {
	return AlertTargets{
		CID:   os.Getenv("CID_ALERT"),
		Email: os.Getenv("EMAIL_ALERT"),
	}
}

var timeCheckDepts map[int64]bool

func loadDepCheck() {
	timeCheckDepts = map[int64]bool{}
	for _, s := range strings.Split(os.Getenv("DEP_CHECK"), ",") {
		s = strings.TrimSpace(s)
		if id, err := strconv.ParseInt(s, 10, 64); err == nil {
			timeCheckDepts[id] = true
		}
	}
}

func LoadHikvision() HikvisionConfig {
	v := strings.TrimSpace(os.Getenv("HIK_WORKER_ENABLED"))
	enabled := v == "" || strings.ToLower(v) == "true" || v == "1"
	return HikvisionConfig{
		User:     os.Getenv("ISAPI_USER"),
		Password: os.Getenv("ISAPI_PASSWORD"),
		Enabled:  enabled,
		Interval: parseInterval(os.Getenv("HIK_INTERVAL"), 10*time.Minute),
		Devices:  parseDevices(os.Getenv("ISAPI_DEVICES")),
	}
}

// parseInterval รองรับ: 10m, 1h, 30s, 1d (default ถ้า parse ไม่ได้)
func parseInterval(s string, def time.Duration) time.Duration {
	s = strings.TrimSpace(s)
	if s == "" {
		return def
	}
	if strings.HasSuffix(s, "d") {
		if n, err := strconv.Atoi(strings.TrimSuffix(s, "d")); err == nil {
			return time.Duration(n) * 24 * time.Hour
		}
	}
	if d, err := time.ParseDuration(s); err == nil {
		return d
	}
	return def
}

// parseDevices parse "ER:192.168.1.6,LR:192.168.1.7,..."
func parseDevices(s string) []HikDevice {
	var out []HikDevice
	for _, raw := range strings.Split(s, ",") {
		raw = strings.TrimSpace(raw)
		if raw == "" {
			continue
		}
		parts := strings.SplitN(raw, ":", 2)
		if len(parts) == 2 {
			out = append(out, HikDevice{
				Name: strings.TrimSpace(parts[0]),
				Host: strings.TrimSpace(parts[1]),
			})
		}
	}
	return out
}

func IsTimeCheckDept(deptID int64) bool {
	if timeCheckDepts == nil {
		loadDepCheck()
	}
	return timeCheckDepts[deptID]
}
