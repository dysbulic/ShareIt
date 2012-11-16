#!/usr/bin/env sh

# Simple script to deploy ShareIt! automatically to the different static web
# hostings and have all of them updated.
#
# It will be of none interest for you since it's only purposed for interal use


echo
echo "* Push code to GitHub master branch *"
git checkout master
git pull
git push origin master

echo
echo "* Deploy in GitHub *"
git checkout gh-pages
git rebase
git push origin gh-pages
git checkout master

echo
echo "* Deploy to 5Apps *"
git push 5apps master

# Deploy to DropBox