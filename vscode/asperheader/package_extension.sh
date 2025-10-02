#!/bin/bash
echo "Packaging extension..."
echo "Installing dependencies..."
npm install
STATUS=$?
if [ $STATUS -ne 0 ]; then
    echo "Install step failed, se above for more details."
    exit $STATUS
fi
echo "Installing @vscode/vsce locally"
# npm install --save-dev @vscode/vsce
npm install --no-save @vscode/vsce
STATUS=$?
if [ $STATUS -ne 0 ]; then
    echo "Install step failed, se above for more details."
    exit $STATUS
fi
echo "Copying readme from the root of the repository to the vscode extension..."
cp -vf ../../README.md ./README.md
echo "Copying license from the root of the repository to the vscode extension..."
cp -vf ../../LICENSE ./LICENSE
echo "Copying the changelog from the root of the repository to the vscode extension..."
cp -vf ../../CHANGELOG.md ./CHANGELOG.md
echo "Copying the images and demos from the root of the repository to the vscode extension..."
cp -rvf ../../images/* ./images
echo "Removing the existing dist folder..."
rm -rvf ./dist
echo "Running pre-publishing commands..."
npm run package
STATUS=$?
if [ $STATUS -ne 0 ]; then
    echo "Pre-publishing step failed, se above for more details."
    exit $STATUS
fi
echo "Running the intergrated vsce:package (if present)..."
npm run vsce:package
if [ $? -ne 0 ]; then
    echo "Running vsce manually..."
    npx vsce package
    STATUS=$?
    if [ $STATUS -ne 0 ]; then
        echo "Packaging failed, see above for more details."
        exit $STATUS
    fi
fi
echo "Displaying included files..."
npx vsce ls --tree
