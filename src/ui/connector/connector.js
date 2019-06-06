export class Connector {
  constructor() {
    this.counter = 0;
    this.port = chrome.runtime.connect({ name: "ui" });
  }

  getRequestId() {
    return ++this.counter;
  }

  sendRequest(request, onResponse) {
    const id = this.getRequestId();
    return new Promise((resolve, reject) => {
      const listener = ({ id: responseId, ...response }) => {
        if (responseId === id) {
          onResponse(response, resolve, reject);
        }
      };
      this.port.onMessage.addListener(listener);
      this.port.postMessage({ ...request, id });
    });
  }
  getData() {
    return this.sendRequest({ type: "get-data" }, ({ data }, resolve) =>
      resolve(data)
    );
  }
  getSiteData(url) {
    return this.sendRequest(
      { type: "get-site-data", data: { url } },
      ({ data }, resolve, reject) => {
        if (data) resolve(data);
        else reject("Url not found in data");
      }
    );
  }
  addGate(url) {
    return this.sendRequest(
      { type: "set-gate", data: { url } },
      ({ data }, resolve, reject) => {
        if (data.error) reject(data);
        resolve(data);
      }
    );
  }
  removeGate(url) {
    return this.sendRequest(
      { type: "remove-gate", data: { url } },
      ({ data }, resolve, reject) => {
        if (data.error) reject(data);
        resolve(data);
      }
    );
  }
  subscribeToChanges(callback) {
    const id = this.getRequestId();
    this.port.onMessage.addListener(({ id: responseId, data }) => {
      if (responseId === id) {
        callback(data);
      }
    });
    this.port.postMessage({ type: "subscribe-to-changes", id });
  }
}

export default Connector;
