'use strict';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';

class OnClick extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props
    };
  }
  componentWillReceiveProps(props) {
    this.setState({ ...props })
  }
  handleClick = () => {
    this.state.onSubmit({ action: this.state.action, data: { row: this.state.row, column: this.state.column } })
  }


  render() {
    
    if (!this.state.button) {
      return (
        <div className={this.state.className} onClick={this.handleClick}>
          {this.state.row[this.state.column]}
        </div>
      )
    } else {
      return (
        <button className={this.state.className} onClick={this.handleClick}>
          {this.state.row[this.state.column]}
        </button>
      );
    }
  }
  static defaultProps = {
    action: 'submit',
    className: "",
  }
}

const drivers = {
  Link: {
    render: (url, row, onSubmit, config) => {
      return (
        <Link to={row[config.path]}>
          {row[config.text]}
        </Link>
      );
    },
    config: {
      text: "text",
      to: "path"
    },
  },
  List: {
    config: { label: 'label', value: 'value', className: 'anydata-list' },

    render: (column, row, onSumbit, config, anyData, complexRow) => {

      const label = config.label;
      const value = config.value;
      const key = anyData.state.nameSpace + '-list-';
      return (<ul className={config.className}>
        {row[column].map((ref, id) => {
          return <li key={`${key}-${id}`}>{ref[label]}: {ref[value]}</li>
        })}
      </ul>);
    },
  },
  Anchor: {
    render: (url, row, onSubmit, config) => {
      const text = (config.hasOwnProperty('textColumn') && row.hasOwnProperty(config.textColumn) && row[config.textColumn] != "") ? row[config.textColumn] : config.hasOwnProperty('text') ? config.text : row[url];
      return (
        <a className={config.className} target={config.target} href={row[url]}>
          {text}
        </a>
      );
    },
    config: {
      target: "_self",
      className: "",
    }
  },
  Select: {
    config: {
      select: [
        // Example
        /*
         { label: "One", value: "1" },
         { label: "Two", value: "2" },
        */
      ],
    },
    render: (column, row, onSumbit, config, anyData, complexRow) => {
      const onChange = (event) => {
        row[column] = event.target.value;
        anyData.setState({ data: anyData.state.data });
      };
      const list = config.select.map(select =>
        <option key={`${anyData.state.nameSpace}-opt-${++anyData.safeId}-${complexRow.index}`} value={select.value}>
          {select.label}
        </option>
      );
      return (
        <select value={row[column]} onChange={onChange}>
          {list}
        </select>
      );
    }
  },
  Input: {
    config: {},
    render: (column, row, onSumbit, config, anyData, complexRow) => {

      const onChange = (event) => {
        row[column] = event.target.value;
        anyData.setState({ data: anyData.state.data });
      };

      return <input value={row[column]} onChange={onChange} />
    },
  },
  Image: {
    config: {
      className: "",
      style: {},
      opts: {},
    },
    render: (image, row, onSumbit, config) => {
      return <img {...config.opts} src={row[image]} className={config.className} style={config.style} />
    }
  },
  ButtonList: {
    render: (column, row, onSumbit, config, anyData, complexRow) => {
      const list = [];

      const runAction = onSumbit;
      row[column].map((key, id) => {
        if (id > 0) {
          list.push('|');
        }
        const target_key = `${anyData.state.nameSpace}-${id}-${complexRow.index}`;
        list.push(<button key={target_key} onClick={() => {
          const result = { action: key, data: { row: row, column: column } };
          onSumbit(result);
        }}>{key}</button>)
      })
      return <div>{list}</div>;
    },
    config: {},
  },
  OnClick: {
    config: {
      button: false,
    },
    render: (column, row, onSubmit, config) => {
      return (
        <OnClick {...{ ...config, column, row, onSubmit }}>
        </OnClick>
      );
    },
  }
}


class AnyTable extends Component {

  constructor(props) {
    super(props);
    this.state = this.BuildState(props);
    this.safeId = 0;
  }

