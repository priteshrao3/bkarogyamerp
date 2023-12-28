import React from "react";
import {Button, Card, Empty} from "antd";
import {getAPI, makeFileURL} from "../../../utils/common";
import {WEB_DYNAMIC_CONTENT} from "../../../constants/api";
import {Link, Switch} from "react-router-dom";
import {Route} from "react-router";
import EditAdvisorTnC from "./EditAdvisorTnC";


export default class AdvisorTnC extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tncData: null,
            loading: false
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData = () => {
        let that = this;
        that.setState({
            loading: true
        });
        let successFn = function (data) {
            let content = null;
            if (data.results.length) {
                content = data.results[0];
            }
            that.setState({
                tncData: content,
                loading: false
            });
        }
        let errorFn = function () {
            that.setState({
                loading: false
            });
        }
        let apiParams = {
            "language": "ENGLISH",
            "category": "ADVISOR",
            "sub_category": "Terms & Condition",
            page: 1,
            page_size: 1
        }
        getAPI(WEB_DYNAMIC_CONTENT, successFn, errorFn, apiParams);
    }

    render() {
        const {tncData, loading} = this.state;
        return <Switch>
            <Route path={"/erp/advisors/tnc/edit"}
                   render={(route) => <EditAdvisorTnC {...this.props} editData={tncData} loadData={this.loadData}/>}/>
            <Route>
                <>
                    <h2>Advisor Terms & Conditions
                        <Link to={"/erp/advisors/tnc/edit"}>
                            <Button type={"primary"} icon={"edit"} style={{float: 'right'}}>
                                Edit
                            </Button>
                        </Link>
                    </h2>
                    <Card loading={loading}>
                        {tncData ? <>
                            <h2>{tncData.title}</h2>
                            {tncData.image ? <img src={makeFileURL(tncData.image)} alt={tncData.title}
                                                  style={{width: '100%'}}/> : null}
                            <div dangerouslySetInnerHTML={{__html: tncData.body}}/>
                        </> : <Empty/>}
                    </Card>
                </>
            </Route>

        </Switch>
    }
}
