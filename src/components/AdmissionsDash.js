import 'date-fns';
import React from 'react';
// import { allStages} from '../config';
import { connect } from 'react-redux';
import DateFnsUtils from '@date-io/date-fns';
import MUIDataTable from "mui-datatables";
import ChevronRight from '@material-ui/icons/ChevronRight';
import { withStyles, MuiThemeProvider } from '@material-ui/core/styles';
import StageSelect from '../components/StageSelect';
import Button from '@material-ui/core/Button';
import Select from 'react-select';

import axios from 'axios';
import Box from '@material-ui/core/Box';

import { theme } from '../theme/theme';

import { changeFetching, setupUsers } from '../store/actions/auth';

import { withRouter } from 'react-router-dom';
import Moment from 'react-moment';

import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

import GlobalService from '../services/GlobalService';
import StudentService from '../services/StudentService';
import StageTransitions from './StageTransitions';
// import StudentDetails from './StudentDetails';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { EventEmitter } from './events';
import { allStages } from '../config';

import makeAnimated from 'react-select/animated';
const animatedComponents = makeAnimated();
// API USage : https://blog.logrocket.com/patterns-for-data-fetching-in-react-981ced7e5c56/
const baseURL = process.env.API_URL;
const allStagesOptions = Object.keys(allStages).map(x => { return { value: x, label: allStages[x] } });

const styles = theme => ({
  clear: {
    clear: 'both'
  }
})

let columns;
let filterFns = []

export class AdmissionsDash extends React.Component {

  constructor(props) {

    super(props);

    if (this.props.match.params.dataType) {
      this.dataType = this.props.match.params.dataType;
    } else {
      this.dataType = 'softwareCourse'
    }
    this.studentsURL = baseURL + 'students';
    this.usersURL = baseURL + 'users/getall';
    this.stage = null,
      this.value = null,
      this.loggedInUser = this.props.loggedInUser;

    this.state = {
      data: [],
      sData: undefined, //subsetData
    }

    EventEmitter.subscribe('stageChange', this.stageChangeEvent);
  }

  stageChangeEvent = (iData) => {
    const rowIds = this.state.data.map(x => x.id)
    const rowIndex = rowIds.indexOf(iData.rowData.id);
    // this.setState(({data}) => ({
    //   data: [
    //     ...data.slice(0,rowIndex),
    //     {
    //       ...data[rowIndex],
    //       stage: iData.selectedValue.value,
    //       stageTitle: iData.selectedValue.label
    //     },
    //     ...data.slice(rowIndex+1)
    //   ]
    // }))

    let dataElem = this.state.data[rowIndex];
    dataElem.stageTitle = iData.selectedValue.label;
    dataElem.stage = iData.selectedValue.value;

    let newData = this.state.data;
    newData[rowIndex] = dataElem;

    this.setState({ data: newData });
  }

  changeDataType = option => {
    this.dataType = option.value;
    this.stage = null;
    this.value = null;
    this.fetchStudents();
  }

  changeStudentStage = option => {
    this.value = { value: option.value, label: allStages[option.value] }
    this.stage = option.value;
    this.fetchStudents();
    this.dataType = 'softwareCourse';
  }

  changeFromDate = date => {
    this.fromDate = date;
    this.fetchStudents();
  }

  changeToDate = date => {
    this.toDate = date;
    this.fetchStudents();
  }

  handleChange = (field, filterFn) => {

    filterFns[field] = filterFn
    const fieldKeys = Object.keys(filterFns)

    let sData = this.state.data.filter((x) => {
      let result = true
      for (var key in filterFns) {
        result = result && filterFns[key](x)
      }
      return result
    })

    // sData [] and undefined are different
    // sData [] = when no results are returned
    // sData undefined = when all results are returned
    this.setState({
      sData: sData
    })

  }

