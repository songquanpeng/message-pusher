package main

import (
	"flag"
	"github.com/gorilla/websocket"
	"log"
	"net/url"
	"os"
	"time"
)

var (
	conn  = flag.String("url", "", "connection url")
	token = flag.String("token", "", "the access token")
)

type Verification struct {
	Prefix string `json:"prefix"`
	Token  string `json:"token"`
}

type Ping struct {
}

func main() {
	flag.Parse()
	connString := *conn
	if connString == "" {
		connString = os.Getenv("MESSAGE_PUSHER_URL")
	}
	if *token == "" {
		*token = os.Getenv("MESSAGE_PUSHER_TOKEN")
	}
	connUrl, err := url.Parse(connString)
	if err != nil {
		log.Fatal("Failed to parse connection url", err)
		return
	}
	scheme := "ws"
	if connUrl.Scheme == "https" {
		scheme = "wss"
	}
	u := url.URL{Scheme: scheme, Host: connUrl.Host, Path: "/"}
	verification := &Verification{
		Prefix: connUrl.Path[1:],
		Token:  *token,
	}
	ping := &Ping{}
	ticker := time.NewTicker(60 * time.Second)
	for {
		log.Printf("Connecting to %s...\n", u.String())
		c, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
		if err != nil {
			log.Fatal("Failed to connect to server:", err)
			return
		}
		log.Printf("Server connected.\n")

		err = c.WriteJSON(verification)
		if err != nil {
			log.Fatal(err.Error())
		}
		go func() {
			for {
				select {
				case <-ticker.C:
					if err := c.WriteJSON(ping); err != nil {
						log.Println("Error occurred when send ping message:", err)
						log.Println("Connection lost, retrying...")
						_ = c.Close()
						break
					} else {
						log.Println("Ping message sent.")
					}
				}
			}
		}()
		for {
			var message = new(Message)
			err = c.ReadJSON(message)
			if err != nil {
				log.Println("Error occurred when read message:", err)
				log.Println("Connection lost, retrying...")
				_ = c.Close()
				break
			} else {
				log.Println("New message arrived.")
				Notify(message)
			}
		}
	}
}
