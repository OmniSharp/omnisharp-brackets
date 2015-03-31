rm -rf node_modules
rm -rf node/server
rm ../omnisharp-brackets.zip
zip -r ../omnisharp-brackets.zip ../omnisharp-brackets -x *.DS_Store *.git* *README.md*
