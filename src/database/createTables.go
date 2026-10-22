package database

import (
	"database/sql"
	"log"
)

func CreateTables(db *sql.DB) error {
	schema := `
	-- Table: users_e
	CREATE TABLE IF NOT EXISTS users_e (
		id BIGSERIAL PRIMARY KEY,
		cid VARCHAR(13) NOT NULL UNIQUE,
		hash_cid VARCHAR(255) NOT NULL,
		role VARCHAR(20) NOT NULL DEFAULT 'user',
		status BOOLEAN NOT NULL DEFAULT true,
		full_name VARCHAR(255) NOT NULL,
		email VARCHAR(255),
		otp_code VARCHAR(10),
		otp_expires_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	-- Table: tokens_e
	CREATE TABLE IF NOT EXISTS tokens_e (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL UNIQUE,
		token TEXT NOT NULL,
		expires_at TIMESTAMPTZ NOT NULL,
		login_last TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users_e(id) ON DELETE CASCADE
	);

	-- Table: departments
	CREATE TABLE IF NOT EXISTS departments (
		id BIGSERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL UNIQUE,
		created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	-- Table: emp_users
	CREATE TABLE IF NOT EXISTS emp_users (
		id BIGSERIAL PRIMARY KEY,
		hr_emp_id VARCHAR(50) NOT NULL UNIQUE,
		full_name VARCHAR(255) NOT NULL,
		department_id BIGINT REFERENCES departments(id),
		cid VARCHAR(13),
		status BOOLEAN NOT NULL DEFAULT true,
		created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);

	-- Table: attendance_logs
	CREATE TABLE IF NOT EXISTS attendance_logs (
		id BIGSERIAL PRIMARY KEY,
		emp_id BIGINT NOT NULL REFERENCES emp_users(id) ON DELETE CASCADE,
		work_date DATE NOT NULL,
		scan_times JSONB NOT NULL DEFAULT '[]',
		created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(emp_id, work_date)
	);

	-- Table: upload_logs
	CREATE TABLE IF NOT EXISTS upload_logs (
		id BIGSERIAL PRIMARY KEY,
		uploaded_by BIGINT REFERENCES users_e(id),
		file_name VARCHAR(255) NOT NULL,
		total_rows INT NOT NULL DEFAULT 0,
		processed INT NOT NULL DEFAULT 0,
		errors INT NOT NULL DEFAULT 0,
		status VARCHAR(20) NOT NULL DEFAULT 'success',
		created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err := db.Exec(schema)
	if err != nil {
		log.Printf("Error creating tables: %v", err)
		return err
	}

	return nil
}
