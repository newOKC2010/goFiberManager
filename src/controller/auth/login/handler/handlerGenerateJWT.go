package handlerLogin

import (
	"time"

	"github.com/golang-jwt/jwt/v5"

	loginUtils "manager/src/controller/auth/login/utils"
	loadEnv "manager/src/loadenv"
)

func GenerateJWT(userID int64, email, role string) (string, error) {
	jwtConfig := loadEnv.LoadJWT()
	expiresInSeconds := GetExpiresInSeconds(jwtConfig.ExpireIn, 3600)
	expiresAt := time.Now().Add(time.Second * time.Duration(expiresInSeconds))

	claims := loginUtils.GenerateJWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(jwtConfig.Secret))
}
