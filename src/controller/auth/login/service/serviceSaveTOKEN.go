package serviceLogin

import (
	"database/sql"
	"time"

	loginHandler "manager/src/controller/auth/login/handler"
	loadEnv "manager/src/loadenv"
)

func SaveTokenToDB(db *sql.DB, userID int64, token string) error {
	jwtConfig := loadEnv.LoadJWT()
	expiresInSeconds := loginHandler.GetExpiresInSeconds(jwtConfig.ExpireIn, 3600)
	expiresAt := time.Now().Add(time.Second * time.Duration(expiresInSeconds))

	_, err := db.Exec(
		`INSERT INTO tokens_e (user_id, token, expires_at, login_last)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (user_id) DO UPDATE
		 SET token = EXCLUDED.token,
		     expires_at = EXCLUDED.expires_at,
		     login_last = EXCLUDED.login_last`,
		userID, token, expiresAt, time.Now(),
	)
	return err
}
