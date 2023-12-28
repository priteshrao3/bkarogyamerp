import React, { Component } from 'react';
import { Select, Table } from 'antd';

class AllUserTargetSummary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            reportData: [],
            startDate: this.props.startDate,
            endDate: this.props.endDate,
            mailingUsersList: this.props.mailingUsersList,
        };
    }

    componentDidMount() {

        this.loadUserTargetSummary();

    }

    componentWillReceiveProps(newProps) {
        const that = this;
        if (this.props.startDate != newProps.startDate || this.props.endDate != newProps.endDate || this.props.dept != newProps.dept ||
            this.props.designation != newProps.designation)
            this.setState({
                startDate: newProps.startDate,
                endDate: newProps.endDate,
            }, function() {
                that.loadUserTargetSummary();
            });

    }

    loadUserTargetSummary = () => {
        let that = this;
        const apiParams = {
            type: that.props.type,
            start: this.state.startDate.format('YYYY-MM-DD'),
            end: this.state.endDate.format('YYYY-MM-DD'),
        };

        if (that.props.dept) {
            apiParams.department = that.props.dept;
        }
        if (that.props.designation) {
            apiParams.designation = that.props.designation;
        }
        console.log('req', apiParams);
    };

    render() {
        let { loading, reportData } = this.state;
        const columns = [
            {},
        ];
        return (
            <div>
                <h2>All User Target Summary
                    <span style={{ float: 'right' }}>
                        <p><small>E-Mail To:&nbsp;</small>
                        <Select onChange={(e) => this.sendMail(e)} style={{ width: 200 }}>
                            {this.state.mailingUsersList.map(item => (
                                <Select.Option
                                    value={item.email}
                                >{item.name}
                                </Select.Option>
                            ))}
                        </Select>
                        </p>
                    </span>
                </h2>

                <Table
                    loading={loading}
                    dataSource={reportData}
                    columns={columns}
                    pagination={false}
                />
            </div>
        );
    }
}

export default AllUserTargetSummary;
