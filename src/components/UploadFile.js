import React from 'react';
import UploadIcon from '@material-ui/icons/CloudUpload';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { connect } from 'react-redux';
import { changeFetching } from '../store/actions/auth';

import axios from 'axios';

export class UploadFile extends React.Component {
  constructor(props) {
    super(props)
    // this.dataURL = 'http://join.navgurukul.org/api/partners/'+this.props.partnerId+'/assessments/'+this.props.assessmentId+'/attempts'
    this.dataURL = 'http://join.navgurukul.org/api/general/upload_file/answerCSV'
    this.state = {
    }
  }

  triggerInputFile = () => {
    this.uploadInput.click()
    this.handleUpload();
  }

  async handleUpload () {
    try {
      this.props.fetchingStart()

      const data = new FormData();
      // data.append('file', this.uploadInput.files[0]);
      // data.append('filename', this.fileName.value);
      
      const response = await axios.post(this.dataURL, {
        "file": this.uploadInput.files[0]
      })

      console.log(response.data)
      this.props.fetchingFinish()
    } catch (e) {
      console.log(e);
      this.props.fetchingFinish()
    }
  }

  render = () => {
    return <form color="primary" align="right">
        <UploadIcon color="primary"/>&nbsp;
        
        <input
          ref={(ref) => { this.uploadInput = ref;}}
          type="file"
          style={{display:"hidden"}}
        />

        <button onClick={this.triggerInputFile}>
          <Typography variant="subtitle1" color="primary">
            Upload
          </Typography>          
        </button>

      </form>
  }
}

const mapDispatchToProps = (dispatch)=>({
  fetchingStart: () => dispatch(changeFetching(true)),
  fetchingFinish: () => dispatch(changeFetching(false))
});

export default connect(undefined, mapDispatchToProps)(UploadFile);