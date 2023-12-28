import React from "react";
import {Layout} from "antd";
import {Route, Switch} from "react-router-dom";
import VideosList from "./videos/VideosList";
import BlogList from "./blog/BlogList";
import ContactsList from "./contacts/ContactsList";
import DiseaseList from "./disease/DiseaseList";
import EventsList from "./events/EventsList";
import SEOList from "./seo/SEOList";
import SliderImageList from "./sliderImages/SliderImageList";
import MissionArogyamWebSider from "./MissionArogyamWebSider";
import Error404 from "../../common/errors/Error404";
import Translations from "./translations/Translations";

const {Content} = Layout;


export default class MissionArogyamWebHome extends React.Component {

    render() {
        return (
            <Content
                className="main-container"
                style={{
                    // margin: '24px 16px',
                    // padding: 24,
                    minHeight: 280,
                    // marginLeft: '200px'
                }}
            >
                <Layout>
                    <MissionArogyamWebSider {...this.props} />
                    <Content
                    >
                        <Switch>
                            <Route path="/mission/videos" render={(route) => <VideosList />} />
                            <Route path="/mission/blog" render={(route) => <BlogList />} />
                            <Route path="/mission/contact" render={(route) => <ContactsList />} />
                            <Route path="/mission/disease" render={(route) => <DiseaseList />} />
                            <Route path="/mission/event" render={(route) => <EventsList />} />
                            <Route path="/mission/pageseo" render={(route) => <SEOList />} />
                            <Route path="/mission/slider-image" render={(route) => <SliderImageList />} />
                            <Route path="/mission/translations" render={(route) => <Translations />} />
                            <Route path="/mission" render={(route) => <VideosList />} />
                            <Route component={Error404} />
                        </Switch>
                    </Content>
                </Layout>
            </Content>
        )
    }
}
