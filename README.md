manifest.json
Metadata of the extension. Name, description what permissions it requires

links
https://github.com/google/page-timer/blob/master/background.js
https://developers.chrome.com/extensions/devguide

Not sure if I can acess this storage on the blocked.html
https://developers.chrome.com/extensions/storage

// https://medium.freecodecamp.org/how-to-create-and-publish-a-chrome-extension-in-20-minutes-6dc8395d7153

TESTING:
https://github.com/pureooze/extension-testing-example
Chrome mock https://github.com/acvetkov/sinon-chrome
TODO:

- Use domains instead of hosts
  HOST: freecodecampt.medium.com
  DOMAIN: medium.com

Main Features
Development
[x] Refactor into a class
[x] Hot Reloading
[x] Build Process
[] Tests

Background
[] Reset accumulated Time on new day

Blocked page
[] Refactor blocked.html
[] Better Fullscreen view / design.

ToolTip
[] Can add and remove website list. Can quickly add current website
[] Can see list of websites added

Good to have
Technical
[] Not sure If i need tab created. Tab activated and tab updated might be enough
[] Figure out tab.onReplaced works
[] Fetch only data of current tabs.
[] Use hosts or tomains
[] Don't add non-gated active tabs to array. So you don't have to check for data existance.
[] Get proper terminolofy for site, host etc

Extra Features
[] Reduce time options for concurrent sessions
[] Different types of blocks for different kinds websites
