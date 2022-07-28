Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "C:\Users\song\Projects\message-pusher\client\message-receiver.exe ""--url https://server_host/prefix" & Chr(34), 0
Set WshShell = Nothing