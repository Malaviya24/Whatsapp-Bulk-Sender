' BulkSender Silent Launcher
' Starts the Node.js server in background and opens browser

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get app directory
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = appDir

' Check if server is already running by checking the port
Set http = CreateObject("MSXML2.XMLHTTP")
On Error Resume Next
http.Open "GET", "http://localhost:5000/", False
http.Send

If Err.Number = 0 And http.Status = 200 Then
    ' Server already running - just open browser
    WshShell.Run "http://localhost:5000/", 1, False
    WScript.Quit
End If
On Error Goto 0

' Start the server hidden (0 = hidden window)
WshShell.Run "cmd /c node server.js > logs.txt 2>&1", 0, False

' Wait for server to be ready (poll every 500ms, up to 30 sec)
attempts = 0
Do While attempts < 60
    WScript.Sleep 500
    On Error Resume Next
    Set http = CreateObject("MSXML2.XMLHTTP")
    http.Open "GET", "http://localhost:5000/", False
    http.Send
    If Err.Number = 0 And http.Status = 200 Then
        Exit Do
    End If
    On Error Goto 0
    attempts = attempts + 1
Loop

' Open browser
WshShell.Run "http://localhost:5000/", 1, False
