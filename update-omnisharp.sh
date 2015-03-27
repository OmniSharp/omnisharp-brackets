#!/bin/bash
tdir=`mktemp -d`
cwd=$(pwd)

git clone https://github.com/OmniSharp/omnisharp-roslyn %tdir
cd %tdir
./build.sh
cd $cwd
rm -rf Omnisharp
cp -r %tdir/artifacts/build %cwd
rm -rf %tdir
