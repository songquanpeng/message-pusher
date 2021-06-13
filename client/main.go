package main

import (
	"flag"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/url"
)

var (
	server = flag.String("server", "", "message pusher address")
	prefix = flag.String("prefix", "", "your prefix")
	token  = flag.String("token", "", "the access token")
)

type Verification struct {
	Prefix string `json:"prefix"`
	Token  string `json:"token"`
}

func main() {
	flag.Parse()
	u := url.URL{Scheme: "ws", Host: *server, Path: "/"}
	fmt.Printf("Connecting to %s\n", u.String())
	c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("Failed to connect server:", err)
		return
	}
	defer c.Close()
	verification := &Verification{
		Prefix: *prefix,
		Token:  *token,
	}
	_ = c.WriteJSON(verification)

	for {
		var message = new(Message)
		err = c.ReadJSON(message)
		if err != nil {
			log.Println("Error occurred when read message:", err)
		} else {
			log.Println("Get new message")
			Notify(message)
		}
	}

}
