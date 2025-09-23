package models

import "time"

type User struct {
	ID       int       `json:"id"`
	Name     string    `json:"name" validate:"required,min=3"`
	Lastname string    `json:"lastname" validate:"required,min=3"`
	Username string    `json:"username" validate:"required,min=5,max=20"`
	Created  time.Time `json:"created"`
	Email    string    `json:"email" validate:"required,email"`
	Password string    `json:"password" validate:"required,min=6"`
	Balance  float64   `json:"balance"`
	Role     string    `json:"role"`
}
