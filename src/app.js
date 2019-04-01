const {remote, ipcRenderer} = require("electron");
const React = require("react");
const ReactDOM = require("react-dom");
const win = remote.getCurrentWindow()
const size = win.getSize();

const messageColor = "#0080ff";
const inputColor = "#FFF";

let app;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lines: [],
    }
    this.responses = [];
    this.responseData = {};

    this.addResponse("name", "What should the name of your addon folder be?")
    this.addResponse("file_key", "What will file key be? (eg: fileKey_sv.lua)")
    this.addResponse("global", "What will your global table be?")
    this.addResponse("tab", "How many spaces do you want a tab to be?")

    setTimeout(() => {this.nextResponse()}, 250);
    app = this;
  }

  addResponse(key, msg) {
    const response = {
      key: key,
      msg: msg,
      done: false,
      active: false,
    }
    this.responses.push(response);
  }

  nextResponse() {
    let hasNext = false;
    for (let x in this.responses) {
      const response = this.responses[x];
      if (response.done) continue;

      response.active = true;
      this.addLine(response.msg)
      hasNext = true
      break;
    }

    if (!hasNext) {
      ipcRenderer.send("addon-data", this.responseData)
      this.addLine("Starting the creation of your addon...")
    }
  }

  handleResponse(text) {
    for (const x in this.responses) {
      const response = this.responses[x];
      if (response.completed || !response.active) continue;

      this.responseData[response.key] = text;
      response.done = true;
      response.active = false;
      this.nextResponse();
      break;
    }
  }

  addLine(text, color) {
    const lines = this.state.lines;

    lines.push({ text: text, color: color });
    this.setState({
      lines: lines,
    })
  }

  handleKeyDown(event) {
    if (event.key !== "Enter") return;
    const input = event.target;
    const text = input.value;

    this.addLine(text, inputColor);
    this.handleResponse(text);
    input.value = "";
  }

  scrollToBottom() {
    const elem = this.lastMessage;
    if (!elem) return;

    elem.scrollIntoView({ behavior: "smooth" });
  }

  render() {
    const size = this.props.size;
    const divStyle = {
      width: size[0] - 26,
      height: size[1] - 69,
    }
    return (
      <div id="App" style={divStyle}>
        <h1 id="title">GMod Addon Template Generator</h1>
        
        <div id="outputContainer">
          {this.state.lines.map((line, i) =>
            <Line key={i} text={line.text} color={line.color}/>
          )}
          <div ref={(el) => { this.lastMessage = el; this.scrollToBottom() }} />
        </div>

        <input id="input" onKeyDown={ event => this.handleKeyDown(event) }/>
        {this.scrollToBottom()}
      </div>
    );
  }
}

class Line extends React.Component {
  render() {
    const pStyle = {
      color: this.props.color || messageColor,
    }
    return (
      <p className="line" style={pStyle}>{this.props.text}</p>
    );
  }
}

ReactDOM.render(<App size={size}/>, document.getElementById("root"));

ipcRenderer.on("addon-done", (sender, data) => {
  let str = data.success ? "Successfully created addon template..." : "Failed to create addon template..."
  let col = !data.success && "red";
  app.addLine(str, col)
})