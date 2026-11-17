package loadEnv

import "time"

type EmailConfig struct {
	Email    string
	Password string
}

type MOPHAlertConfig struct {
	URL       string
	Method    string
	ClientID  string
	SecretKey string
}

type CORS struct {
	Origins     []string
	Credentials bool
	Methods     []string
	Headers     []string
}

type JWT struct {
	Secret   string
	ExpireIn string
}

type AlertTargets struct {
	CID   string
	Email string
}

type HikDevice struct {
	Name string
	Host string
}

type HikvisionConfig struct {
	User     string
	Password string
	Enabled  bool
	Interval time.Duration
	Devices  []HikDevice
}
