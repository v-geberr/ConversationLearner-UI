import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
class AppDashboard extends Component {
    render() {
        return (
            <div>
                <TrainingGroundArenaHeader title="Overview" description="Facts & statistics about the app's data at any period of time..."/>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(AppDashboard);
