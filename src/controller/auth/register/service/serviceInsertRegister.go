package serviceRegister

import (
	"database/sql"
	"fmt"

	loginUtils "manager/src/controller/auth/login/utils"
	registerUtils "manager/src/controller/auth/register/utils"
)

func CreateUser(db *sql.DB, cid, fullName, email string) (*loginUtils.UserAuth, error) {
	hashCID := registerUtils.HashCID(cid)

	user := &loginUtils.UserAuth{}
	err := db.QueryRow(
		`INSERT INTO users_e (cid, hash_cid, full_name, email, role, status)
		 VALUES ($1, $2, $3, $4, 'user', true)
		 RETURNING id, cid, full_name, email, role, status`,
		cid, hashCID, fullName, email,
	).Scan(&user.ID, &user.CID, &user.FullName, &user.Email, &user.Role, &user.Status)

	if err != nil {
		return nil, fmt.Errorf("บันทึกข้อมูลไม่สำเร็จ: %w", err)
	}

	return user, nil
}
