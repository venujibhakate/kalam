import React from 'react';
import { allStages, feedbackableStages, feedbackableStagesData } from '../config';
import Moment from 'react-moment';
import Box from '@material-ui/core/Box';
import StageSelect from '../components/StageSelect';
import OwnerSelect from '../components/OwnerSelect';
import StatusSelect from '../components/StatusSelect'
import StudentFeedback from '../components/FeedbackPage';
import UpdateFeedback from '../components/UpdateFeedback';
import StageTransitions from '../components/StageTransitions';


const allStagesOptions = Object.keys(allStages).map(x => { return { value: x, label: allStages[x] } });

const stageColumnTransition = {
    name: "id",
    label: "transitions",
    options: {
      filter: false,
      sort: false,
      customBodyRender: (value) => {
        return <StageTransitions
          studentId={value}
          dataType={'softwareCourse'}
        />
      }
    }
}
  
const setColumn = {
    name: "SetName",
    label: "Set",
    options: {
      filter: true,
      sort: true,
      display: false
    }
  }

const nameColumn = {
    name: "name",
    label: "Name",
    options: {
      filter: true,
      sort: true,
    }
  }
  
const cityColumn = {
    name: "city",
    label: "City",
    options: {
      filter: true,
      sort: true,
      display: false
    }
  }

const stateColumn = {
    name: "state",
    label: "State",
    options: {
      filter: true,
      sort: true,
      display: false
    }
  }
  
const numberColumn = {
    name: "number",
    label: "Number",
    options: {
      filter: true,
      sort: true,
    }
  }
  
const marksColumn = {
    name: "marks",
    label: "Marks",
    options: {
      filter: true,
      sort: true,
    }
  }
  
const genderColumn = {
    name: "gender",
    label: "Gender",
    options: {
      filter: true,
      sort: true,
    }
  }
  
const stageColumn = {
    name: "stage",
    label: "Stage",
    options: {
      filter: true,
      sort: true,
      customBodyRender: rowData => {
        return <StageSelect
           allStagesOptions={allStagesOptions}
           rowData={rowData}
           studentId={rowData['id']}
        />
      }
    }
  }
  
const addedAtColumn = {
    name: "createdAt",
    label: "Added At",
    options: {
      filter: true,
      sort: true,
      customBodyRender: (value) => {
        return <Moment format="D MMM YYYY" withTitle>{value}</Moment>
      }
    }
  }

const lastUpdatedColumn = {
    name: "lastUpdated",
    label: "Last Updated",
    options: {
      filter: true,
      sort: true,
      customBodyRender: (value) => {
        return <Moment format="D MMM YYYY" withTitle>{value}</Moment>
      }

    }
  }

const StageColumnMyreport = {
  title: 'Stage',
  field: 'student_stage'
}

const feedbackColumnMyreport = {
  title: 'Feedback',
  field: 'feedback',
  render: rowData => {
    return rowData.feedback ? rowData['feedback'].split ('\n\n').map((item, i) => <p key={i}> {item} </p>) : null; 
  }
}

const stausColumnMyreport = {
  title: 'Status',
  field: 'state'
}

const ownerColumnMyreport = {
  title: 'Owner',
  field: 'toAssign'
}

const assignDateColumnMyreport = {
  title: 'AssignDate',
  field: 'createdAt',
  render: rowData => {
    return <Moment format="D MMM YYYY" withTitle>{rowData.createdAt}</Moment>
  }
}

const StageColumnDanglingReport = {
  title: 'Stage',
  field: 'stage'
}

const TotalFemaleDanglingReport = {
  title: 'Female',
  field: 'female'
}

const TotalmaleDanglingReport = {
  title: 'Male',
  field: 'male'
}

const TotalTransDanglingReport = {
  title: 'Transgender',
  field: 'transgender'
}

const TotalUnspecifiedDanglingReport = {
  title: 'Unspecified',
  field: 'unspecified'
}

const TotalDanglingReport = {
  title: 'Total Dangling',
  field: 'total'
}

const EmailColumn = {
  title: 'Email',
  field: 'email'
}

const QualificationColumn = {
  title: 'Qualification',
  field: 'qualification'
}

const ReligonColumn = {
  title: 'Religon',
  field: 'religon'
}

const CasteColumn = {
  title: 'Caste',
  field: 'caste'
}

const StudentService = {
  columns: {
    requestCallback: [
      numberColumn,
      addedAtColumn,
      lastUpdatedColumn,
    ],
    partnerDashboard: [
      setColumn,
      nameColumn,
      cityColumn,
      stateColumn,
      numberColumn,
      marksColumn,
      genderColumn,
      stageColumn,
      addedAtColumn,
      lastUpdatedColumn
    ],
    softwareCourse: [
      stageColumnTransition,
      setColumn,
      nameColumn,
      cityColumn,
      stateColumn,
      numberColumn,
      marksColumn,
      genderColumn,
      stageColumn,
      lastUpdatedColumn,
    ]
  },
  
  columnMyReports: [
    nameColumn,
    StageColumnMyreport,
    feedbackColumnMyreport,
    stausColumnMyreport,
    ownerColumnMyreport,
    assignDateColumnMyreport
  ],
  
  columnDanglingReports: [
    StageColumnDanglingReport,
    TotalFemaleDanglingReport,
    TotalmaleDanglingReport,
    TotalTransDanglingReport,
    TotalUnspecifiedDanglingReport,
    TotalDanglingReport
  ],
  
  columnStudentDetails: [
    EmailColumn,
    QualificationColumn,
    ReligonColumn,
    CasteColumn
  ],

  setupPre: (columns) => {
    return columns.map((x) => {
      if ('selectFilter' in x)
        x.options = []
      return x
    })
  },

  setupPost: (columns) => {
    return columns.map((x) => {
      if ('selectFilter' in x)
        x.options = x.options.map((x) => {
          return { label: x, value: x }
        })
      return x
    })
  },

  dConvert: (x) => {
    try {
      x.number = x['contacts'][0]['mobile'];
    } catch (e) {
      x.number = null;
    }

    x.gender = x.gender == 1 ? 'Female' : 'Male';
    x.stageTitle = allStages[x.stage];

    x.marks = x.enrolmentKey[0] ? parseInt(x.enrolmentKey[0].totalMarks, 10) : null;
    x.marks = isNaN(x.marks) ? null : x.marks;
    x.lastUpdated = x.lastTransition ? x.lastTransition.createdAt : null;
    return x
  },
  
  addOptions: (columns, dataRow) => {
    return columns.map((column) => {
      if ('selectFilter' in column) {
        if (column.options.indexOf(dataRow[column.field]) == -1) {
          column.options.push(dataRow[column.field])
        }
      }
      return column  
    })
  }
}

export default StudentService;