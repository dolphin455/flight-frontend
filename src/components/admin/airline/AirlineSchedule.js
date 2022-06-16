import React, { Component, Fragment } from "react";
import { Form, Button, Modal, Col, Image, ButtonGroup, ToggleButton } from 'react-bootstrap'
import AirlineService from '../../../services/AirlineService'
import AirportService from "../../../services/AirportService";
import { toastSuccess, toastError, toastWarn } from "../../../utilities/toaster";
import { ToastContainer } from "react-toastify";
import './Airline.css'
import Swal from 'sweetalert2'
import { checkAuth } from "../../../utilities/checkAuth";
import { withRouter } from "../../WithRouter";

class AirlineSchedule extends Component {
    constructor(props) {
        super(props)
        this.airlineService = new AirlineService
        this.airportService = new AirportService
        this.state = {
            schedules: [],
            show: false,
            editmode: false,
            airports: [],
            airlines: [],
            optionTo: [],
            fSchedule: {}
        }
        this.schedule = {}
    }

    componentDidMount () {
        this.getSchedules()
        this.getAirports()
        this.getAirlines()
    }

    getSchedules = () => {
        this.airlineService.getScheduleList().then((resp) => {
            this.setState({
                schedules: [ ...resp ]
            })
        })
    }

    getAirlines = () => {
        this.airlineService.getActiveAirlines().then((resp) => {
            this.setState({ airlines: [ ...resp ] })
        })
    }

    getAirports = () => {
        this.airportService.getList("?query="+1).then(resp => {
            this.setState({ airports: [ ...resp ] })
        })
    }

    handleClose = () => this.setState({ show: false });

    addNewSchedule = () => {
        this.setState({
            fSchedule: {status: 1},
            show: true,
            editmode: false
        })
    }

    checkFlight = () => {
        const data = this.state.fSchedule
        let isValid = true
        if (data.airlineId == undefined || data.airlineId == 0 || data.airlineId == "") {
            toastError("Select an Airline")
            isValid = false
        } else if(data.flightNumber == undefined || data.flightNumber == "") {
            toastError("Enter the Flight Number")
            isValid = false
        } else if (data.totalSeats == undefined || data.totalSeats == "" || data.totalSeats == 0) {
            toastError("Enter Total Seats")
            isValid = false
        } else if (data.departFrom == undefined || data.departFrom == "" || data.departFrom == 0) {
            toastError("Select From")
            isValid = false
        } else if (data.arrivalTo == undefined || data.arrivalTo == "" || data.arrivalTo == 0) {
            toastError("Select To")
            isValid = false
        } else if (data.departure == undefined || data.departure == "") {
            toastError("Enter Departure Date")
            isValid = false
        } else if (data.arrival == undefined || data.arrival == "") {
            toastError("Enter Arrival Date")
            isValid = false
        } else if (data.fareOne == undefined || data.fareOne == "") {
            toastError("Enter Adults Fare")
            isValid = false
        } else if (data.fareTwo == undefined || data.fareTwo == "") {
            toastError("Enter Childs Fare")
            isValid = false
        } else if (data.fareThree == undefined || data.fareThree == "") {
            toastError("Enter Infants Fare")
            isValid = false
        }
        return isValid
    }

    saveSeats = (params) => {
        return this.airlineService.saveSeats(params).then((response) => response)
    }
    
    saveSchedule = (e) => {
        e.preventDefault()
        if (this.checkFlight()) {
            let params = this.state.fSchedule
            let departure = params.departure.split('T')
            let arrival = params.arrival.split("T")
            params.departureDate = departure[0]
            params.departTime = departure[1]
            params.arrivalDate = arrival[0]
            params.arrivalTime = arrival[1]
            this.airlineService.saveSchedule(params).then(async (resp) => {
                let schedule = await this.saveSeats({ scheduleId: resp.id, totalSeats: params.totalSeats, remainingSeats: params.availSeats })
                toastSuccess("New Flight Schedule added Successfully")
                let schedules = [...this.state.schedules, schedule]
                this.setState({ ...this.state, show: false, editmode: false, schedules })
            })
        }
    }

    updateSeats = (params) => {
        return this.airlineService.updateSeats(params).then(resp => resp)
    }

