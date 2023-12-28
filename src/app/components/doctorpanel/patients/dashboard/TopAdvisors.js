import React from 'react';
import {Card, DatePicker} from "antd";
import {getAPI, interpolate} from "../../../../utils/common";
import {WALLET_LEDGER_TOP_ADVISOR} from "../../../../constants/api";
import moment from "moment";
import {Bar, Cell, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

const {RangePicker} = DatePicker;
export default class TopAdvisors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advisorDetails: [],
            startDate: moment().startOf('month'),
            endDate: moment().endOf('month')
        }
        this.loadAdvisors();
    }

    loadAdvisors = () => {
        let that = this;
        that.setState({
            loading: true
        })
        let successFn = function (data) {
            that.setState({
                advisorDetails: data,
                loading: false
            })
        }
        let errorFn = function () {
            that.setState({
                loading: false
            })
        }
        getAPI(interpolate(WALLET_LEDGER_TOP_ADVISOR, [this.props.currentPatient.id]), successFn, errorFn, {
            start: this.state.startDate.format(),
            end: this.state.endDate.format(),
            agent_id: this.props.currentPatient.id
        })
    }
    changeRange = (e) => {
        let that = this;
        this.setState({
            startDate: moment(e[0]),
            endDate: moment(e[1])
        }, function () {
            that.loadAdvisors()
        })
    }

    render() {
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
        return <div>
            <Card bodyStyle={{width: '100%', height: 250}} style={{marginBottom: 20}} loading={this.state.loading}>
                <h2 style={{marginBottom: 10}}>Top 5 Advisors <RangePicker style={{float: 'right'}}
                                                                           onChange={this.changeRange}
                                                                           allowClear={false}
                                                                           value={[this.state.startDate, this.state.endDate]}/>
                </h2>
                <ResponsiveContainer>
                    <ComposedChart
                        data={this.state.advisorDetails}>
                        <YAxis dataKey="total" type="number"/>
                        <XAxis dataKey="advisor.user.first_name" type="category"/>
                        <Tooltip/>
                        <Bar dataKey="total" barSize={50} fill="#413ea0">
                            {
                                this.state.advisorDetails.map((entry, index) => <Cell key={`cell-${index}`}
                                                                                      fill={COLORS[index % COLORS.length]}/>)
                            }
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </Card>
        </div>
    }
}