#!/usr/bin/env sh

# Simple script to deploy ShareIt! automatically to the different static web
# hostings and have all of them updated.
#
# It will be of none interest for you since it's only purposed for internal use


PRODUCTION_BRANCH="gh-pages"


echo
echo "* Looking for remote changes on master branch *"
git checkout master
git pull --ff-only

status=$?
if [ $status -ne 0 ];then
    echo "* There was a problem pulling from master *"
    echo "* Probably a non fast-forward merge       *"
    exit $status
fi

echo
echo "* Push changes to GitHub master branch *"
git push origin master

echo
echo "* Update changes on production branch (gh-pages) *"
git checkout $PRODUCTION_BRANCH

status=$?
if [ $status -ne 0 ];then
    echo "* There was a problem doing checkout *"
    echo "* Probably a non staged file         *"
    exit $status
fi

git merge master

status=$?
if [ $status -ne 0 ];then
    echo "* There was a problem merging       *"
    echo "* Probably modified & deleted files *"
#    exit $status

    rm -rf "daemon" "doc" "html_basic" "test images" "COLLABORATE.md" "deploy.sh" "README.md"
    git commit --allow-empty-message
fi

git rm -rf "daemon" "doc" "html_basic" "test images" "COLLABORATE.md" "deploy.sh" "README.md"
git commit --allow-empty-message

# Come back to master branch
git checkout master

echo
echo "* Deploy in GitHub *"
git push origin $PRODUCTION_BRANCH

echo
echo "* Deploy to 5Apps *"
git push 5apps $PRODUCTION_BRANCH:master


echo
echo "* Clean local repository *"
git gc --aggressive
git clean -n -d
