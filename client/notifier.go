package main

import (
	"fmt"
	"github.com/gen2brain/beeep"
)

type Message struct {
	Title string
	Description string
}

func Notify(message *Message)  {
	err := beeep.Notify(message.Title, message.Description, "assets/information.png")
	if err != nil {
		fmt.Println(err)
	}
}