package serviceLogin

import (
	"database/sql"
	"time"

	loginUtils "manager/src/controller/auth/login/utils"
)

func VerifyOTP(db *sql.DB, email, otp string) (*loginUtils.UserAuth, bool) {
	user := &loginUtils.UserAuth{}
	err := db.QueryRow(
		`SELECT id, cid, full_name, email, role, status, otp_code, otp_expires_at
		 FROM users_e WHERE LOWER(email) = LOWER($1)`,
		email,
	).Scan(&user.ID, &user.CID, &user.FullName, &user.Email, &user.Role, &user.Status,
		&user.OtpCode, &user.OtpExpiresAt)

	if err != nil {
		return nil, false
	}

	if user.OtpCode == nil || user.OtpExpiresAt == nil {
		return nil, false
	}

	if time.Now().After(*user.OtpExpiresAt) {
		return nil, false
	}

	if *user.OtpCode != otp {
		return nil, false
	}

	return user, true
}