    updateSchedule = (e) => {
        e.preventDefault()
        if (this.checkFlight()) {
            let params = this.state.fSchedule
            delete params.airlines
            let departure = params.departure.split('T')
            let arrival = params.arrival.split("T")
            params.departureDate = departure[0]
            params.departTime = departure[1]
            params.arrivalDate = arrival[0]
            params.arrivalTime = arrival[1]
            this.airlineService.updateSchedule(params).then(async (resp) => {
                let schedule = await this.updateSeats({ scheduleId: resp.id, totalSeats: params.totalSeats, remainingSeats: params.availSeats})
                toastSuccess("Flight schedule updated")
                let schedules = [...this.state.schedules]
                let index = schedules.findIndex(sch => sch.id === resp.id)
                if (index !== -1) {
                    schedules[index] = { ...schedule }
                    this.setState({ schedules })
                }
                this.setState({ show: false, editmode: false, schedules })
            })
        }
    }

    handleChange = async (e) => {
        if (e.target.id === "totalSeats") {
            if (this.state.editmode) {
                let seat = Number(e.target.value)
                let totSeat = Number(this.schedule.seat.totalSeats)
                let remainSeat = Number(this.schedule.seat.remainingSeats)
                let updatedSeat = 0
                if (seat == totSeat) {
                    updatedSeat = remainSeat
                } else if (seat > totSeat) {
                    updatedSeat = remainSeat + seat - totSeat
                } else {
                    updatedSeat = remainSeat - totSeat - seat   
                }
                this.setState({
                    fSchedule: { ...this.state.fSchedule, totalSeats: Number(seat), availSeats: updatedSeat }
                })
            } else {
                this.setState({
                    fSchedule: { 
                        ...this.state.fSchedule, 
                        totalSeats: Number(e.target.value), 
                        availSeats: Number(e.target.value) 
                    }
                })
            }
        } else {
            this.setState({
                fSchedule: {
                    ...this.state.fSchedule,
                    [e.target.id]: e.target.value
                }
            })
        }
    }

    generateTo = (e) => {
        let filteredAirports = this.state.airports.filter(air => air.id != e.target.value)
        let toOptn = filteredAirports.map((a, i) => (
            <option value={a.id} key={i}>{a.name}</option>
        ))
        this.setState({ optionTo: [ ...toOptn ] })
        this.handleChange(e)
    }

    toggleStatus = (row, status) => {
        if (status !== row.status) {
            let param = row
            param.status = status
            this.airlineService.updateScheduleStatus(param).then(async (resp) => {
                if(resp) {
                    let index = this.state.schedules.findIndex((item) => item.id == row.id)
                    if (index !== -1) {
                        let tempFlights = [...this.state.schedules]
                        tempFlights[index].status = param.status
                        this.setState({
                            ...this.state,
                            schedules: [ ...tempFlights ]
                        })
                        status === 1 ? toastSuccess("Schedule Unblocked") : toastWarn("Schedule Blocked")
                    }
                }
            })
        }
    }

    formatDate = (record, tag, type) => {
        let obj = {}
        if (type == 'date') {
            obj = { ...obj, year: 'numeric', month: 'numeric', day: 'numeric'}
        } else {
            obj = {...obj, hour: "2-digit", minute: "2-digit"}
        }
        let date = tag == "departure" ? record[tag+'Date'] + 'T' + record['departTime'] : record[tag+'Date'] + 'T' + record[tag+'Time']
        return new Date(date).toLocaleString([], obj)
    }

    openEditModal = (record) => {
        let params = record
        this.schedule = record
        params.departure = params.departureDate + 'T' + params.departTime
        params.arrival = params.arrivalDate + 'T' + params.arrivalTime
        let { totalSeats, remainingSeats } = record.seat
        this.setState({ fSchedule: { ...params, totalSeats: totalSeats, availSeats: remainingSeats } }, () => {
            this.setState({ editmode: true, show: true })
            let filteredAirports = this.state.airports.filter(air => air.name !== record.from)
            let toOptn = filteredAirports.map((a, i) => (
                <option value={a.id} key={i}>{a.name}</option>
            ))
            this.setState({ optionTo: [ ...toOptn ] })
        })
        console.log(this.schedule)
    }

    deleteSchedule = (row) => {
        this.airlineService.deleteSchedule(row).then((resp) => {
            let schedules = [ ...this.state.schedules ]
            let index = schedules.findIndex(sch => sch.id == row.id)
            if (index !== -1) {
                schedules.splice(index, 1)
            }
            toastError(`Schedule has been deleted`)
            this.setState({ schedules })
        })
    }

