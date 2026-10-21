package middleware

import (
	"database/sql"
	"fmt"
	"log"
	"time"
)

func VerifyToken(db *sql.DB, userID int64, token string) error {
	var exists bool
	err := db.QueryRow(
		`SELECT EXISTS(SELECT 1 FROM tokens_e 
		 WHERE user_id = $1 AND token = $2 AND expires_at > $3)`,
		userID, token, time.Now(),
	).Scan(&exists)

	if err != nil {
		log.Printf("VerifyToken DB error userID=%d: %v", userID, err)
		return err
	}
	if !exists {
		log.Printf("VerifyToken: token ไม่พบใน DB หรือหมดอายุ userID=%d", userID)
		return fmt.Errorf("token ไม่ถูกต้องหรือหมดอายุ")
	}
	return nil
}

func GetUserByID(db *sql.DB, userID int64) (*UserQANCInfo, error) {
	user := &UserQANCInfo{}

	err := db.QueryRow(
		`SELECT id, cid, email, role, status FROM users_e WHERE id = $1`,
		userID,
	).Scan(&user.ID, &user.CID, &user.Email, &user.Role, &user.Status)

	if err != nil {
		return nil, err
	}

	return user, nil
}
