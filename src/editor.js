/* ================================================================
 * mock by xdf(xudafeng[at]126.com)
 *
 * first created at : Mon Jun 02 2014 20:15:51 GMT+0800 (CST)
 *
 * ================================================================
 * Copyright 2014 xdf
 *
 * Licensed under the MIT License
 * You may not use this file except in compliance with the License.
 *
 * ================================================================ */

let React = require('react');
let Util = require('./util');
let Faker = require('./faker');
let MarkdownComponent = require('./markdown');
let Codemirror = require('react-codemirror');
let pkg = require('../package.json');

require('codemirror/mode/sql/sql');

let parse = function(template) {
  let content = [];
  template.split('{').forEach(function(i) {
    i = i.split('}');

    let $0 = i[0];
    let $1 = i[1];
    let l = null;
    let s = null;

    if (i.length === 1) {
      s = $0;
    } else {
      l = $0;
      if ($1) s = $1;
    }

    content.push({
      '$0': l,
      '$1': s
    });
  });
  return content;
};

let compile = function(template) {
  let content = '';
  template.forEach(function(i) {
    let l = i['$0'];
    let s = i['$1'];

    if (l) {
      content += fakerEval(l);
    }
    if (s) {
      content += s;
    };
  });
  return content;
};

let fakerEval = function(code) {
  return eval.call({
    Faker: Faker
  }, 'this.Faker.' + code);
};

const sampleCode = '\n/* click helper for more help */\n\nselect * from table where id \= \'dafeng\'\;\n';

window.Faker = Faker;

class EditorComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showHelper: false,
      code: sampleCode,
      containerHeight: document.body.clientHeight,
      repeat: 1,
      helperContent: ''
    };
  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState({
        containerHeight: document.body.clientHeight
      });
    }, false);

    Util.ajax('./README.md', data => {
      this.setState({
        helperContent: data
      });
    });
  }

  getEditorStatus() {
    return this.state.showHelper ? 'show-helper' : '';
  }

  getTemplateEditorProps() {
    return {
      value: this.state.code,
      onChange: this.updateCode.bind(this),
      options: {
        lineNumbers: true,
        styleActiveLine: true,
        indentWithTabs: true,
        matchBrackets: true,
        smartIndent: true,
        textWrapping: false,
        lineWrapping: true,
        autofocus: true,
        mode: 'text/x-sql'
      }
    };
  }

  generateFakeData(code) {
    let template = parse(code);
    let result = compile(template);
    return result;
  }

  getOutPutCode() {
    let code = this.state.code;
    let repeat = this.state.repeat;
    let result = '';

    try {
      while (repeat--) {
        result += this.generateFakeData(code);
      }
    } catch(e) {
      console.log(e.stack);
    }
    return result;
  }

  getOutputEditorProps() {
    return {
      value: this.getOutPutCode(),
      options: {
        readOnly: true,
        lineNumbers: true,
        styleActiveLine: true,
        indentWithTabs: true,
        matchBrackets: true,
        smartIndent: true,
        textWrapping: false,
        lineWrapping: true,
        autofocus: true,
        mode: 'text/x-sql'
      }
    };
  }

  getCommonStyle() {
    return {
      height: this.state.containerHeight
    };
  }

  handleHelperClick() {
    this.setState({
      showHelper: !this.state.showHelper
    });
  }

  handleInputChange(e) {
    let value = e.target.value;
    this.setState({
      repeat: value
    });
  }

  updateCode(newCode) {
    this.setState({
      code: newCode
    });
  }

  render() {
    return (
      <div className={`editor ${this.getEditorStatus()}`}>
        <nav className="editor-nav">
          <ul>
            <li className="logo">
              <p className="item title">{pkg.name}</p>
              <p className="version">{pkg.version}</p>
            </li>
            <li className="repeat">
              <label className="repeat-label">
                <input type="text" value={this.state.repeat} onChange={this.handleInputChange.bind(this)}/>
              </label>
            </li>
            <li onClick={this.handleHelperClick.bind(this)}>
              <span className="item">helper</span>
            </li>
          </ul>
        </nav>
        <div className={`template`} style={this.getCommonStyle()} ref="template">
          <Codemirror {...this.getTemplateEditorProps()}/>
        </div>
        <div className={`output`} style={this.getCommonStyle()} ref="output">
          <Codemirror {...this.getOutputEditorProps()} />
        </div>
        <div className={`helper`} style={this.getCommonStyle()} ref="helper">
          <MarkdownComponent>
          {this.state.helperContent}
          </MarkdownComponent>
        </div>
      </div>
    );
  }
}

EditorComponent.defaultProps = {
};

module.exports = EditorComponent;