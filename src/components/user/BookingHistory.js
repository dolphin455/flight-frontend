import { useEffect } from 'react'
import { useState } from 'react'
import { Button, Card, Col, Form, FormControl, Image, Modal } from 'react-bootstrap'
import BookingService from '../../services/BookingService'
import { toastError } from '../../utilities/toaster'

function BookingHistory() {

    let [bookings, setBookings] = useState([])
    let [search, setSearch] = useState({ type: 'pnr', text: '' })
    const bookService = new BookingService()
    let [modalData, setModalData] = useState({ show: false })
    let [ready, setReady] = useState(false)

    useEffect(() => {
        
        return  () => {
            
        } 
    }, [bookings, modalData])

    const handleChange = (e) => {
        setSearch({ ...search, [e.target.id]: e.target.value })
    }

    const lookupBookings = (e) => {
        if (search.text == '') {
            toastError("Search Field is Empty")
            return false;
        }
        bookService.lookupBookingHistory(search).then(async (resp) => {
            await setBookings([ ...resp ])
            setReady(true)
        })
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString([], {
            year: 'numeric', month: 'numeric', day: 'numeric',hour: "2-digit", minute: "2-digit"
        })
    }

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        })
    }

    const openModal = (item) => {
        let { passengerList } = item
        let object = {}
        passengerList = passengerList.sort((a, b) => a.typeId - b.typeId)
        passengerList.forEach((elem, index) => {
            let fareTag = ''
            if (elem.type.label == 'adult') fareTag = 'fareOne'
            else if (elem.type.label == 'child') fareTag = 'fareTwo'
            else if (elem.type.label == 'infant') fareTag = 'fareThree'

            object[elem.type.name] = object[elem.type.name] != undefined ? 
            { ...object[elem.type.name], count: object[elem.type.name].count + 1 } : { count: 1, tag: fareTag }
        })

        setModalData({ ...modalData, ...item, summery: object, show: true })
    }

    const handleModalClose = () => {
        setModalData({ show: false })
    }

    const formatPrice = (amount) => {
        return amount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        })
    }

    const formatName = (string) => {
        return string.length > 14 ? string.substr(0, 13) + '...' : string
    }

  return (
    <>
        <div className="row">
            <div className="col-12">
                <div className="card" style={{width: '1085px'}}>
                    <div className="card-header">
                        <h3 className="card-title">Ticket Booking History</h3>
                        <div className="card-tools">
                            <div className="input-group input-group-sm" style={{ width: 484 }}>
                                <FormControl as={'select'} size="sm" id="type" style={{position: 'relative', right: '8px'}} onChange={handleChange} >
                                    <option value="pnr">PNR</option>
                                    <option value="user_email">Email</option>
                                </FormControl> &nbsp;
                                <input type="text" className="form-control float-right" placeholder="Search by PNR or Email" onChange={handleChange} style={{width: '283px'}} id="text" /> &nbsp;&nbsp;
                                <Button variant='info' style={{paddingTop: '2px'}} onClick={lookupBookings} >Search</Button>
                            </div>
                        </div>
                    </div>
                    <div className="card-body table-responsive p-0">
                        <table className="table table-hover text-nowrap">
                            <thead>
                                <tr>
                                    <th>PNR</th>
                                    <th>Airline</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Travellers</th>
                                    <th>Total Fare</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings && bookings.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{ item.pnr }</td>
                                            <td>
                                                <span data-toggle="tooltip" data-placement="top" title={item.schedule.airline.name}>
                                                    { formatName(item.schedule.airline.name) }
                                                </span>
                                            </td>
                                            <td>
                                                <span>{ item.schedule.deptFrom.name }</span><br />
                                                <span>{ formatDate(item.schedule.departureDate + "T" + item.schedule.departTime) }</span>
                                            </td>
                                            <td>
                                                <span>{ item.schedule.arrvlTo.name }</span><br />
                                                <span>{ formatDate(item.schedule.arrivalDate + "T" + item.schedule.arrivalTime) }</span>
                                            </td>
                                            <td>{ item.passengers }</td>
                                            <td>
                                                { formatCurrency(item.totalFare) }
                                            </td>
                                            <td>
                                                {(() => 
                                                    item.isActive == 1 ? (
                                                        <span style={{color: 'green'}}>
                                                            Active
                                                        </span>
                                                    ) : item.isActive == 2 ? (
                                                        <span style={{color: 'orange'}}>
                                                           Flight's blocked
                                                        </span>
                                                    ) : (
                                                        <span style={{color: 'red'}}>
                                                            Canceled
                                                        </span>
                                                    )
                                                )()}
                                            </td>
                                            <td>
                                                <Button variant='info' onClick={() => openModal(item)}>View Details</Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {(() => {
                                    return (ready && !bookings.length) ? (
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td>No Record Found</td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                    ) : null
                                })()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        {(() => {
            return modalData.show
            ? (
                <Modal show={modalData.show} onHide={handleModalClose} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>User Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Card>
                            <Card.Body>
                                <Card.Title style={{fontWeight: '600', marginBottom: '4.5cm'}}>Fare Summary</Card.Title>
                                <hr style={{marginTop: '2rem'}}/>
                                    {
                                        modalData.summery && Object.keys(modalData.summery).map((key) => {
                                            return (
                                                <span key={key}>
                                                    <span style={{fontSize: '14px'}}>{key}(s) - </span>
                                                    <span style={{fontSize: '14px'}}>{modalData.summery[key].count + 'X ₹' + modalData.schedule[modalData.summery[key].tag]}</span>&emsp; &ndash; &emsp;
                                                    <span>{ formatPrice(Number(modalData.summery[key].count) * Number(modalData.schedule[modalData.summery[key].tag])) }</span><br />
                                                </span>
                                            )
                                        })
                                    }
                                <hr />
                                <span>Total &emsp;  &ndash;</span>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<span>{ formatPrice(modalData.totalFare) }</span>
                            </Card.Body>
                        </Card>
                        <Card style={{height: 210}}>
                            <Card.Body>
                                <Card.Title style={{fontWeight: '600', marginBottom: '4.5cm'}}>Flight Details</Card.Title>
                                <hr style={{marginTop: '2rem'}}/>
                                    <table className="table text-nowrap" style={{position:'relative', bottom: 160}}>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>PNR</th>
                                                <th>From</th>
                                                <th>To</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <span style={{ fontSize: 'small'}}>
                                                        <Image src={process.env.REACT_APP_IMAGE_URL + modalData.schedule.airline.logo} style={{width: '62px'}}/> <br />
                                                        {modalData.schedule.airline.name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{fontSize: 'small'}}>{ modalData.pnr }</span>
                                                </td>
                                                <td>
                                                    <span style={{fontSize: 'small'}}>
                                                        <span>{modalData.schedule.deptFrom.name}</span><br />
                                                        <span>{formatDate(modalData.schedule.departureDate + "T" + modalData.schedule.departTime)}</span>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{fontSize: 'small'}}>
                                                        <span>{modalData.schedule.arrvlTo.name}</span><br />
                                                        <span>{formatDate(modalData.schedule.arrivalDate + "T" + modalData.schedule.arrivalTime)}</span>
                                                    </span>
                                                </td>
                                                <td>
                                                    {(() => 
                                                        modalData.isActive == 1 ? (
                                                            <span style={{color: 'green'}}>
                                                                Active
                                                            </span>
                                                        ) : modalData.isActive == 2 ? (
                                                            <span style={{color: 'orange'}}>
                                                                Flight's blocked
                                                            </span>
                                                        ) : (
                                                            <span style={{color: 'red'}}>
                                                                Canceled
                                                            </span>
                                                        )
                                                    )()}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                            </Card.Body>
                        </Card>
                        <Form>
                            <Form.Label>Booked user details</Form.Label>
                            <br /><br />
                            <Form.Row>
                                <Form.Group as={Col} className="mb-2" controlId="">
                                    <Form.Label style={{fontWeight: '400'}}>Phone Number</Form.Label>
                                    <br />
                                    <Form.Control type='text' value={modalData.user.extension + " " + modalData.user.contact} disabled />
                                </Form.Group>
                                <Form.Group as={Col} className="mb-2" controlId="">
                                    <Form.Label style={{fontWeight: '400'}}>Email</Form.Label>
                                    <Form.Control type="email" value={modalData.user.email} disabled />
                                </Form.Group>
                            </Form.Row>
                            <br /><br />
                            <Form.Label>Passenger Details</Form.Label>
                            {(() => {
                            return modalData.passengerList && modalData.passengerList.map((user, index) => {
                                return (
                                    <Form.Row key={index}>
                                        <Form.Label style={{fontWeight: '400'}}>{ user.type.name + " " + user.userKey}</Form.Label>
                                        <Form.Group as={Col} className="mb-2" controlId={ 'name_' + index }>
                                        <Form.Control type="text" placeholder="Enter Name" value={user.name} disabled />
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-2" controlId={ 'gender_' + index } >
                                        <Form.Control as={'select'} value={user.gender} disabled>
                                            <option value={''}>Select Gender</option>
                                            <option value={'male'}>Male</option>
                                            <option value={'female'}>Female</option>
                                        </Form.Control>
                                        </Form.Group>
                                        <Form.Group as={Col} className="mb-2" controlId={ 'age' + index }>
                                            <Form.Control type="number" placeholder="Age" value={user.age} disabled />
                                        </Form.Group>

                                        <Form.Group as={Col} className="mb-2" controlId={ 'meal_' + index } >
                                            <Form.Control as={'select'} value={user.meal} disabled>
                                                <option value={''}>Select Meal</option>
                                                <option value={'veg'}>Veg</option>
                                                <option value={'nonveg'}>Non Veg</option>
                                            </Form.Control>
                                        </Form.Group>
                                    </Form.Row>
                                )
                            })
                            } )()}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        Close
                    </Button>
                    </Modal.Footer>
                </Modal>
            ) : null
        })()}
    </>
  )
}

export default BookingHistory