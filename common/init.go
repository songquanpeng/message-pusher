package common

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

var (
	PrintVersion = flag.Bool("version", false, "Print the version of the program and exits.")
	PrintHelp    = flag.Bool("help", false, "Print the help message and exits.")
	Port         = flag.Int("port", 3000, "Specify the listening port. Default is 3000.")
	LogDir       = flag.String("log-dir", "", "Specify the directory for log files.")
)

func printHelp() {
	fmt.Println(fmt.Sprintf("Message Pusher %s - Your all in one message push system.", Version))
	fmt.Println("Copyright (C) 2023 JustSong. All rights reserved.")
	fmt.Println("GitHub: https://github.com/songquanpeng/message-pusher")
	fmt.Println("Usage: message-pusher [options]")
	fmt.Println("Options:")
	flag.CommandLine.VisitAll(func(f *flag.Flag) {
		name := fmt.Sprintf("-%s", f.Name)
		usage := strings.Replace(f.Usage, "\n", "\n    ", -1)
		fmt.Printf("        -%-14s%s\n", name, usage)
	})
	os.Exit(0)
}

func init() {
	flag.Parse()

	if *PrintVersion {
		fmt.Println(Version)
		os.Exit(0)
	}

	if *PrintHelp {
		printHelp()
	}

	if os.Getenv("SESSION_SECRET") != "" {
		SessionSecret = os.Getenv("SESSION_SECRET")
	}
	if os.Getenv("SQLITE_PATH") != "" {
		SQLitePath = os.Getenv("SQLITE_PATH")
	}
	if *LogDir != "" {
		var err error
		*LogDir, err = filepath.Abs(*LogDir)
		if err != nil {
			log.Fatal(err)
		}
		if _, err := os.Stat(*LogDir); os.IsNotExist(err) {
			err = os.Mkdir(*LogDir, 0777)
			if err != nil {
				log.Fatal(err)
			}
		}
	}
}
