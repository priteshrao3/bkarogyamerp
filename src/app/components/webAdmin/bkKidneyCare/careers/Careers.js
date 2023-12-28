import React from "react";
import {Button, Card, Empty} from "antd";
import {getAPI, makeFileURL} from "../../../../utils/common";
import {WEB_DYNAMIC_CONTENT} from "../../../../constants/api";
import {Link, Switch} from "react-router-dom";
import {Route} from "react-router";
import EditCareers from "./EditCareers";
import {DYNAMIC_CATEGORY_CAREER, DYNAMIC_SUBCATEGORY_CAREERCONTENT} from "../../../../constants/hardData";


export default class Careers extends React.Component {
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
            "category": DYNAMIC_CATEGORY_CAREER,
            "sub_category": DYNAMIC_SUBCATEGORY_CAREERCONTENT,
            page: 1,
            page_size: 1
        }
        getAPI(WEB_DYNAMIC_CONTENT, successFn, errorFn, apiParams);
    }

    render() {
        const {tncData, loading} = this.state;
        return <Switch>
            <Route path={"/web/careers/edit"}
                   render={(route) => <EditCareers {...this.props} editData={tncData} loadData={this.loadData}/>}/>
            <Route>
                <>
                    <Card loading={loading} title={"Careers"} extra={<Link to={"/web/careers/edit"}>
                        <Button type={"primary"} icon={"edit"} style={{float: 'right'}}>
                            Edit
                        </Button>
                    </Link>}>
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
