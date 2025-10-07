package models

type Book struct {
	ID                   int     `json:"id"`
	Author               string  `json:"author" validate:"required,min=3"`
	Name                 string  `json:"name" validate:"required,min=3"`
	Price                float64 `json:"price" validate:"min=0"`
	Genre                string  `json:"genre"`
	Description          string  `json:"description"`
	Descriptionlong      string  `json:"descriptionLong"`
	Quantity             int     `json:"quantity" validate:"min=0"`
	BorrowPrice          float64 `json:"borrowPrice" validate:"min=0"`
	DueAt                string  `json:"dueAt,omitempty"`
	ReservationExpiresAt string  `json:"reservationExpiresAt,omitempty"`
}
