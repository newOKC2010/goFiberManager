package middleware

import "github.com/golang-jwt/jwt/v5"

type UserQANCInfo struct {
	ID       int64  `json:"id"`
	CID      string `json:"cid"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	Status   bool   `json:"-"`
}

type Response struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	User    *UserQANCInfo `json:"user"`
}

type JWTdecode struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}