    openDeleteModal = (row) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteSchedule(row)
            }
        })
    }

    render() {
        if (!checkAuth()) {
            this.props.navigate('/admin')
        }
        const { schedules, show, editmode, airlines, airports, optionTo, fSchedule } = this.state

        const airlineOptn = airlines.map((airline, index) => (
            <option value={airline.id} key={index}> { airline.name } </option>
        ))

        const airportOptn = airports.map((airport, index) => (
            <option value={airport.id} key={index}>{airport.name}</option>
        ))

        return (
            <Fragment>
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Schedule List</h3>
                                <div className="card-tools">
                                    <div className="input-group input-group-sm" style={{ width: 174 }}>
                                        <Button variant='primary' onClick={this.addNewSchedule}>Add A new Schedule</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="card-body table-responsive p-0">
                                <table className="table table-hover text-nowrap">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Logo</th>
                                            <th>Airline Name</th>
                                            <th>Flight Details</th>
                                            <th>From</th>
                                            <th>To</th>
                                            <th>Fares</th>
                                            <th>Block</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedules && schedules.map((item, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <Image src={ process.env.REACT_APP_IMAGE_URL + item.airline.logo } style={{width: '62px'}} />
                                                    </td>
                                                    <td>{item.airline.name}</td>
                                                    <td>
                                                        <span>No. - {item.flightNumber}</span><br />
                                                        <span>Seats - {item.seat.totalSeats }</span><br />
                                                        {/* <span>Seats - {item.seat.totalSeats }</span> */}
                                                    </td>
                                                    <td>
                                                        <span>{item.deptFrom.name}</span><br />
                                                        <span>{this.formatDate(item, 'departure', 'date')}</span><br />
                                                        <span>{this.formatDate(item, 'departure', 'time')}</span>
                                                    </td>
                                                    <td>
                                                        <span>{item.arrvlTo.name}</span><br />
                                                        <span>{this.formatDate(item, 'arrival', 'date') }</span><br />
                                                        <span>{this.formatDate(item, 'arrival', 'time') }</span>
                                                    </td>
                                                    <td>
                                                        <span>Adults</span> &#8211; <span>&#8377;{item.fareOne}</span><br />
                                                        <span>Childs</span> &#8211; <span>&#8377;{item.fareTwo}</span><br />
                                                        <span>Infants</span> &#8211; <span>&#8377;{item.fareThree}</span>
                                                    </td>
                                                    <td>
                                                    <ButtonGroup className='mb-2'>
                                                        <ToggleButton 
                                                        key={index} 
                                                        className="status_toggle btn btn-sm"
                                                        id={'radio-one-' + index}
                                                        type='radio' 
                                                        variant='outline-success'
                                                        name={`toggle-radio-one-${index}`}
                                                        value={1}
                                                        onChange={() => this.toggleStatus(item, 1)}
                                                        checked={item.status == 1}
                                                        >Unblock</ToggleButton>
                                                    </ButtonGroup>
                                                    &nbsp;&nbsp;
                                                    <ButtonGroup className='mb-2'>
                                                        <ToggleButton 
                                                        key={index + 1} 
                                                        className="status_toggle btn btn-sm"
                                                        id={`radio-two-${index}`}
                                                        type='radio' 
                                                        variant='outline-danger'
                                                        name={`toggle-radio-two-${index}`}
                                                        value={0}
                                                        onChange={() => this.toggleStatus(item, 0)}
                                                        checked={item.status == 0}
                                                        >Block</ToggleButton>
                                                    </ButtonGroup>
                                                    </td>
                                                    <td>
                                                        <a href="#" data-toggle="tooltip" data-placement="top" title="Edit" onClick={() => this.openEditModal(item)}><i className="far fa-edit" style={{ cursor: 'pointer' }}></i></a>

                                                        <a href="#" data-toggle="tooltip" data-placement="top" title="Delete" onClick={() => this.openDeleteModal(item)}><i className="far fa-trash-alt" style={{ color: "red" }}></i></a>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                        }
                                    </tbody>
                                </table>
                                <Modal show={show} onHide={this.handleClose}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>{editmode ? 'Update a Flight Schedule' : 'Add a new Flight Schedule'}</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form>
                                            <Form.Row>
                                                <Form.Group as={Col} className="mb-2" controlId="airlineId" >
                                                    <Form.Label>Airlines</Form.Label>
                                                    <Form.Control as={'select'} value={fSchedule.airlineId} onChange={this.handleChange}>
                                                        <option value={""}>Select Airline</option>
                                                        { airlineOptn }
                                                    </Form.Control>
                                                </Form.Group>
                                                <Form.Group as={Col} className="mb-2" controlId="flightNumber">
                                                    <Form.Label>Flight No.</Form.Label>
                                                    <Form.Control type="text" placeholder="Enter Flight no." value={fSchedule.flightNumber} onChange={this.handleChange}/>
                                                </Form.Group>
                                            </Form.Row>

                                            <Form.Row>
                                                <Form.Group as={Col} className="mb-2" controlId="totalSeats">
                                                    <Form.Label>Total Seats</Form.Label>
                                                    <Form.Control type="number" placeholder="Enter Total Seats" value={fSchedule.totalSeats} onChange={this.handleChange} />
                                                </Form.Group>

                                                <Form.Group as={Col} className="mb-2" controlId="availSeats">
                                                    <Form.Label>Reamaining Seats</Form.Label>
                                                    <Form.Control type="number" value={fSchedule.availSeats} onChange={this.handleChange} readOnly />
                                                </Form.Group>
                                            </Form.Row>

                                            <Form.Row>
                                                <Form.Group as={Col} controlId="departFrom">
                                                <Form.Label>From</Form.Label>
                                                    <Form.Control as={'select'} value={fSchedule.departFrom} onChange={(e) => { this.generateTo(e); this.handleChange(e) }}>
                                                        <option value={""}>Select Airport</option>
                                                        { airportOptn }
                                                    </Form.Control>
                                                </Form.Group>

                                                <Form.Group as={Col} controlId="arrivalTo">
                                                <Form.Label>To</Form.Label>
                                                    <Form.Control as={'select'} value={fSchedule.arrivalTo} onChange={this.handleChange}>
                                                        <option value={""}>Select Airport</option>
                                                        { optionTo }
                                                    </Form.Control>
                                                </Form.Group>
                                            </Form.Row>
                                            <Form.Row>
                                                <Form.Group as={Col} className="mb-2" controlId="departure">
                                                    <Form.Label>Departure Time</Form.Label>
                                                    <Form.Control size="sm" type="datetime-local" placeholder="Enter Date" value={fSchedule.departure} onChange={this.handleChange}/>
                                                </Form.Group>
                                                <Form.Group as={Col} className="mb-2" controlId="arrival">
                                                    <Form.Label>Arrival Time</Form.Label>
                                                    <Form.Control size="sm" type="datetime-local" placeholder="Enter Date" value={fSchedule.arrival} onChange={this.handleChange}/>
                                                </Form.Group>
                                            </Form.Row>

                                            <Form.Label>Fares</Form.Label>
                                            <Form.Row>
                                                <Form.Group as={Col} className="mb-2" controlId="pass_one">
                                                    <Form.Control type="text" value="Fare of Adults" readOnly />
                                                </Form.Group>
                                                <Form.Group as={Col} className="mb-2" controlId="fareOne">
                                                    <Form.Control type="number" placeholder="Enter Fare" value={fSchedule.fareOne} onChange={this.handleChange}/>
                                                </Form.Group>
                                               
                                            </Form.Row>
                                            <br />
                                            <Form.Row>
                                                <Form.Group as={Col} className="mb-2" controlId="pass_two">
                                                    <Form.Control type="text" value="Fare of Childs" readOnly />
                                                </Form.Group>
                                                <Form.Group as={Col} className="mb-2" controlId="fareTwo">
                                                    <Form.Control type="number" placeholder="Enter Fare" value={fSchedule.fareTwo} onChange={this.handleChange}/>
                                                </Form.Group>
                                            </Form.Row>
                                            <br />
                                            <Form.Row>
                                                <Form.Group as={Col} className="mb-2" controlId="pass_three">
                                                    <Form.Control type="text" value="Fare of Infants" readOnly />
                                                </Form.Group>                                            
                                                <Form.Group as={Col} className="mb-2" controlId="fareThree">
                                                    <Form.Control type="number" placeholder="Enter Fare" value={fSchedule.fareThree} onChange={this.handleChange}/>
                                                </Form.Group>
                                            </Form.Row>
                                        </Form>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={this.handleClose}>
                                            Close
                                        </Button>
                                       {(() => {
                                           if (editmode) {
                                               return (
                                                <Button variant='primary' onClick={this.updateSchedule}>
                                                    Update Airline
                                                </Button>
                                               )
                                           } else {
                                               return (
                                                <Button variant='primary' onClick={this.saveSchedule}>
                                                    Add Airline
                                                </Button>
                                               )
                                           }
                                       })()}
                                    </Modal.Footer>
                                </Modal>
                            </div>
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </Fragment>
        )
    }
}

export default withRouter(AirlineSchedule)