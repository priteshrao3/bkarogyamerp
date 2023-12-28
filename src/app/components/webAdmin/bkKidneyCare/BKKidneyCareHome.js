import React from "react";
import {Layout} from "antd";
import {Route, Switch} from "react-router-dom";
import VideosList from "./videos/VideosList";
import BlogList from "./blog/BlogList";
import ContactsList from "./contacts/ContactsList";
import EventsList from "./events/EventsList";
import SEOList from "./seo/SEOList";
import SliderImageList from "./sliderImages/SliderImageList";
import FacilityList from "./facilities/FacilityList";
import LandingPageVideoList from "./landingPageVideos/LandingPageVideoList";
import LandingPageContentList from "./landingPageContent/LandingPageContentList";
import ManageProductList from "./manageProduct/ManageProductList";
import ManageTherapyList from "./manageTherapy/ManageTherapyList";
import BKKidneyCareSider from "./BKKidneyCareSider";
import Error404 from "../../common/errors/Error404";
import ManageOpeningsList from "./openings/ManageOpeningsList";
import Careers from "./careers/Careers";
import AppliedCandidates from "./openings/AppliedCandidates";
import DiseaseHome from './disease/DiseaseHome';
import MedicineConversionSettings from './medicine-conversion/MedicineConversionSettings';
import Translations from "./translations/Translations";

const {Content} = Layout;


export default class BKKidneyCareHome extends React.Component {

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
                    <BKKidneyCareSider {...this.props} />
                    <Content>
                        <Switch>
                            <Route path="/web/videos" render={(route) => <VideosList />} />
                            <Route path="/web/blog" render={(route) => <BlogList />} />
                            <Route path="/web/contact" render={(route) => <ContactsList />} />
                            <Route path="/web/disease" render={(route) => <DiseaseHome {...route}/>} />
                            <Route
                                path="/web/conversion"
                                render={(route) => (
                                    <MedicineConversionSettings
                                        {...this.state}
                                        {...this.props}
                                        {...route}
                                    />
                                )}
                            />
                            <Route path="/web/event" render={(route) => <EventsList />} />
                            <Route path="/web/pageseo" render={(route) => <SEOList />} />
                            <Route path="/web/slider-image" render={(route) => <SliderImageList />} />
                            <Route path="/web/facilities" render={(route) => <FacilityList />} />
                            <Route path="/web/landingpagevideo" render={(route) => <LandingPageVideoList />} />
                            <Route path="/web/landingpagecontent" render={(route) => <LandingPageContentList />} />
                            <Route path="/web/manageproduct" render={(route) => <ManageProductList />} />
                            <Route path="/web/managetherapy" render={(route) => <ManageTherapyList />} />
                            <Route path="/web/openings" render={(route) => <ManageOpeningsList />} />
                            <Route path="/web/applied" render={(route) => <AppliedCandidates />} />
                            <Route path="/web/careers" render={(route) => <Careers />} />
                            <Route path="/web/translations" render={(route) => <Translations />} />
                            <Route path="/web" render={(route) => <VideosList />} />

                            <Route component={Error404} />
                        </Switch>
                    </Content>
                </Layout>
            </Content>
        )
    }
}
