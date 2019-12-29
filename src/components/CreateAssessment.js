import React, { Fragment } from 'react';
import axios from 'axios';
import AddBox from '@material-ui/icons/AddBox';
import {Box} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Dialog, DialogTitle, DialogContent,DialogContentText, DialogActions } from '@material-ui/core';
import Spinner from 'react-spinner-material';

const baseUrl = process.env.BASE_API_URL;

export class CreateAssessment extends React.Component {

  constructor(props) {
    super(props);
    this.dataURL = baseUrl + 'partners/'+this.props.partnerId+'/assessments';
    this.partnerName = this.props.partnerName;
    this.state = {
      dialogOpen: false,
      inputValue: '',
      loading: false
    }
  }

  createAssessment2 = async () => {
    await this.handleClose()
    await this.setState({
      loading:true,
    })
    this.createAssessment();
  }

  async createAssessment() {   
    try {
      await axios.post(this.dataURL, {
        "name": this.state.inputValue
      }).then(response => {
        this.setState({
          loading:false
        })
        alert("Assessment Created", response);
      })
    } catch (e) {
      alert(e);
    }
  }

  handleClose = () => {
    this.setState({
      dialogOpen: false
    })
  };


  handleOpen = () => {
    this.setState({
      dialogOpen: true
    })
  }

  onChangeEvent = (e) => {
    this.setState({
      inputValue: e.target.value
    })
  }

  render = () => {
    const { loading } = this.state
    return <Fragment>
      <Box onClick={this.handleOpen}>
      <AddBox/>
      <Spinner size={35} spinnerColor={"#ed343d"} spinnerWidth={5} visible={loading} />
    </Box>
    <Dialog
    open={this.state.dialogOpen}
    onClose={this.handleClose}
    >
      <DialogTitle id="form-dialog-title">
        Create New Assessment
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please fill out the paper set name
        </DialogContentText>
        <form>
          <TextField
            label="Paper set name"
            value={this.state.inputValue}
            placeholder= "Set A"
            onChange = {this.onChangeEvent}
            margin="normal"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button color='primary' variant="contained" onClick={this.createAssessment2}>
              CREATE
        </Button>
      </DialogActions>
    </Dialog>
   </Fragment>
  }
}

export default CreateAssessment;