npm install
rm -rfv tmp
git clone https://github.com/OmniSharp/omnisharp-server-roslyn-binaries.git tmp
rm -rf node/server
mkdir node/server
cp -a tmp/lib/server/* node/server
rm -rf tmp
