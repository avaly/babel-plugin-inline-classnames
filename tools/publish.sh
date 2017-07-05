#!/usr/bin/env bash
#
# Publish the package to NPM
#

set -u

if [[ "$TRAVIS_JOB_NUMBER" != *.1 ]]; then
	echo "Publishing only for first Travis job!"
	exit 0
fi

TAG=$(git tag -l --contains HEAD)

if [[ -z $TAG ]]; then
	echo "No tag found. Skipping publish."
else
	echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > ~/.npmrc
	npm publish
	rm ~/.npmrc
fi
