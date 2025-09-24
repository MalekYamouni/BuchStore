package models

import "time"

type Book struct {
	ID              int       `json:"id"`
	Author          string    `json:"author" validate:"required,min=3"`
	Name            string    `json:"name" validate:"required,min=3"`
	Price           float64   `json:"price"`
	Genre           string    `json:"genre" validate:"required,min=3"`
	Description     string    `json:"description" validate:"required,min=20"`
	Descriptionlong string    `json:"descriptionLong" validate:"required,min=50"`
	Quantity        int       `json:"quantity"`
	IsBorrowed      bool      `json:"isBorrowed"`
	BorrowPrice     float64   `json:"borrowPrice"`
	DueAt           time.Time `json:"dueAt"`
}
