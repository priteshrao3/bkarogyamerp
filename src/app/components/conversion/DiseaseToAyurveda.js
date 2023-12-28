import React from 'react';
import {Col, Collapse, Divider, List, Result, Row, Select, Spin, Typography} from "antd";
import {displayMessage, getAPI, makeFileURL} from "../../utils/common";
import {ERROR_MSG_TYPE} from "../../constants/dataKeys";
import {CONEVRSION_LIST_API, CONVERSION_DISEASE_API} from "../../constants/api";


const {Panel} = Collapse;
const {Paragraph, Title} = Typography;
export default class DiseaseToAyurveda extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            medicineMappingList: [],
            medicineMappingLoading: false,
            medicineObject: {},
            diseaseList:[]
        }
    }

    componentDidMount() {
        this.loadConversionDiseaseList()
    }

    loadConversionDiseaseList = () => {
        const that = this;
        const successFn = function (data) {
            that.setState({
                diseaseList: data
            })
        }
        const errorFn = function () {
            displayMessage(ERROR_MSG_TYPE, "Disease List Loading Failed.");
        }
        getAPI(CONVERSION_DISEASE_API, successFn, errorFn)
    }

    loadAvailableConversion = (value) => {
        const that = this;
        that.setState({
            medicineMappingLoading: true
        })
        const successFn = function (data) {
            const medicines = {};
            data.results.forEach(function (mapping) {
                mapping.ayurveda_data.forEach(function (med) {
                    medicines[med.id] = med
                })
            })
            that.setState({
                medicineMappingList: data.results,
                medicineMappingLoading: false,
                medicineObject: medicines
            })
        }
        const errorFn = function () {
            that.setState({
                medicineMappingLoading: false
            })
            displayMessage(ERROR_MSG_TYPE, "Medicine Mapping List Loading Failed.");
        }
        if(value.length) {
            getAPI(CONEVRSION_LIST_API, successFn, errorFn, {diseases: value.join(',')})
        }else{
            this.setState({
                medicineMappingList: [],
                medicineMappingLoading: false,
                medicineObject: {}
            })
        }
    }

    render() {
        const {diseaseList, medicineMappingLoading, medicineObject} = this.state;
        const medList = Object.keys(medicineObject).map(key => {
            return {...medicineObject[key]}
        });
        return (
            <div>
                <Row gutter={16}>
                    <Col xs={24} sm={24} md={0} lg={0}>
                        <h3>Allopath Medicine</h3>
                    </Col>
                    <Col xs={0} sm={0} md={8} lg={8}>
                        <h3 style={{textAlign: 'right'}}>Disease</h3>
                    </Col>
                    <Col xs={24} sm={24} md={12} lg={12}>
                        <Select style={{width: '100%'}} mode="multiple" showSearch onChange={(e) => this.loadAvailableConversion(e)} optionFilterProp="label">
                            {diseaseList.map(item => <Select.Option value={item.id} label={item.name}>{item.name}</Select.Option>)}
                        </Select>
                    </Col>
                </Row>
                <Spin spinning={medicineMappingLoading}>
                    <>
                        {medList.length ?
                            <Divider><Title level={3}>Recommended Ayurveda Suggestions</Title></Divider> : (
                                <Result
                                  title="Select Diseases for suggested Ayurveda Medicine"
                                />
                            )}
                        <Collapse
                          accordion
                          bordered={false}
                          className="site-collapse-custom-collapse"
                        >{medList.map(item => (
                            <Panel
                              header={<Title level={3}>{item.name}</Title>}
                              key={item.id}
                              className="site-collapse-custom-panel"
                            >
                                <img
                                  width={272}
                                  alt={item.name}
                                  style={{float: 'right'}}
                                  src={makeFileURL(item.image)}
                                />
                                <Title level={4}>Description</Title>
                                <Row>
                                    <Col span={24}>
                                        <Title level={4}>Description</Title>
                                        <div dangerouslySetInnerHTML={{__html: item.description}} />
                                    </Col>
                                    <Col span={24}>
                                        <Title level={4}>Benefits</Title>
                                        <div dangerouslySetInnerHTML={{__html: item.benefit}} />
                                    </Col>
                                </Row>
                            </Panel>
                        ))}
                        </Collapse>
                    </>
                </Spin>
            </div>
        )
    }
}
