import 'date-fns';
import React from 'react';
import {
  createMuiTheme,
  MuiThemeProvider,
  withStyles
} from "@material-ui/core/styles";

import {
  Modal, Button
} from '@material-ui/core';

import { connect } from 'react-redux';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import AssessmentIcon from '@material-ui/icons/Assessment';
import { allStages, feedbackableStages, feedbackableStagesData } from '../config';

import MaterialTable from "material-table";
// import OwnerSelect from '../components/OwnerSelect';
import StudentFeedback from '../components/FeedbackPage';
// import { withStyles } from '@material-ui/core/styles';
import StatusSelect from '../components/StatusSelect'
import axios from 'axios';
import StageSelect from '../components/StageSelect';
import UpdateFeedback from '../components/UpdateFeedback';
import OwnerSelect from '../components/OwnerSelect';
import Moment from 'react-moment';
import Box from '@material-ui/core/Box';
import MUIDataTable from "mui-datatables";
import { theme } from '../theme/theme';
import { changeFetching } from '../store/actions/auth';
import { withRouter } from 'react-router-dom';

import GlobalService from '../services/GlobalService';
import StudentService from '../services/StudentService';
// import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { EventEmitter } from './events';

// API USage : https://blog.logrocket.com/patterns-for-data-fetching-in-react-981ced7e5c56/
const baseURL = process.env.API_URL;

function getModalStyle() {
  const top = 50 // + rand()
  const left = 50 //+ rand()

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    overflowY: 'scroll',
    maxHeight: '90vh',
    width: "90%"
  };
}

const styles = theme => ({
  paper: {
    position: 'absolute',
    marginLeft: '3vw',
    marginRight: '3vw',
    width: '94vw',
    [theme.breakpoints.up('md')]: {
      margin: 'auto',
      width: '50%'
    },
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none',
  },
})