  dataSetup = (data) => {
    // columns = StudentService.setupPre(StudentService.columns[this.dataType]);
    for (let i = 0; i < data.length; i++) {
      data[i] = StudentService.dConvert(data[i])
      // columns = StudentService.addOptions(columns, data[i]);
    }

    // columns = StudentService.setupPost(columns);

    this.setState({ 'data': data }, function () {
      this.props.fetchingFinish()
    })
  }

  render = () => {
    const { classes } = this.props;
    const cancelEdit = id => {
      const { data } = this.state;
      // if id is good, collapse row by removing it from expanded rows
      const index = data.findIndex(id);
      data.splice(index, 1);
      this.setState({ data });
    }

    // const columns = [
    //   // {
    //   //   name: "action",
    //   //   label: "Action",
    //   //   options: {
    //   //     filter: true,
    //   //     sort: true,
    //   //     customBodyRender: rowData => {
    //   //    return <StudentDetails
    //   //     details={rowData}/>

    //   //     }
    //   //   }
    //   // },
    //   {
    //     name: "id",
    //     label: "transitions",
    //     options: {
    //       filter: false,
    //       sort: false,
    //       customBodyRender: (value) => {
    //         return <StageTransitions
    //           studentId={value}
    //           dataType={this.dataType}
    //         />
    //       }
    //     },
    //   },
    //   {
    //     name: "SetName",
    //     label: "Set",
    //     options: {
    //       filter: true,
    //       sort: true,
    //       display: false
    //     }
    //   },
    //   {
    //     name: "name",
    //     label: "Name",
    //     options: {
    //       filter: true,
    //       sort: true,
    //     }
    //   },
    //   {
    //     name: "city",
    //     label: "City",
    //     options: {
    //       filter: true,
    //       sort: true,
    //       display: false
    //     }
    //   },
    //   {
    //     name: "state",
    //     label: "State",
    //     options: {
    //       filter: true,
    //       sort: true,
    //       display: false
    //     }
    //   },
    //   {
    //     name: "number",
    //     label: "Number",
    //     options: {
    //       filter: true,
    //       sort: true,
    //     }
    //   },
    //   {
    //     name: "marks",
    //     label: "Marks",
    //     options: {
    //       filter: true,
    //       sort: true,
    //     }
    //   },
    //   {
    //     name: "gender",
    //     label: "Gender",
    //     options: {
    //       filter: true,
    //       sort: true,

    //     }
    //   },
    //   {
    //     name: "stage",
    //     label: "Stage",
    //     options: {
    //       filter: true,
    //       sort: true,
    //       // customBodyRender: rowData => {
    //       //   return <StageSelect
    //       //      allStagesOptions={allStagesOptions}
    //       //   />
    //       // }

    //     }
    //   },
    //   {
    //     name: "createdAt",
    //     label: "Added At",
    //     options: {
    //       filter: true,
    //       sort: true,
    //       customBodyRender: (value) => {
    //         return <Moment format="D MMM YYYY" withTitle>{value}</Moment>
    //       }

    //     

    //   },

    //   {
    //     name: "lastUpdated",
    //     label: "Last Updated",
    //     options: {
    //       filter: true,
    //       sort: true,
    //       customBodyRender: (value) => {
    //         return <Moment format="D MMM YYYY" withTitle>{value}</Moment>
    //       }

    //     }
    //   },
    // ]
    const options = <Box>
      <Select
        className={"filterSelectGlobal"}
        value={this.dataType}
        onChange={this.changeDataType}
        options={[{ value: "requestCallback", label: "Request Callback" },
        { value: "softwareCourse", label: "Other Data" }]}
        placeholder={"Select Data Type"}
        isClearable={false}
        components={animatedComponents}
        closeMenuOnSelect={true}
      />
      <Select
        className={"filterSelectGlobal"}
        value={this.value}
        onChange={this.changeStudentStage}
        options={allStagesOptions}
        placeholder={"Get Student Details By Stage"}
        isClearable={false}
        components={animatedComponents}
        closeMenuOnSelect={true}
      />

      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          margin="dense"
          style={{ marginLeft: 16 }}
          value={this.fromDate}
          id="date-picker-dialog"
          label="From Date"
          format="MM/dd/yyyy"
          onChange={this.changeFromDate}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />

        <KeyboardDatePicker
          margin="dense"
          style={{ marginLeft: 16 }}
          value={this.toDate}
          id="date-picker-dialog"
          label="To Date"
          format="MM/dd/yyyy"
          onChange={this.changeToDate}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
      </MuiPickersUtilsProvider>
    </Box>;

    if (!this.state.data.length) {
      return options;
    }
    // let filterSelectRows = []
    // columns.map((x) => {
    //   if ('selectFilter' in x)
    //     filterSelectRows.push(
    //       <FilterSelect
    //         filter={{
    //           name: x.sfTitle,
    //           field: x.field
    //         }}
    //         ifMulti={x.sfMulti}
    //         key={x.field}
    //         options={x.options}
    //         handleChange={this.handleChange}
    //       />
    //     )
    // })
    return <Box>
      <MuiThemeProvider theme={theme}>
        {options}
        {/* {filterSelectRows} */}
        <div className={classes.clear}></div>
        <MUIDataTable
          columns={StudentService.columns[this.dataType]}
          data={this.state.sData ? this.state.sData : this.state.data}
          icons={GlobalService.tableIcons}
          // detailPanel={rowData => {
          //   return (
          //     <StageTransitions
          //       dataType={this.dataType}
          //       studentId={rowData.id}
          //     />
          //   )
          // }}
          // actions= {[
          //   {
          //     icon: 'Save',
          //     tooltip: 'Student Details',
          //     onClick: (event, rowData) => { return rowData }
          //   }
          // ]}
          // components={
          //   {
          //     Action: 
          //       props => (
          //         <StudentDetails
          //           details={props.data}/>
          //       )
          //   }
          // }
          options={
            {
              headerStyle: {
                color: theme.palette.primary.main
              },
              exportButton: true,
              pageSize: 100,
              showTitle: false,
              selectableRows: 'none',
              toolbar: false,
              filtering: true,
              filter: true,
              filterType: 'dropdown',
              responsive: 'stacked',
            }
          }
        />
      </MuiThemeProvider>
    </Box>
  }

