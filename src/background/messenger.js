// Blocked needs to
/*
    GET:
    - All the blocked site data.
    SET:
    - Session time

*/
export class Messenger {
  constructor(adapter) {
    this.subscribers = new Set();
    this.adapter = adapter;
    chrome.runtime.onConnect.addListener(port => {
      if (port.name === "ui") {
        port.onMessage.addListener(message => this.onUIMessage(port, message));
      }
    });
  }
  async onUIMessage(port, { type, id, data }) {
    switch (type) {
      case "get-data": {
        const data = await this.adapter.getData();
        port.postMessage({ id, data });
        break;
      }
      case "get-site-data": {
        const siteData = await this.adapter.getSiteData(data);
        port.postMessage({ id, data: siteData });
        break;
      }
      case "subscribe-to-changes": {
        console.log("subscriber");
        const subscriber = data => port.postMessage({ id, data });
        this.subscribers.add(subscriber);
        port.onDisconnect.addListener(() =>
          this.subscribers.delete(subscriber)
        );
        break;
      }
      case "set-gate": {
        const setData = this.adapter.setGate(data.url);
        port.postMessage({ id, data: setData });
        break;
      }
      case "remove-gate": {
        const removeData = this.adapter.removeGate(data.url);
        port.postMessage({ id, data: removeData });
        break;
      }
      default:
        console.warn("Message not supported", type, "with id", id);
        break;
    }
  }
  publishChanges(changes) {
    console.log("sending changes", changes);
    this.subscribers.forEach(subscriber => subscriber(changes));
  }
}

export default Messenger;
