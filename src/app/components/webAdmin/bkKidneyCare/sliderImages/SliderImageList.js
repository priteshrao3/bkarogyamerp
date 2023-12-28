import {Avatar, Button, Card, Icon, List, Popconfirm} from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import {getAPI, interpolate, patchAPI, makeFileURL} from "../../../../utils/common";
import {BLOG_PAGE_SEO, BLOG_POST, BLOG_SLIDER, SINGLE_LANDING_PAGE_VIDEO, SINGLE_SLIDER} from "../../../../constants/api";
import AddSliderImage from "./AddSliderImage";

export default class SliderImageList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            slider: [],
            loading:true
        };
        this.loadData = this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this)
    }

    componentWillMount() {
        this.loadData();
    }

    loadData() {
        const that = this;
        const successFn = function (data) {
            console.log(data);
            that.setState({
                slider: data,
                loading:false
            })
        }
        const errorFn = function () {
            that.setState({
                loading:false
            })

        }
        getAPI(BLOG_SLIDER, successFn, errorFn);
    }

    deleteObject(record) {
        const that = this;
        const reqData = {};
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        }
        const errorFn = function () {
        };
        patchAPI(interpolate(SINGLE_SLIDER, [record.id]), reqData, successFn, errorFn)
    }

    render() {
        const that = this;
        return (
<div><Switch>
            <Route
              exact
              path='/web/slider-image/add'
              render={(route) => <AddSliderImage {...this.state} {...route} loadData={this.loadData} />}
            />
            <Route
              exact
              path='/web/slider-image/edit/:id'
              render={(route) => <AddSliderImage {...this.state} {...route} loadData={this.loadData} />}
            />
            <Card
              title="Slider Image"
              extra={(
<Link to="/web/slider-image/add">
                <Button type="primary">
                    <Icon type="plus" /> Add
                </Button>
</Link>
)}
            >
                <List
                  loading={this.state.loading}
                  itemLayout="vertical"
                  dataSource={this.state.slider}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      extra={(
<img
  src={makeFileURL(item.silder_image)}
  alt={item.title}
  style={{
                                               maxWidth: '100%',
                                               width: '400px'
                                           }}
/>
)}
                      actions={[<Link to={`/web/slider-image/edit/${  item.id}`}>Edit</Link>,
                                   <Popconfirm
                                     title="Are you sure delete this item?"
                                     onConfirm={() => that.deleteObject(item)}
                                     okText="Yes"
                                     cancelText="No"
                                   >
                                       <a>Delete</a>
                                   </Popconfirm>]}
                    >
                        <List.Item.Meta
                          avatar={<Avatar>{item.rank}</Avatar>}
                          title={item.title}
                          description={item.name}
                        />
                    </List.Item>
                  )}
                />
            </Card>
     </Switch>
</div>
)
    }
}
