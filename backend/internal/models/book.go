package models

type Book struct {
	ID                   int     `json:"id"`
	Author               string  `json:"author" validate:"required,min=3"`
	Name                 string  `json:"name" validate:"required,min=3"`
	Price                float64 `json:"price" validate:"min=0"`
	Genre                string  `json:"genre"`
	Description          string  `json:"description"`
	Descriptionlong      string  `json:"descriptionLong"`
	Quantity             int     `json:"quantity"` // Lagerbestand
	BorrowPrice          float64 `json:"borrowprice"`
	DueAt                string  `json:"dueAt,omitempty"`
	ReservationExpiresAt string  `json:"reservationExpiresAt,omitempty"`
	OrderedQuantity      int     `json:"orderedQuantity,omitempty"` // NEU: Kaufanzahl für Order-Views
}
