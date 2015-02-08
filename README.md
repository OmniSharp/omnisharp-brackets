omnisharp-brackets
==================

omnisharp-brackets is a plugin for brackets.io to provide a C# development environment. It communicates with OmniSharpServer by nosami for IDE functions.

It works on:

Mac OSX
Linux
Windows (NOTE : needs Python installed AND in your PATH)

Features
========
tbc


How to use the latest version
=============================
Currently some of the funtionality is dependent upon the kind people at adobe accepting my PR's. Until that point to get all the features you will need to work of my brackets branch:

 - clone the latest version of brackets from this branch https://github.com/mat-mcloughlin/brackets/tree/SpecialEdition
 - Follow the first 6 points in the instructions here https://github.com/adobe/brackets/wiki/How-to-Hack-on-Brackets#setting-up-your-dev-environment
 - Within brackets click File -> Extension Manager... -> Install from URL... and enter this url https://github.com/OmniSharp/omnisharp-brackets

**Note:** If you are on a non-Windows platform, and notice permission issues in the Brackets Debug Console that prevent Omnisharp from starting (such as `Error: spawn EACCES` etc),you need to ensure the permissions on the Brackets extension are in proper order. To do that, execute the respective command for your operating system in your terminal.

| Name | Description          |
| ------------- | ----------- |
| OSX | `chmod -R a+x ~/Library/Application Support/Brackets/extensions/user/mat-mcloughlin.omnisharp`|
| Linux | `chmod -R a+x ~/.config/Brackets/extensions/user/mat-mcloughlin.omnisharp`     |

