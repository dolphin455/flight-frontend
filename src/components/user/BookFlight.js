import React, { Component } from 'react'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import AirportService from '../../services/AirportService'
import BookService from '../../services/BookingService'
import Popover from '@mui/material/Popover'
import Typography from '@mui/material/Typography'
import { toastError } from '../../utilities/toaster'
import { ToastContainer } from 'react-toastify'
import { Button, Image } from 'react-bootstrap'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import AirlineService from '../../services/AirlineService'
import BookModal from './BookModal'
import Swal from 'sweetalert2'
import { withRouter } from '../WithRouter'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons'

class BookFlight extends Component {
    constructor(props) {
        super(props)
        this.state = {
            airports: [],
            anchorEl: null,
            airlines: [],
            travellers: 1,
            showResult: false,
            flightsOne: [],
            flightsTwo: [],
            today: '',
            query: {
                type: 1,
                tripType: 1,
                adult: 1, child: 0, infant: 0,
            },
            modalData: {
                show: false,
                user: null,
                passengers: [],
                flightOne: null,
                flightTwo: null,
            }
        }
        this.airportService = new AirportService()
        this.bookService = new BookService()
        this.airlineService = new AirlineService()
    }

    getAllAirports = () => {
        this.airportService.getList("?query=1").then(resp => {
            let data = resp.map((item, index) => {
                return {id: item.id, name: item.name}
            })
            this.setState({ airports: [...data] })
        })
    }

