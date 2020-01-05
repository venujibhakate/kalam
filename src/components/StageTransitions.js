import 'date-fns';
import React from 'react';
import { connect } from 'react-redux';
import { allStages, feedbackableStages, feedbackableStagesData } from '../config';
import MaterialTable from "material-table";
// import OwnerSelect from '../components/OwnerSelect';
import StudentFeedback from '../components/FeedbackPage';
import { withStyles } from '@material-ui/core/styles';
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

import { EventEmitter } from './events';

// API USage : https://blog.logrocket.com/patterns-for-data-fetching-in-react-981ced7e5c56/
const baseURL = process.env.API_URL;

const styles = theme => ({
  innerTable: {
    marginLeft: '3vw',
    marginRight: '3vw',
    width: '94vw',
    marginTop: '5',
    marginBottom: '5',
    [theme.breakpoints.up('md')]: {
      margin: 'auto',
      width: '80%',
      marginTop: 5,
      marginBottom: 5
    },
  },
  clear: {
    clear: 'both'
  }
})
export class Transition extends React.Component {

  constructor(props) {
    super(props);
    this.transitionURL = `${baseURL}students/transitionsWithFeedback/${this.props.studentId}`;
    this.state = {
      data: [],
    }
    EventEmitter.subscribe('transitionsChange' + this.props.studentId, this.transitionsChangeEvent);
  }

  transitionsChangeEvent = () => {
    this.fetchtransition();
  }

  async fetchtransition() {
    try {
      this.props.fetchingStart()
      const response = await axios.get(this.transitionURL, {});
      // console.log(response.data.data)
      const newData = response.data.data.map(v => ({ ...v, loggedInUser: this.props.loggedInUser }))
      this.setState({
        data: newData
      }, this.props.fetchingFinish)
    } catch (e) {
      console.log(e)
      this.props.fetchingFinish()
    }
  }

  componentDidMount() {
    this.fetchtransition();
  }

  componentWillUnmount() {
    EventEmitter.unsubscribe('transitionsChange' + this.props.studentId);
  }

  render = () => {
    const { classes } = this.props;
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
          sort: false,
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
          sort: false,
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
              
              {/* <StageSelect
                allStagesOptions={allStagesOptions}
                studentId={obj}
                rowData={obj}
              /> */}

            </div>
            
            


            }
          

        }
      },
      {
        name: "toStage",
        label: "Owner",
        options: {
          filter: true,
          sort: false,

          customBodyRender: (value) => {
           

            const valu = this.state.data.filter(valu => valu.toStage === value)[0];
            console.log(valu,"venu")
            const ifExistingFeedback = valu.feedback && feedbackableStages.indexOf(valu.toStage) > -1;
            return <div>
            {
            ifExistingFeedback ?
            <OwnerSelect rowData={valu} />
              
              :null

          
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
          sort: false,
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
          sort: false,
          customBodyRender: (rowData) => {
            const valu = this.state.data.filter(valu => valu.toStage === rowData)[0];
          if (valu['feedback']) {
            const allstatus = feedbackableStagesData[valu['feedback']['student_stage']].status;
            const allStatusOptions = allstatus.map(x => { return {value: x, label: (x.charAt(0).toUpperCase()+x.slice(1)).match(/[A-Z][a-z]+/g).join(" ")} });
            const state = valu['feedback']['state'];
            const status = allstatus[allstatus.indexOf(state)];
            if (status) {
              valu['statusTitle'] = (status.charAt(0).toUpperCase()+status.slice(1)).match(/[A-Z][a-z]+|[0-9]+/g).join(" ")
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
    ];

    return <Box className={classes.innerTable} my={2}>
      <MUIDataTable
        columns={columns}
        data={this.state.data}
        icons={GlobalService.tableIcons}

        options={{
          search: false,
          paging: false,
          toolbar: false,
          showTitle: false,
          headerStyle: {
            color: theme.palette.primary.main,
            zIndex: 0
          },
        }}
      />
    </Box>
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