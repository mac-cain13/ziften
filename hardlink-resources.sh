#!/bin/bash
# Quick and dirty helper script
#  it hardlinks files that should be the same between the 2 extensions
#  prevents mistakes and saves a lot of time copy-pasting changes
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
for FILE in $DIR/ziften.safariextension/js/* ; do
	ln -f $FILE $DIR/ziften.chromeextension/js/$(basename $FILE)
done