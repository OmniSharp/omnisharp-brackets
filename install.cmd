@echo off
CALL npm install
SET TMPFOLDER=%TEMP%\%RANDOM%
CALL git clone https://github.com/OmniSharp/omnisharp-server-roslyn-binaries.git %TMPFOLDER%
RD /S /Q node\server
xcopy /S /E /Y /I %TMPFOLDER%\lib\server %CD%\node\server
RD /S /Q %TMPFOLDER%