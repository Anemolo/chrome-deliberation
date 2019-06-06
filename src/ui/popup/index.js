import ReactDOM from "react-dom";
import React, { Component } from "react";
import { Connector } from "../connector/connector";
import { Map } from "immutable";
import { Flex } from "rebass";

const SiteItem = ({ url, index, onRemove }) => {
  return (
    <li
      css={`
        display: flex;
      `}
    >
      <a
        css={`
          width: 100%;
        `}
        target="_blank"
        href={`https://${url}`}
      >
        {url}
      </a>
      <button onClick={() => onRemove(url, index)}>X</button>
    </li>
  );
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      siteList: null,
      value: ""
    };
    this.connector = new Connector();

    this.handleAddGate = this.handleAddGate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleRemoveGate = this.handleRemoveGate.bind(this);
  }
  componentDidMount() {
    this.connector.getData().then(data => {
      this.setState({ siteList: Map(data.siteList) });
    });
    this.connector.subscribeToChanges(changes => {
      console.log("changes", changes);
    });
  }
  handleAddGate() {
    const url = this.state.value;
    this.connector.addGate(url).then(res => {
      console.log(res);
      if (res.error) {
        return;
      }
      this.setState({
        siteList: this.state.siteList.set(url, res.siteInfo[url])
      });
    });
  }
  handleRemoveGate(url, index) {
    this.connector.removeGate(url).then(res => {
      if (res.error) {
        return;
      }
      this.setState({
        siteList: this.state.siteList.delete(url)
      });
    });
  }
  handleChange(ev) {
    this.setState({ value: ev.target.value });
  }
  render() {
    const { siteList, value } = this.state;
    if (siteList == null) {
      return <div>Loading</div>;
    }
    return (
      <div>
        <Flex>
          <input onChange={this.handleChange} value={value} />
          <button onClick={this.handleAddGate}>Add</button>
        </Flex>
        <ul>
          {siteList.valueSeq().map((info, index) => (
            <SiteItem
              url={info.url}
              onRemove={this.handleRemoveGate}
              index={index}
            />
          ))}
        </ul>
      </div>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("app"));
