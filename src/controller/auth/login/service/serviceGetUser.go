package serviceLogin

import (
	"database/sql"

	loginUtils "manager/src/controller/auth/login/utils"
)

func GetUserByEmail(db *sql.DB, email string) (*loginUtils.UserAuth, error) {
	user := &loginUtils.UserAuth{}
	err := db.QueryRow(
		`SELECT id, cid, full_name, email, role, status FROM users_e
		 WHERE LOWER(email) = LOWER($1)`,
		email,
	).Scan(&user.ID, &user.CID, &user.FullName, &user.Email, &user.Role, &user.Status)

	if err != nil {
		return nil, err
	}
	return user, nil
}