    componentDidMount() {
        this.getAllAirports()
        let date = (new Date()).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })
        date = date.split("/")
        date = date[2] + '-' + date[0] + '-' + date[1]
        this.setState({ today: date })
    }

    getSchedules = () => {
        this.airlineService.getScheduleList().then((resp) => {
            this.setState({
                flightsOne: [ ...resp ],
                flightsTwo: [ ...resp ]
            })
        })
    }

    handleSelect = (e, str) => {
       let { query } = this.state
       query[str] = e.name
       this.setState({
           query: { ...query }
       })
    }

    handleClose = () => {
        let { query } = this.state
        let total = Number(query.adult) + Number(query.child) + Number(query.infant)
        this.setState({ anchorEl: null, travellers: total })
    }

    selectType = async (e) => {
        if (e.target.value == 1)
            await this.setState({ query: { ...this.state.query, tripType: 1 } })
        
        await this.setState({
            query: { ...this.state.query, [e.target.id]: e.target.value }
        })
    }

    showPoper = (e) => {
        this.setState({ anchorEl: e.currentTarget })
    }

    handleChange = (e) => {
        let value = e.target.value
        if (e.target.id == 'adult' && value == 0) {
            value = 1
        } 
        this.setState({ query: { ...this.state.query, [e.target.id]: value } })
    }

    checkFields = () => {
        const { query } = this.state
        let isEmpty = false
        let field = ''
        if (!query.from) {
            isEmpty = true
            field = 'Depart From'
        } else if (!query.to) {
            isEmpty = true
            field = 'Going To'
        } else if (!query.depart) {
            isEmpty = true
            field = 'Depart Date'
        } else if (this.state.travellers == 0) {
            isEmpty = true
            field = 'Traveller(s)'
        } else if (query.type == 2 && !query.return) {
            isEmpty = true
            field = 'Return Date'
        }
        
        if (isEmpty) {
            toastError(field + ' is Blank')
            return false
        }

        return true
    }

    searchFlights = async () => {
        if (this.checkFields()) {
            this.setState({ query: { ...this.state.query, tripType: this.state.query.type } })
            let { query } = this.state
            let departFrom = this.state.airports.find((v) => v.name == query.from).id
            let goingTo = this.state.airports.find((v) => v.name == query.to).id
            let seats = Number(query.adult) + Number(query.child) + Number(query.infant)
            let flightsOne = await this.lookupFlights({ departFrom, goingTo, date: query.depart, seats })
            let flightsTwo = []
            if (query.type == 2) {
                flightsTwo = await this.lookupFlights({
                    departFrom: goingTo, 
                    goingTo: departFrom, 
                    date: query.return,
                    seats
                })
            }
            this.setState({ 
                showResult: true,
                flightsOne: [ ...flightsOne ],
                flightsTwo: [ ...flightsTwo ] 
            })
        }
    }

    lookupFlights = (query) => {
        return this.bookService.search(query).then((resp) => resp)
    }

    getDuration = (record) => {
        let depart = new Date(record.departureDate + 'T' + record.departTime).getTime();
        let arrival = new Date(record.arrivalDate + 'T' + record.arrivalTime).getTime();
        let hourDiff = arrival - depart
        let secDiff = hourDiff / 1000
        let minDiff = hourDiff / 60 / 1000
        let hDiff = hourDiff / 3600 / 1000
        let hours = Math.floor(hDiff)
        let minutes = minDiff - 60 * hours
        return `${hours}h ${minutes}m`
    }

    formatCurrency = (amount) => {
        return Number(amount).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        })
    }

    formatName = (string) => {
        return string.length > 12 ? string.substr(0, 11) + '...' : string
    }

    selectFlightOne = (record) => {
        let { modalData } = this.state
        this.setState({
            modalData: { ...modalData, flightOne: record }
        })
    }

    selectFlightTwo = (record) => {
        let { modalData } = this.state
        this.setState({
            modalData: { ...modalData, flightTwo: record }
        })
    }

    renderTooltip = (props) => (
        <Tooltip id="button-tooltip" style={{width: '200px'}} {...props}>
          Swap Origin City and Destination City
        </Tooltip>
      );

    isAllowed = () => {
        const { query, modalData } = this.state
        if (query.tripType == 1 && query.type == 1 && modalData.flightOne) {
            return true
        } else if (query.tripType == 2 && query.type == 2 && modalData.flightOne && modalData.flightTwo) {
            return true
        } else {
            return false
        }
    }

    openModal = async () => {
        let { modalData, query } = this.state
        let show = false
        if (query.type == 1 && query.tripType == 1 && modalData.flightOne != null) {
            show = true
            await this.setState({ modalData: { ...modalData, flightTwo: null } })
        } else if (query.type == 2 && query.tripType == 2 && modalData.flightOne != null && modalData.flightTwo != null) {
            show = true
        }
        if (show) {
            await this.setState({ modalData: {...modalData, show: true} })
        }
    }

    modalClose = () => {
        let { modalData } = this.state
        this.setState({ modalData: { ...modalData, show: false } })
    }

    formatDate = (date) => {
        return new Date(date).toLocaleString([], { 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric', 
            hour: "2-digit", 
            minute: "2-digit"
        })
    }

    previewPnr = (pnrOne, pnrTwo) => {
        this.modalClose()
        let { modalData, query } = this.state
        let html = `<table class="table table-hover">
                        <thead>
                            <tr>
                                <th scope="col">Flight</th>
                                <th scope="col">From</th>
                                <th scope="col">To</th>
                                <th scope="col">PNR</th>
                            </tr>
                        </thead>
                        <tbody><tr>`

        html += `<td>
                    <span>${modalData.flightOne.airline.name}</span><br />
                    ${modalData.flightOne.flightNumber}
                </td>
                <td>
                    <span>${modalData.flightOne.deptFrom.name}</span> <br /> 
                    <span>${this.formatDate(modalData.flightOne.departureDate + "T" + modalData.flightOne.departTime)}</span>
                </td>
                <td>
                    <span>${modalData.flightOne.arrvlTo.name}</span> <br /> 
                    <span>${this.formatDate(modalData.flightOne.arrivalDate + "T" + modalData.flightOne.arrivalTime)}</span>
                </td>
                <td>${pnrOne}</td></tr>`

        if (query.tripType == 2) {
            html += `<tr>
                        <td>
                            <span>${modalData.flightTwo.airline.name}</span><br />
                            ${modalData.flightTwo.flightNumber}
                        </td>
                        <td>
                            <span>${modalData.flightTwo.deptFrom.name}</span> <br /> 
                            <span>${this.formatDate(modalData.flightTwo.departureDate + "T" + modalData.flightTwo.departTime)}</span>
                        </td>
                        <td>
                            <span>${modalData.flightTwo.arrvlTo.name}</span> <br /> 
                            <span>${this.formatDate(modalData.flightTwo.arrivalDate + "T" + modalData.flightTwo.arrivalTime)}</span>
                        </td>
                        <td>${pnrTwo}</td>
                    </tr></tbody></table>`
        }

        return Swal.fire({
            title: `Successfully Booked, here's your Details`,
            text: "Successfully Booked, here's your Details",
            icon: 'info',
            html: html,
            width: '80%',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Okay!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.props.navigate('/booking')
            }
        })
    }
    
    swapPlaces = () => {
        const { query } = this.state
        if (query.from && query.to) {
            this.setState({ query: { ...query, from: query.to, to: query.from } })
        }
    }

    render(){
        const { airports, query, anchorEl, travellers, showResult, flightsOne, flightsTwo, modalData } = this.state
        const open = Boolean(anchorEl);
        const id = open ? 'simple-popover' : undefined;

        return (
            <>
                <div className="card card-danger">
                    <div className="card-header">
                        {/* <h3 className="card-title"></h3> */}
                    </div>
                    <div className="card-body" style={{width: '1168px', marginBottom: '1cm'}}>
                        <div className='row'>
                            <div className='col-4'>
                                <label className="radio-inline"><input type="radio" name="type" id='type' defaultValue={1} defaultChecked={query.type == 1} onClick={this.selectType}/> One Way</label>&#160;&#160;
                                <label className="radio-inline"><input type="radio" name="type" id='type' defaultValue={2} onClick={this.selectType}/> Round Trip</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-2">
                                <span className='label'>Depart From</span>
                                <ReactSearchAutocomplete 
                                    items={ airports }
                                    fuseOptions={{ keys: ["name", "country"] }}
                                    onSelect={(e) => this.handleSelect(e, 'from') }
                                    inputSearchString={query.from}
                                    styling={{
                                        height: "34px",
                                        border: "1px solid darkblue",
                                        borderRadius: "4px",
                                        backgroundColor: "white",
                                        boxShadow: "none",
                                        hoverBackgroundColor: "lightblue",
                                        color: "black",
                                        fontSize: "12px",
                                        fontFamily: "Courier",
                                        iconColor: "blue",
                                        lineColor: "lightblue",
                                        placeholderColor: "darkblue",
                                        clearIconMargin: "3px 8px 0 0",
                                        zIndex: 2,
                                    }}
                                />
                            </div>
                            <OverlayTrigger placement="top" overlay={this.renderTooltip}>
                                <FontAwesomeIcon icon={faArrowsRotate} style={{position: 'relative', top: '34px', cursor: 'pointer'}} onClick={this.swapPlaces} />
                            </OverlayTrigger>
                            <div className="col-2">
                                <span className='label'>Going To</span>
                                <ReactSearchAutocomplete 
                                    items={ airports }
                                    fuseOptions={{ keys: ["name", "country"] }}
                                    onSelect={(e) => this.handleSelect(e, 'to') }
                                    inputSearchString={query.to}
                                    styling={{
                                        height: "34px",
                                        border: "1px solid darkblue",
                                        borderRadius: "4px",
                                        backgroundColor: "white",
                                        boxShadow: "none",
                                        hoverBackgroundColor: "lightblue",
                                        color: "black",
                                        fontSize: "12px",
                                        fontFamily: "Courier",
                                        iconColor: "blue",
                                        lineColor: "lightblue",
                                        placeholderColor: "darkblue",
                                        clearIconMargin: "3px 8px 0 0",
                                        zIndex: 2,
                                    }}
                                />
                            </div>
                            <div className="col-2">
                                <span>Date</span>
                                <input type="date" className="form-control" onChange={this.handleChange} min={this.state.today} id='depart' />
                            </div>
                            {(() => 
                                query.type == 2 ?  (
                                    <div className="col-2">
                                        <span>Return</span>
                                        <input type="date" className="form-control" onChange={this.handleChange} min={this.state.today} id="return" />
                                    </div>
                                ) :  null
                            )()}
                            <div className="col-1">
                                <span>Traveller(s)</span>
                                <label className="form-control" onClick={this.showPoper} style={{fontWeight: 400}}>{travellers}</label>
                            </div>
                            <div className='col-2'>
                                <input type="submit" className="form-control" style={{position: 'relative', top: '24px', background: '#dc3545', fontWeight: 'bold', color: 'black'}} value="Search" onClick={this.searchFlights} />
                            </div>
                        </div>
                    </div>
                    <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={this.handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <Typography component={'div'}>
                            <div className='card-body'>
                                <div className='row'>
                                    <div className='col-2'>
                                        <span>Adult</span>
                                        <input type="number" id="adult" style={{width: '78px'}} value={query.adult} onChange={this.handleChange} />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-2'>
                                        <span>Child</span>
                                        <input type="number" id="child" style={{width: '78px'}} value={query.child} onChange={this.handleChange} />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-2'>
                                        <span>Infant</span>
                                        <input type="number" id="infant" style={{width: '78px'}} value={query.infant} onChange={this.handleChange} />
                                    </div>
                                </div>
                            </div>
                        </Typography>
                    </Popover>
                    {(() => {
                        if (showResult) {
                            return (
                                <>
                                    <div className="card-header" style={{backgroundColor: 'cornflowerblue'}}>
                                        <h4 className="card-title" style={{color: 'black', fontWeight: 'bold'}}>
                                            Search Results
                                        </h4>
                                    </div>
                                    <div className="card-body">
                                        <div className="row">
                                            {(() => {
                                                if (this.isAllowed()) {
                                                    return (
                                                        <Button variant='success' style={{position: 'relative', left: '1035px',
                                                        marginBottom: '8px'}} onClick={this.openModal} >Book Now</Button>
                                                    )
                                                }
                                            })()}
                                        </div>
                                        <div className="row">
                                            <div className={"col-" + (query.type == 1 ? '12' : '6')}>
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Name</th>
                                                            <th scope="col">Dep. Time</th>
                                                            <th scope='col'>Dur.</th>
                                                            <th scope="col">Arr. Time</th>
                                                            <th scope='col'>Fare</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(() => {
                                                            if (!flightsOne.length) {
                                                                return (
                                                                    <tr>
                                                                        <td></td>
                                                                        <td></td>
                                                                        <td>No Flight Found</td>
                                                                        <td></td>
                                                                        <td></td>
                                                                    </tr>
                                                                )
                                                            }
                                                        })()}
                                                        {flightsOne && flightsOne.map((item, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td data-toggle="tooltip" data-placement="top" title={item.airline.name}>
                                                                        <span>
                                                                            <Image src={ process.env.REACT_APP_IMAGE_URL + item.airline.logo } style={{ width: '60px', height: '40px' }} />
                                                                        </span>
                                                                        <br />
                                                                        <span >
                                                                            { this.formatName(item.airline.name) }
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span>{item.departureDate}</span><br />
                                                                        <span>{item.departTime}</span><br />
                                                                        <span>{item.deptFrom.name}</span>
                                                                    </td>
                                                                    <td>{ this.getDuration(item) }</td>
                                                                    <td>
                                                                        <span>{item.arrivalDate}</span><br />
                                                                        <span>{item.arrivalTime}</span><br />
                                                                        <span>{item.arrvlTo.name}</span>
                                                                    </td>
                                                                    <td>{ this.formatCurrency(item.fareOne) }&nbsp;&nbsp;<input type="radio" name='selectOne' id={'select_1'+index} onChange={() => this.selectFlightOne(item)} /></td>
                                                                </tr>
                                                            )
                                                        })
                                                            
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                            {(() => {
                                                if (query.type == 2) {
                                                    return (
                                                        <div className="col-6">
                                                            <table className="table table-hover">
                                                                <thead>
                                                                    <tr>
                                                                    <th scope="col">Name</th>
                                                                    <th scope="col">Dep. Time</th>
                                                                    <th scope='col'>Dur.</th>
                                                                    <th scope="col">Arr. Time</th>
                                                                    <th scope='col'>Fare</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                {(() => {
                                                                        if (!flightsTwo.length) {
                                                                            return (
                                                                                <tr>
                                                                                    <td></td>
                                                                                    <td></td>
                                                                                    <td>No Flight Found</td>
                                                                                    <td></td>
                                                                                    <td></td>
                                                                                </tr>
                                                                            )
                                                                        }
                                                                    })()}
                                                                    {flightsTwo && flightsTwo.map((item, index) => {
                                                                        return (
                                                                            <tr key={'key_' + index}>
                                                                                <td data-toggle="tooltip" data-placement="top" title={item.airline.name}>
                                                                                    <span>
                                                                                        <Image src={ process.env.REACT_APP_IMAGE_URL + item.airline.logo } style={{ width: '60px', height: '40px' }} />
                                                                                    </span>
                                                                                    <br />
                                                                                    <span>
                                                                                        { this.formatName(item.airline.name) }
                                                                                    </span>
                                                                                </td>
                                                                                <td>
                                                                                    <span>{item.departureDate}</span><br />
                                                                                    <span>{item.departTime}</span><br />
                                                                                    <span>{item.deptFrom.name}</span>
                                                                                </td>
                                                                                <td>{ this.getDuration(item) }</td>
                                                                                <td>
                                                                                    <span>{item.arrivalDate}</span><br />
                                                                                    <span>{item.arrivalTime}</span><br />
                                                                                    <span>{item.arrvlTo.name}</span>
                                                                                </td>
                                                                                <td>{ this.formatCurrency(item.fareOne) }&nbsp;&nbsp;<input type="radio" name='selectTwo' id={'select_2'+index} onChange={() => this.selectFlightTwo(item)} /></td>
                                                                            </tr>
                                                                        )
                                                                    })
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )
                                                }
                                            } )()}
                                        </div>
                                    </div>
                                </>
                            )
                        }
                    })()}
                </div>
                <ToastContainer />
                {(() => 
                    modalData.show ? 
                    <BookModal 
                        show={modalData.show} 
                        handleModalClose={this.modalClose} 
                        modalData={{...modalData, ...query}}
                        previewPnr={this.previewPnr}
                    /> : null
                )()}
            </>
        )
    }
}

export default withRouter(BookFlight)