package serviceLogin

import (
	"database/sql"
	"time"

	loginHandler "manager/src/controller/auth/login/handler"
	loadEnv "manager/src/loadenv"
)

// UpdateOTPInDB - อัพเดท OTP ลงฐานข้อมูล
func UpdateOTPInDB(db *sql.DB, cid, otpCode string) error {
	expiresIn := loadEnv.LoadOTPExpiresIn()
	seconds := loginHandler.GetExpiresInSeconds(expiresIn, 300) // default 5 min
	expiresAt := time.Now().Add(time.Duration(seconds) * time.Second)

	_, err := db.Exec(
		`UPDATE users_e SET otp_code = $1, otp_expires_at = $2, updated_at = $3
		 WHERE cid = $4 AND status = true`,
		otpCode, expiresAt, time.Now(), cid,
	)
	return err
}
