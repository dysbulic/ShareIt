#!/usr/bin/env sh

# Simple script to deploy ShareIt! automatically to the different static web
# hostings and have all of them updated.
#
# It will be of none interest for you since it's only purposed for interal use


# Push code to repository master branch
git checkout origin master
git pull
git push     origin master

# Deploy in GitHub
git checkout origin gh-pages
git rebase
git push     origin gh-pages
git checkout origin master

# Deploy to 5Apps
git push 5Apps master

# Deploy to DropBox