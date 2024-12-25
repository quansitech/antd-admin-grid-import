import React from 'react';
import {Table, Tooltip} from 'antd';
import {WarningTwoTone} from '@ant-design/icons';
import CellNode from './CellNode';

class BaseTable extends React.Component {

    constructor(props) {
        super(props);

        this._row_error_key = '_row';

        this.final = this.props.columns.children ? false : true;

        this.currentIndex = 1;

        this.renderCell = this.renderCell.bind(this);
        this.expandedRowRender = this.expandedRowRender.bind(this);
        this.updateState = this.updateState.bind(this);
        this.commonChange = this.commonChange.bind(this);
        this.updateBaseProp = this.updateBaseProp.bind(this);
        this.focusErr = this.focusErr.bind(this);
        this.getCellSourceVal = this.getCellSourceVal.bind(this);
        this.getRowErr = this.getRowErr.bind(this);
        this.getCellErr = this.getCellErr.bind(this);

        this.cellNodeRef = React.createRef();

    }

    getCellSourceVal(val, colSetting) {
        return this.cellNodeRef.current.getSourceVal(val, colSetting)
    }

    getRowErr(rowData) {
        return rowData?.error?.[this._row_error_key];
    }

    getCellErr(key, rowData) {
        return rowData?.error?.[key];
    }

    focusErr = () => {
        if (this.max_tabindex == 0) {
            return;
        }

        if (this.currentIndex > this.max_tabindex) {
            this.currentIndex = 1;
        }
        location = `#anchor_${this.currentIndex++}`

        //向下滚动一段举例，避免被屏幕顶部的元素遮住
        setTimeout(() => {
            window.scrollTo(0, window.scrollY - 200)
        })
    }

    updateBaseProp() {
        this.columns = this.props.columns.data.map(col => {
            return {
                title: col.title,
                dataIndex: col.key,
                key: col.key,
                width: col.width,
                render: this.renderCell(col)
            }
        });
        this.dataSource = this.props.row_data.map((col, idx) => {
            const dataSource = col.data;
            dataSource.key = idx;
            return dataSource;
        });

        let tabindex = 0;
        this.row_data = this.props.row_data.map(col => {
            if (col.error) {
                col.error_tabindex = {};
                for (const [key, value] of Object.entries(col.error)) {
                    col.error_tabindex[key] = ++tabindex;
                }
            }
            return col;
        })

        this.max_tabindex = tabindex;

    }

    renderCell(colSetting) {

        return (text, record, index) => {
            let row_error_tips;
            let cell_error_tips;
            if (colSetting.key == this.props.columns.data[0].key
                && typeof this.props.row_data[index].error != "undefined"
                && typeof this.getRowErr(this.props.row_data[index]) != "undefined") {
                row_error_tips = true;
            }

            if (typeof this.props.row_data[index].error != "undefined" && typeof this.getCellErr(colSetting.key, this.props.row_data[index]) != "undefined") {
                cell_error_tips = true;
            }
            return (
                <div>
                    {row_error_tips &&
                        //<WarningIcon ref={rowErrRef} tips={this.props.row_data[index].error[this._row_error_key]}></WarningIcon>
                        <Tooltip title={this.getRowErr(this.props.row_data[index])}>
                            <a name={`anchor_${this.row_data[index].error_tabindex[this._row_error_key]}`}>
                                <WarningTwoTone style={{marginRight: 5}} twoToneColor="#df0000"/>
                            </a>
                        </Tooltip>
                    }
                    <CellNode text={text} index={index} colsetting={colSetting} topchange={this.commonChange}
                              style={{width: '78%'}} ref={this.cellNodeRef}/>
                    {cell_error_tips &&
                        //<WarningIcon ref={cellErrRef} tips={this.props.row_data[index].error[colSetting.key]}></WarningIcon>
                        <Tooltip title={this.getCellErr(colSetting.key, this.props.row_data[index])}>
                            <a name={`anchor_${this.row_data[index].error_tabindex[colSetting.key]}`}>
                                <WarningTwoTone style={{marginLeft: 5}} twoToneColor="#df0000"/>
                            </a>
                        </Tooltip>
                    }
                </div>
            );

        };
    }


    commonChange(val, index, columnName) {
        this.props.row_data[index].data[columnName] = val;
        this.updateState(this.props.row_data, 0, true);
        this.updateBaseProp();
    }

    updateState(data, parentIdx, current = false) {
        if (!current) {
            this.props.row_data[parentIdx].children = data;
        }
        this.props.updatestate(this.props.row_data, this.props.parentIdx);
    }

    expandedRowRender(record, index) {
        if (typeof this.props.row_data[index].children == 'undefined') {
            return false;
        } else {
            return <BaseTable columns={this.props.columns.children} row_data={this.props.row_data[index].children}
                              parentIdx={index} updatestate={this.updateState}/>
        }

    }


    render() {
        this.updateBaseProp();
        return <Table columns={this.columns} dataSource={this.dataSource} expandedRowRender={this.expandedRowRender}
                      pagination={false} defaultExpandAllRows={true}/>

    }
}

export default BaseTable;