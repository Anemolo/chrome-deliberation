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

USER PERSONAS:

- DETERMINED USER:
  - seeking INFORMATION
  - seeking ENTRETAIMENT
- CRAVING USER:
  - mood SAD
  - seeking INSTANT REWARD/ STIMULI
  - DISTRACTED

MINIMUM VIABLE PRODUCT:

FEATURES:

- Basic gate
  [x] User can add and remove a gated website. And visually know its been added or removed.
  [x] Gated sites can only be used when the user creates a session with a set time.
  [] User can create a new session.

- Allowed time
  [x] Gated websites have a total allowed time for the day. It gets totally blocked, after.
  [x] User cannot create a time session if the total time session surprases total allowed time.
  [] User can modify the options initially and later on


DESIGN:

[] UI as a distintive iddentity that aids the deliberate idea

- Gate
  [] User understand at a glance it is a gate
  [] User can clearly see allowed time left.
  [] Users are incentivised to choose smaller time session.
- Block  
   [] User understands at a glance it is a block
- Popup
  [] User understand how to gate current site.
  [] User understands how to modify gate configurations.
  [] User can see a clear list of gated sites and modify/delete them.
  [] User can add a bulk of gated sites.

TECHNICHAL:
[] User can use back and forward buttons without a problem.
[] Session buttons do not go over allowed time.
[] Important components are tested.

IDEAS TO EXPLORE:

2. Reward good behavior, add consecuences to bad behavior.
   1. CONSEQUENCE: Whenever a blocked site, add time to block.
      With this consecuence, the user will start checking this site less and less.
      [] how much time to add to the block? Seconds, few minutes?
      [] Should I make continous sessions have a bigger time gap?
   2. CONSEQUENCE: Don't allow for continuos sessions.
      Allowing the user to use all of his allowed time at the same time might not be ideal for all sites.
      [] Time gap between sessions
   3. REWARD: If the user chooses a big option, prompt them to choose a smaller one. And reward them for doing so.
      If the CRAVING USER can hold of their craving. They are rewarded for that positive behavior. Beware of this being exploited.
      [] Whats the reward? How big?
      [] How to avoid explotation of this mechanich?
3. Flexibility
   1. Let user have 5+ minutes at the cost of more time(or something else). Only is allowed if the session is active.
      [] Whats the cost? How big is it?
   2. Allow for unblocking any site. With a delay and available window.
      When requested, send a password in a email with a delay. The password can only be used in a 5 minute window.
      Any site can be unlocked at any moment if the user really needs to do something.
      The delay and available window allows CRAVING USER to calm down and forget the craving. While DETERMINED USER is able to use the site.
      [] How much time is it un-blocked for?
      [] How much time is the delay and use window?

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
[x] Refactor blocked.html
[] Better Fullscreen view / design.

Good to have
Technical
[] Not sure If i need tab created. Tab activated and tab updated might be enough
[] Figure out tab.onReplaced works
[] Fetch only data of current tabs.
[] Use hosts or tomains
[] Get proper terminolofy for site, host etc
[] Check if host or url already exsit in gatedSites array

Extra Features
[] Reduce time options for concurrent sessions
[] Different types of blocks for different kinds websites
