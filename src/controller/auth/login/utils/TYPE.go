package loginUtils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Response struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type VerifyResponse struct {
	Success  bool      `json:"success"`
	Message  string    `json:"message"`
	Token    string    `json:"token,omitempty"`
	UserInfo *UserInfo `json:"user_info,omitempty"`
}

type GenerateJWTClaims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type UserInfo struct {
	ID    int64  `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role,omitempty"`
}

type UserAuth struct {
	ID           int64
	CID          string
	HashCID      string
	Role         string
	Status       bool
	FullName     string
	Email        string
	OtpCode      *string
	OtpExpiresAt *time.Time
}