  componentDidMount() {
    this.fetchStudents();
    this.fetchUsers();
  }

  // componentWillUnmount() {
  //   EventEmitter.unsubscribe('stageChange');
  // }

  async fetchUsers() {
    try {
      this.props.fetchingStart()
      const response = await axios.get(this.usersURL, {});
      this.props.usersSetup(response.data.data);
      this.props.fetchingFinish()
    } catch (e) {
      console.log(e)
      this.props.fetchingFinish()
    }
  }

  async fetchStudents() {
    try {
      this.props.fetchingStart()
      // response = ngFetch(this.studentsURL, 'GET', {
      //   params: {
      //     dataType: this.dataType,
      //     fromDate: this.fromDate,
      //     toDate: this.toDate
      //   }
      // }, true);

      const response = await axios.get(this.studentsURL, {
        params: {
          dataType: this.dataType,
          stage: this.stage,
          from: this.fromDate,
          to: this.toDate
        }
      });
      this.dataSetup(response.data.data)
    } catch (e) {
      console.log(e)
      this.props.fetchingFinish()
    }
  }
}

const mapStateToProps = (state) => ({
  loggedInUser: state.auth.loggedInUser,
  isAuthenticated: state.auth.isAuthenticated
});

const mapDispatchToProps = (dispatch) => ({
  fetchingStart: () => dispatch(changeFetching(true)),
  fetchingFinish: () => dispatch(changeFetching(false)),
  usersSetup: (users) => dispatch(setupUsers(users))
});

export default withRouter(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(AdmissionsDash)))
