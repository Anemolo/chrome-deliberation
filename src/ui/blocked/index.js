import ReactDOM from "react-dom";
import React, { Component } from "react";
import { extractHostname } from "../../utils/extractHostname";

import { GlobalStyle } from "../components/GlobalStyle";
import { Box } from "../components/primitives";
import { Connector } from "../connector/connector";

import { GatedView } from "./views/Gated";
import { BlockedView } from "./views/Blocked";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gateInfo: null
    };
    this.connector = new Connector();
  }
  componentDidMount() {
    // this.connector.getData().then(data => {
    //   console.log("DATA", data);
    // });
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get("url");
    const host = extractHostname(url);

    this.connector.getSiteData(host).then(gateInfo => {
      this.setState({
        gateInfo
      });
    });
  }
  render() {
    const { gateInfo } = this.state;
    console.log(this.state.gateInfo);
    const viewComponent =
      gateInfo && gateInfo.accumulatedTime > gateInfo.totalTime ? (
        <BlockedView info={gateInfo} />
      ) : (
        <GatedView info={gateInfo} />
      );
    return (
      <React.Fragment>
        <GlobalStyle />
        {gateInfo ? viewComponent : null}
      </React.Fragment>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));

console.log("blocked");
