import chrome from "sinon-chrome";
import { UserStorage } from "./userStorage";

beforeAll(() => {
  global.chrome = chrome;
});

test("Uses default settings if no settings found in storage", () => {
  const Storage = new UserStorage();
  chrome.storage.local.get.yieldsAsync(Storage.defaultSettings);
  return Storage.loadSettings().then(() => {
    expect(Storage.settings).toEqual(Storage.defaultSettings);
  });
});

test("Partially uses default settings when not found in storage", () => {
  const Storage = new UserStorage();
  const result = { ...Storage.defaultSettings, ...{ storedSetting: [] } };
  chrome.storage.local.get.yieldsAsync(result);
  return Storage.loadSettings().then(() => {
    expect(Storage.settings).toEqual(result);
  });
});
