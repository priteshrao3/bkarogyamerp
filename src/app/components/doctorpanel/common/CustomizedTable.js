import React from "react";
import {Button, Col, Icon, Row, Table} from "antd";
import {exportToExcel, exportToPDF} from "../../../utils/export";
import moment from "moment";

export default class CustomizedTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...props
        };
        this.excelExport = this.excelExport.bind(this);
        this.pdfExport = this.pdfExport.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.columns != this.state.columns || newProps.dataSource != this.state.dataSource || newProps.loading != this.state.loading) {
            this.setState({...newProps});
        }
    }

    pdfExport() {
        let that = this;
        let excelColumns = that.state.columns.map(item => ({title: item.title, dataKey: item.title}));
        let dataArrayForExcel = [];
        that.state.dataSource.forEach(function (dataRow) {
            let dataObjectToPush = {};
            that.state.columns.forEach(function (column) {
                if (column.export) {
                    dataObjectToPush[column.title] = column.export(dataRow[column.dataIndex], dataRow);
                } else {
                    dataObjectToPush[column.title] = dataRow[column.dataIndex];
                }
            });
            dataArrayForExcel.push(dataObjectToPush);
        });
        exportToPDF(excelColumns, dataArrayForExcel, "Export" + moment(), true);
    }

    excelExport() {
        let that = this;
        let excelColumns = that.state.columns.map(item => item.title);
        let dataArrayForExcel = [];
        that.state.dataSource.forEach(function (dataRow) {
            let dataObjectToPush = {};
            that.state.columns.forEach(function (column) {
                if (column.export) {
                    dataObjectToPush[column.title] = column.export(dataRow[column.dataIndex], dataRow);
                } else {
                    dataObjectToPush[column.title] = dataRow[column.dataIndex];
                }
            });
            dataArrayForExcel.push(dataObjectToPush);
        });
        exportToExcel(excelColumns, dataArrayForExcel, "Export" + moment());
    }

    render() {
        return <div>
            {this.props.hideReport ? null : <Row style={{marginBottom: '5px'}}>
                <Col>
                    <Button.Group size="small">
                        <Button disabled={this.state.loading} type="primary" onClick={this.excelExport}><Icon
                            type="file-excel"/> Excel</Button>
                        <Button disabled={this.state.loading} type="primary" onClick={this.pdfExport}><Icon
                            type="file-pdf"/> PDF</Button>
                    </Button.Group>
                </Col>
            </Row>}
            <Row>
                <Table {...this.state} />
            </Row>
        </div>
    }

}