  renderCell(key, row) {
    const configs = this.state.configs;

    if (configs.hasOwnProperty(key)) {
      const config = configs[key];
      if (config.hasOwnProperty('driver')) {
        const driver = config.driver;
        if (drivers.hasOwnProperty(driver)) {

          const render = drivers[driver].render;
          const renderConfig = { ...drivers[driver].config, ...config, anyData: this, rowObj: row };

          return render(key, row.original, this.state.onSubmit, renderConfig, this, row);

        }
      }
    }

    const type = typeof (row.value);

    if (type == 'object') {
      if (type != 'undefined' && row.value != null) {
        if (row.value.constructor == Array || row.value.constructor == Object) {
          return (
            <pre>
              {JSON.stringify(row.value, null, 2)}
            </pre>
          );
        }
      } else {
        return "null";
      }
    } else {
      return (
        <pre>
          {row.value}
        </pre>
      );
    }
  }

  customFooter = (colName, footerObj, data, classNameFooter) => {
    const footerLabel = footerObj.hasOwnProperty("alias") && footerObj.alias.length > 0 ? footerObj.alias : footerObj.operation;
    const dataNumber = [], dataString = [];
    let value = 0, type = footerObj.operation;

    if (data.length > 0) {
      data.map((obj) => {
        const cellValue = obj[colName];
        let number = (typeof cellValue == "undefined") ? 0 : +(cellValue);
        number = isNaN(number) ? 0 : number;
        dataNumber.push(number);
        let string = typeof cellValue == "undefined" ? "" : (typeof cellValue == "string" ? cellValue : (cellValue == null ? "NULL" : cellValue.toString()));
        // string = 
        dataString.push(string);
      });

      if (type == "Min") {
        value = Math.min(...dataNumber);
      }
      else if (type == "Max") {
        value = Math.max(...dataNumber);
      }
      else if (type == "Sum") {
        value = dataNumber.reduce((a, b) => a + b, 0);
      }
      else if (type == "Avg") {
        value = dataNumber.reduce((a, b) => a + b, 0) / dataNumber.length;
      }
      else if (type == "shortStr") {
        value = dataString.reduce((a, b) => a.length <= b.length ? a : b, 0);
      }
      else if (type == "longStr") {
        value = dataString.reduce((a, b) => a.length >= b.length ? a : b, 0);
      }
    }
    return (
      <div className={classNameFooter}>
        {`${footerLabel} = ${value.toLocaleString()}`}
      </div>);
  }

