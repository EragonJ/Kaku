#!/usr/bin/bash

###
# Desktop icon maker for Kaku music player.
# @author SkyzohKey
# @license MIT
###

# Lets store the current path script is ran.
DIR=$(pwd)

# Store some informations for later usage.
APP_NAME="Kaku"
APP_DESCRIPTION="The next generation music client http://kaku.rocks"
APP_VERSION="1.8.0"
APP_CATEGORIES="Application;Music;"

# Define the file paths for easier configuration.
DESKTOP_FILE="${APP_NAME}.desktop"
LAUNCH_FILE="${APP_NAME}.sh"
LOGO_FILE="logo.png"

# Lets create our simple start script.
echo "# Set the working directory" > "$LAUNCH_FILE"
echo "DIR=\$(pwd)" >> "$LAUNCH_FILE"
echo "" >> "$LAUNCH_FILE"
echo "# Run the application" >> "$LAUNCH_FILE"
echo "cd \$DIR" >> "$LAUNCH_FILE"
echo "./${APP_NAME}" >> "$LAUNCH_FILE"

# Make it executable.
chmod +x "$LAUNCH_FILE"

# Lets create the desktop file.
echo "[Desktop Entry]" > "$DESKTOP_FILE"
echo "Encoding=UTF-8" >> "$DESKTOP_FILE"
echo "Name=${APP_NAME}" >> "$DESKTOP_FILE"
echo "Comment=${APP_DESCRIPTION}" >> "$DESKTOP_FILE"
echo "Path=${DIR}" >> "$DESKTOP_FILE"
echo "Exec=${DIR}/${LAUNCH_FILE}" >> "$DESKTOP_FILE"
echo "Icon=${DIR}/${LOGO_FILE}" >> "$DESKTOP_FILE"
echo "Categories=${APP_CATEGORIES}" >> "$DESKTOP_FILE"
echo "Version=${APP_VERSION}" >> "$DESKTOP_FILE"
echo "Type=Application" >> "$DESKTOP_FILE"
echo "Terminal=0" >> "$DESKTOP_FILE"

# Make it executable and move it to the user xdg-desktop.
chmod +x "$DESKTOP_FILE"
mv "$DESKTOP_FILE" "$(xdg-user-dir DESKTOP)/${DESKTOP_FILE}"

exit 0
