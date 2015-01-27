@echo off

SET TMPFOLDER=%TEMP%\%RANDOM%
set CURRENTDIRECTORY=%CD%
CALL git clone https://github.com/OmniSharp/omnisharp-roslyn %TMPFOLDER%
cd %TMPFOLDER%
CALL build
CD %CURRENTDIRECTORY%
RD /S /Q Omnisharp
xcopy /S /E /Y %TMPFOLDER%\artifacts\build %CURRENTDIRECTORY%
RD /S /Q %TMPFOLDER%