  // todo
  BuildState(props) {
    const columns = [{ Header: props.Header, columns: [] }];
    const meta = props.meta;

    const state = {
      columns: columns,
      defaultPageSize: props.defaultPageSize,
      loading: false,
      onSubmit: props.onSubmit,
      pending: props.pending,
      meta: {},
      configs: {},
      className: props.className,
      classNameFooter: props.classNameFooter,
      // DisplayBuilder: GLOBAL_DISPLAY_BUILDER,
    };
    if (props.hasOwnProperty('footer')) {
      state.footer = props.footer;
    }
    if (!props.data.hasOwnProperty('last')) {
      state.loading = true;
      return state;
    }
    const data = props.data.last.data;
    state.data = data;

    let type = typeof data;
    let configs = {};
    if (data == null) {
      state.data = [];
      state.loading = true;
    } else if (type == 'object') {
      if (data.constructor == Array && data.length > 0) {
        const row = data[0];

        let type = typeof row;
        if (row == null) {
          columns[0].columns.push({
            Header: 'Scalar',
            accessor: 'fallback',
            Cell: (row) => { return this.renderCell('fallback', row) },
          });
          state.data = [{ "fallback": data }];
        } else if (type == 'object' && row.constructor == Object) {
          if (row.hasOwnProperty(meta) && props.hasMeta) {
            configs = row[meta];
            state.configs = configs;
          }
          const target = columns.columns;

          if (configs.hasOwnProperty('use_this_header')) {
            const conf = configs.use_this_header;
            if (typeof conf == 'object' && conf.hasOwnProperty('driver')) {
              if (conf.driver == 'button') {
                const action = () => {
                  this.state.onSubmit({ action: conf.action, data: this.state.data });
                };
                columns[0].Header = <div><button onClick={action}>{conf.text}</button></div>
              }
            } else {
              columns[0].Header = configs.use_this_header;
            }
          }
          const keys = state.configs.hasOwnProperty('use_these_keys') ? state.configs.use_these_keys : Object.keys(row).sort();
          for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];

            if (key == meta && props.hasMeta == true) {
              continue;
            }

            const col = {
              Header: key,
              accessor: key,
              Cell: (row) => { return this.renderCell(key, row) },
              sortable: true,
              filterable: true,
              show: true,
              minWidth: 100,
              maxWidth: 500,
              textColumn: undefined,
            };
            if (state.hasOwnProperty("footer") && Object.keys(state.footer).includes(key)) {
              const footerObj = state.footer[key];
              col.Footer = this.customFooter(key, footerObj, state.data, state.classNameFooter);
            }

            if (configs.hasOwnProperty(key)) {
              const config = configs[key];
              const colKeysLength = Object.keys(col).length;
              for (let i = 0; i < colKeysLength; i++) {
                let columnKey = Object.keys(col)[i];
                if (!config.hasOwnProperty(columnKey)) {
                  if (i == colKeysLength - 1 && config.hasOwnProperty("footer") && config.footer.hasOwnProperty(key)) {
                    col.Footer = this.customFooter(key, config.footer[key], state.data, state.classNameFooter);
                  }
                  continue;
                }

                col[columnKey] = config[columnKey];
              }
            }

            columns[0].columns.push(col);
          }
        } else {
          columns[0].columns.push({
            Header: 'Scalar',
            accessor: 'fallback',
            Cell: (row) => { return this.renderCell('fallback', row) },
          });
          state.data = [{ "fallback": data }];
        }
      } else {
        columns[0].columns.push({
          Header: 'Scalar',
          accessor: 'fallback',
          Cell: (row) => { return this.renderCell('fallback', row) },
        });
        state.data = [{ "fallback": data }];
      }
    } else {
      columns[0].columns.push({
        Header: 'Scalar',
        accessor: 'fallback',
        Cell: (row) => { return this.renderCell('fallback', row) },
      });
      state.data = [{ "fallback": data + '' }];
    }

    return state;
  }

  componentWillReceiveProps(props) {
    const state = this.BuildState(props);
    this.setState(state);

  }

  filterRow = (filter, row) => {
    const value = row[filter.id];
    if (value == null) {
      return false;
    }

    let cmp;
    const type = typeof value;

    if (type == "string") {
      cmp = value.toLowerCase();
    } else if (type == 'object') {
      try {

        cmp = JSON.stringify(value).toLowerCase();
      } catch (e) {
        cmp = value.toString().toLowerCase();
      }
    } else {
      cmp = value.toString().toLowerCase();
    }
    return cmp.indexOf(filter.value.toLowerCase()) != -1
  }
  render() {
    const loading = this.state.pending || this.state.loading;

    if (this.state.loading) {
      return <div>Loading.........</div>
    }
    return <div style={{ position: 'relative' }} className={this.state.className}><ReactTable
      filterable={true}
      data={this.state.data}
      defaultFilterMethod={this.filterRow}
      columns={this.state.columns}
      defaultPageSize={this.state.defaultPageSize}
      className="-striped -highlight"
      loading={loading}
      showPagination={this.state.showPagination}
    />
      {this.state.pending ? this.noInteract() : ""}
    </div>

  }

  noInteract() {
    const style = {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', /* Black background with opacity */
    };
    return <div style={style}></div>
  }

  static defaultProps = {
    requires: [],
    data: [],
    loading: true,
    DisplayBuilder: null,
    columns: [],
    error: false,
    defaultPageSize: 50,
    meta: 'meta-key',
    Header: "Rows",
    configs: {},
    hasMeta: true,
    className: "React-Table-Fix",
    classNameFooter: "",
    showPagination: true,
  }
}

export default AnyTable;
