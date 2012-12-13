#!/usr/bin/env sh

# Simple script to deploy ShareIt! automatically to the different static web
# hostings and have all of them updated.
#
# It will be of none interest for you since it's only purposed for internal use


echo
echo "* Looking for remote changes on master branch *"
git checkout master
git pull --ff-only

status=$?
if [ $status -ne 0 ];then
    echo "* There was a problem pull from master *"
    echo "* Pprobably a non fast-forward merge   *"
    exit $status
fi

echo
echo "* Push changes to GitHub master branch *"
git push origin master

echo
echo "* Update changes on production branch (gh-pages) *"
git checkout gh-pages
git rebase master
git checkout master

echo
echo "* Deploy in GitHub *"
git push origin gh-pages

echo
echo "* Deploy to 5Apps *"
git push 5apps gh-pages:master
