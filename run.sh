#!/bin/bash
[ -z "$2" ] && exit 1
docker run --rm -i -v $(pwd):/tmp aiartist python evaluate.py --checkpoint "$2" --in-path "/tmp/$1" --out-path /tmp/output.jpg

#docker build --rm -f Dockerfile -t aiartist .