export class Transition extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      modalOpen: false,
    }
    EventEmitter.subscribe('transitionsChange' + this.props.studentId, this.transitionsChangeEvent);
  }

  transitionsChangeEvent = () => {
    this.fetchtransition();
  }

  async fetchtransition() {
    try {
      this.transitionURL = `${baseURL}students/transitionsWithFeedback/${this.props.studentId}`;
      this.props.fetchingStart()
      const response = await axios.get(this.transitionURL, {});
      const newData = response.data.data.map(v => ({ ...v, loggedInUser: this.props.loggedInUser }))
      this.setState({
        data: newData
      }, this.props.fetchingFinish)
    } catch (e) {
      console.log(e)
      this.props.fetchingFinish()
    }
  }

  handleClose = () => {
    this.setState({
      modalOpen: false
    })
  };

  handleOpen = () => {
    this.fetchtransition();
    this.setState({
      modalOpen: true
    })
  };

  componentWillUnmount() {
    EventEmitter.unsubscribe('transitionsChange' + this.props.studentId);
  }

  render = () => {
    const { classes } = this.props;
    const modalStyle = getModalStyle()
    const allStagesOptions = Object.keys(allStages).map(x => { return { value: x, label: allStages[x] } });
    const columns = [
      {
        name: "toStage",
        label: "Stage",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => {
            return allStages[value];
          }
        }
      },
      {
        name: "createdAt",
        label: "When?",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => {
            return <Moment format="D MMM YYYY" withTitle>{value}</Moment>
          }
        },
      },

      {
        name: "toStage",
        label: "Feedback",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (rowData) => {
            const obj = this.state.data.filter(obj => obj.toStage === rowData)[0];

            const ifExistingFeedback = obj.feedback && feedbackableStages.indexOf(obj.toStage) > -1;
            return <div>
              {
                ifExistingFeedback ?
                  <div>
                    <UpdateFeedback
                      rowData={obj}
                      student_stage={obj.toStage}
                      studentId={obj.studentId}
                      userId={obj.loggedInUser.id}
                      user={'@' + obj.loggedInUser.user_name.toString().split("/ ").join('').toLowerCase()}
                      feedback={obj.feedback.feedback}
                    />
                    {obj.feedback.feedback.split('\n\n').map((item, i) => <p key={i}> {item} </p>)}
                  </div>
                  : null
              }
              {
                feedbackableStages.indexOf(obj.toStage) > -1 && !ifExistingFeedback ?
                  <StudentFeedback
                    rowData={obj}
                    user={'@' + obj.loggedInUser.user_name.toString().split("/ ").join('').toLowerCase()}
                    stage={obj.toStage}
                    studentId={obj.studentId}
                    userId={obj.loggedInUser.id}
                  />
                  : null
              }
            </div>
          }
        }
      },
      {
        name: "toStage",
        label: "Owner",
        options: {
          filter: true,
          sort: true,
          display: true,
          customBodyRender: (value) => {
            const valu = this.state.data.filter(valu => valu.toStage === value)[0];
            // console.log(valu, "venu")
            const ifExistingFeedback = valu.feedback || feedbackableStages.indexOf(valu.toStage) > -1;
            return <div>
              {
                ifExistingFeedback ?
                  <OwnerSelect rowData={valu} />

                  : null
              }
            </div>
          }
        }
      },
      {
        name: "createdAt",
        label: "Time",
        options: {
          filter: true,
          sort: true,
          display: true,
          customBodyRender: (rowData) => {
            return rowData ? <Moment format="D MMM YYYY" withTitle>{rowData}</Moment> : null;

          }
        }
      },
      {
        name: "toStage",
        label: "status",
        options: {
          filter: true,
          sort: true,
          display: true,
          customBodyRender: (rowData) => {
            const valu = this.state.data.filter(valu => valu.toStage === rowData)[0];
            if (valu['feedback']) {


              const allstatus = feedbackableStagesData[valu['feedback']['student_stage']].status;
              const allStatusOptions = allstatus.map(x => { return { value: x, label: (x.charAt(0).toUpperCase() + x.slice(1)).match(/[A-Z][a-z]+/g).join(" ") } });
              const state = valu['feedback']['state'];
              const status = allstatus[allstatus.indexOf(state)];

              if (status) {
                valu['statusTitle'] = (status.charAt(0).toUpperCase() + status.slice(1)).match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
              }

              return <div>
                <StatusSelect
                  allStatusOptions={allStatusOptions}
                  studentId={valu['feedback'].studentId}
                  rowData={valu}
                />

              </div>

            }
            return null;
          }
        }
      },
      {
        name: "toStage",
        label: "Deadline",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => {
            const valu = this.state.data.filter(valu => valu.toStage === value)[0];
            const ifExistingDeadlineDate = (valu.feedback && valu.feedback.deadlineAt) && (!valu.feedback.finishedAt || !valu.feedback.feedback);
            if (ifExistingDeadlineDate) {
              const deadline = feedbackableStagesData[valu['feedback']['student_stage']].deadline;
              const diff = new Date().getTime() - new Date(valu.feedback.deadlineAt).getTime()
              const hours = Math.floor(diff / 1000 / 60 / 60);
              const remainigTime = deadline - hours;
              if (remainigTime < 0) {
                return "Your deadline is fineshed please do this work ASAP."
              } else if (!valu.feedback.feedback) {
                return <p> <b>{remainigTime}</b> Hours are remaing to do this work please do it ASAP </p>
              }
              return <p> <b>{remainigTime}</b> Hours are remaing to do this work please do it ASAP </p>
            }
          }

        }
      },
      {
        name: "toStage",
        label: "Finished",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => {
            const valu = this.state.data.filter(valu => valu.toStage === value)[0];
            const ifExistingFinishedDate = valu.feedback && (valu.feedback.finishedAt && valu.feedback.feedback);
            return ifExistingFinishedDate ? <Moment format="D MMM YYYY" withTitle>{valu.feedback.finishedAt}</Moment> : null;
          },
        }

      },
    ];

    return !this.state.modalOpen ? <div>
      <Button color="primary" align="right" onClick={this.handleOpen}>
        <ChevronRightIcon color="primary" />&nbsp;&nbsp;
    </Button>
    </div> :
      <Modal
        open={this.state.modalOpen}
        onClose={this.handleClose}
      >

        <Box style={modalStyle} className={classes.paper}>
          <MUIDataTable
            columns={columns}
            data={this.state.data}
            icons={GlobalService.tableIcons}
            options={{
              search: false,
              selectableRows: 'none',
              paging: false,
              toolbar: false,
              showTitle: false,
              filter: true,
              filterType: "dropdown",
              responsive: "stacked",
              headerStyle: {
                color: theme.palette.primary.main,
                zIndex: 0
              },
            }}

          />
        </Box>
      </Modal>
  }
}

const mapStateToProps = (state) => ({
  loggedInUser: state.auth.loggedInUser
});

const mapDispatchToProps = (dispatch) => ({
  fetchingStart: () => dispatch(changeFetching(true)),
  fetchingFinish: () => dispatch(changeFetching(false)),
});

export default withRouter(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Transition)))