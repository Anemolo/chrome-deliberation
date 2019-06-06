import chrome from "sinon-chrome";
import { ActiveTabsManager } from "./activeTabsManager";

let _id = 0;
let getId = () => {
  return _id++;
};
const createTab = () => ({
  active: true,
  windowId: ~~(Math.random() * 1000),
  id: getId(),
  url: "URL"
});

function byId(a, b) {
  return a.id - b.id;
}

beforeAll(() => {
  global.chrome = chrome;
});
describe("ActiveTabManager.js", () => {
  let tabs = null;
  const activeTabs = [createTab(), createTab()];

  beforeEach(() => {
    _id = 2;
    chrome.flush();
    tabs = new ActiveTabsManager();
    chrome.tabs.query.yields(activeTabs);
    return tabs.loadActiveTabs();
  });

  test("Gets initial active tabs", () => {
    expect(tabs.active).toEqual(activeTabs);
  });

  describe("New active tab", () => {
    test("Adds it", () => {
      const newTab = createTab();
      chrome.tabs.get.yields(newTab);
      chrome.tabs.onActivated.dispatch({
        tabId: newTab.id,
        windowId: newTab.windowId
      });
      const newActiveTabs = activeTabs.slice().concat(newTab);

      expect(tabs.active.sort(byId)).toEqual(newActiveTabs.sort(byId));
    });

    test("Replaces old tab with same windowID", () => {
      const newActiveTabWithSameWindow = { ...activeTabs[0], id: getId() };
      chrome.tabs.get.yields(newActiveTabWithSameWindow);
      chrome.tabs.onActivated.dispatch({
        tabId: newActiveTabWithSameWindow.id,
        windowId: newActiveTabWithSameWindow.windowId
      });
      const newActiveTabs = activeTabs.slice();
      newActiveTabs[0] = newActiveTabWithSameWindow;

      expect(tabs.active.sort(byId)).toEqual(newActiveTabs.sort(byId));
    });
  });

  test("Removes tab when its window is removed", () => {
    chrome.windows.onRemoved.dispatch({ windowId: activeTabs[0].windowId });

    const tabsWithoutRemovedTab = activeTabs.slice(1);

    expect(tabs.active.sort(byId)).toEqual(tabsWithoutRemovedTab.sort(byId));
  });

  describe("Tab Update", () => {
    test("Updates active tab on url change", () => {
      const updatedTab = { ...activeTabs[0], url: "NEWURL" };
      chrome.tabs.onUpdated.dispatch(
        updatedTab.id,
        { url: updatedTab.url },
        updatedTab
      );

      const newActiveTabs = activeTabs.slice();
      newActiveTabs[0] = updatedTab;

      expect(tabs.active.sort(byId)).toEqual(newActiveTabs.sort(byId));
    });

    test("Doesn't update on change without url", () => {
      const uselessUpdates = { anUpdate: 50, abc: "lol" };
      const updatedTab = { ...activeTabs[0], ...uselessUpdates };
      chrome.tabs.onUpdated.dispatch(updatedTab.id, uselessUpdates, updatedTab);

      const tabsWithChanges = activeTabs.slice();
      tabsWithChanges[0] = updatedTab;

      expect(tabs.active.sort(byId)).not.toEqual(tabsWithChanges.sort(byId));
      expect(tabs.active.sort(byId)).toEqual(activeTabs.sort(byId));
    });
  });
});
