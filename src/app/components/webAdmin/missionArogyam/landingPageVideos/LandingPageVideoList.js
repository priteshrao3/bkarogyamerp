import {Avatar, Button, Card, Divider, Icon, List, Popconfirm} from "antd";
import React from "react";
import {Route, Switch} from "react-router";
import {Link} from "react-router-dom";
import YouTube from 'react-youtube';
import {getAPI, interpolate, patchAPI, postAPI} from "../../../../utils/common";
import {
    MISSION_BLOG_POST,
    MISSION_BLOG_VIDEOS,
    MISSION_LANDING_PAGE_VIDEO,
    MISSION_SINGLE_LANDING_PAGE_CONTENT,
    MISSION_SINGLE_LANDING_PAGE_VIDEO
} from "../../../../constants/api";
import AddLandingPageVideo from "./AddLandingPageVideo";
import InfiniteFeedLoaderButton from "../../../common/InfiniteFeedLoaderButton";

export default class LandingPageVideoList extends React.Component{
    constructor(props){
        super(props);
        this.state={
            videos:[],
            loading:true
        };
        this.loadData=this.loadData.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    }

    componentDidMount(){
        this.loadData();
    }

    loadData =(page=1)=>{
        const that =this;
        const successFn = function (data) {
            that.setState(function (prevState) {
                if (data.current ==1){
                    return{
                        videos:[...data.results],
                        next:data.next,
                        loading:false
                    }
                }
                return {
                    videos:[...prevState.videos, ...data.results],
                    next:data.next,
                    loading:false
                }
            })
        };
        const errorFn = function () {
          that.setState({
            loading:false
          })

        };
        const apiParams ={
            page,
        }
        getAPI(MISSION_LANDING_PAGE_VIDEO ,successFn, errorFn, apiParams);
    };

    deleteObject(record) {
        const that = this;
        const reqData = {};
        reqData.is_active = false;
        const successFn = function (data) {
            that.loadData();
        }
        const errorFn = function () {
        };
        patchAPI(interpolate(MISSION_SINGLE_LANDING_PAGE_VIDEO, [record.id]), reqData, successFn, errorFn)
    }

    render(){
        const that = this;
        const opts = {
            height: '200',
            width: '300',
            // playerVars: { // https://developers.google.com/youtube/player_parameters
            //     autoplay: 1
            // }
        };
        return(
<div><Switch>
            <Route
              exact
              path='/mission/landingpagevideo/add'
              render={(route) => <AddLandingPageVideo {...this.state} loadData={this.loadData} {...route} />}
            />
            <Route
              exact
              path='/mission/landingpagevideo/edit/:id'
              render={(route) => <AddLandingPageVideo {...this.state} loadData={this.loadData} {...route} />}
            />
            <Card title="Landing Page Video" extra={<Link to="/mission/landingpagevideo/add"> <Button type="primary"><Icon type="plus" /> Add</Button></Link>}>
                <List
                  loading={this.state.loading}
                  dataSource={this.state.videos}
                  itemLayout="vertical"
                  renderItem={item => (
<List.Item
  key={item.id}

  actions={[<Link to={`/mission/landingpagevideo/edit/${item.id}`}>Edit</Link>,
                                                         <Popconfirm
                                                           title="Are you sure delete this item?"
                                                           onConfirm={() => that.deleteObject(item)}
                                                           okText="Yes"
                                                           cancelText="No"
                                                         >
                                                             <a>Delete</a>
                                                         </Popconfirm>]}
  extra={(
<YouTube
  videoId={item.link}
  opts={opts}
/>
)}
>
                          <List.Item.Meta
                            avatar={<Avatar style={{ backgroundColor: '#87d068' }}>{item.rank}</Avatar>}
                            title={item.name}
                          />
</List.Item>
)}
                />
                <Divider />
                <InfiniteFeedLoaderButton
                  loaderFunction={()=>this.loadData(this.state.next)}
                  loading={this.state.loading}
                  hidden={!this.state.next}
                />
            </Card>
     </Switch>
</div>
)
    }
}
