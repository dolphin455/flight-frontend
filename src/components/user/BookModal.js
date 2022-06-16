import { useEffect } from "react"
import { useState } from "react"
import { Button, Card, Col, Form, Modal } from "react-bootstrap"
import BookService from '../../services/BookingService'
import UserService from "../../services/userService"
import IntlTelInput from 'react-intl-tel-input'
import 'react-intl-tel-input/dist/main.css'
import { ToastContainer } from "react-toastify"
import { toastError, toastSuccess } from "../../utilities/toaster"

const BookModal = ({ show, handleModalClose, modalData, previewPnr }) => {
  let [isOpen, setIsOpen] = useState(false);
  let [price, setPrice] = useState({ adult: 0, child: 0, infant: 0, total: 0 })
  let [user, setUser] = useState({ contact:'', extension: '', iso: '', email: '' });
  const [passengers, setPassengers] = useState([]);
  let [isNumberValid, setNumberValid] = useState(false)
  let [isEmailValid, setEmailValid] = useState(false)
  const bookService = new BookService()
  const userService = new UserService()
  
  useEffect(() => {
    calculatePrice()
    setIsOpen(show)
    getPassengerTypes()

    return () => {
      setPassengers([])
    }
  }, [show])

  const getPassengerTypes = () => {
    bookService.getTypes().then(async (resp) => {
      genUserArray(resp)
    })
  }

  const calculatePrice = () => {
    let adult = 0, child = 0, infant = 0;
    adult = Number(modalData.flightOne.fareOne)
    child = Number(modalData.flightOne.fareTwo)
    infant = Number(modalData.flightOne.fareThree)

    if (modalData.tripType == 2) {
      adult = adult + Number(modalData.flightTwo.fareOne)
      child = child + Number(modalData.flightTwo.fareTwo)
      infant = infant + Number(modalData.flightTwo.fareThree)
    }

    let total = Number(modalData.adult) * adult + Number(modalData.child) * child + Number(modalData.infant) * infant
    setPrice({ adult, child, infant, total })
  }

  const genUserArray = async (types) => {
    let userArr = [];
    let adult = types.find(i => i.label === 'adult');
    [...Array(Number(modalData.adult))].map((_, i) => {
       userArr.push({userKey: i+1, category: 'Adult', label: 'adult', typeId: adult.id, name: '', gender: '', age: '', meal: ''})
    });

    let child = types.find(i => i.label === 'child');
    [...Array(Number(modalData.child))].map((_, i) => {
        userArr.push({userKey: i+1, category: 'Child', label: 'child', typeId: child.id, name: '', gender: '', age: '', meal: ''})
    });

    let infant = types.find(i => i.label === 'infant');
    [...Array(Number(modalData.infant))].map((_, i) => {
        userArr.push({userKey: i+1, category: 'Infant', label: 'infant', typeId: infant.id, name: '', gender: '', age: '', meal: ''})
    });

    await setPassengers([...userArr])

  }

  const handleChange = (e, index, tagName) => {
    let data = [...passengers]
    data[index] = { ...data[index], [tagName]: e.target.value }
    setPassengers([...data])
  }

  const checkEmail = (email) => {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(email));
  }
  
  const setUserEmail = (e) => {
    let dom = document.getElementById("emailId")
    if (checkEmail(e.target.value)) {
      setUser({
        ...user,
        email: e.target.value
      })
      setEmailValid(true)
      dom.removeAttribute('style')
    } else {
      dom.style.borderColor = 'red'
      setEmailValid(false)
    }
  }

  const saveUser = (params) => {
    return userService.save(params).then(resp => resp)
  }

  const bookTicket = async (params) => {
    return await bookService.bookTicket(params)
  }

  const isFormValid = () => {
    let isValid = true, pValid = true
    if (!isNumberValid) {
      toastError("Enter a valid Mobile Number")
      isValid = false
    } else if (!isEmailValid) {
      toastError("Enter a valid Email Address")
      isValid = false
    } 

    passengers.forEach(item => {
      if (item.name == "") {
        pValid = false
      } else if (item.gender == "") {
        pValid = false
      } else if (item.age == "") {
        pValid = false
      }
    })

    if (!pValid) {
      toastError("Enter the Passenger Details")
    }
    if (isValid && pValid) {
      return true;
    } else {
      return false;
    }
  }

  const buyTicket = async (e) => {
    let params = {}
    let pnrOne = null, pnrTwo = null
    let now = new Date()
    params.passengers = Number(modalData.adult) + Number(modalData.child) + Number(modalData.infant)
    params.scheduleId = modalData.flightOne.id
    params.PNR = ''
    params.booked_at = now.toLocaleDateString('en-CA') + 'T' + now.getHours() + ':' + now.getMinutes()
    params.schedule_time = modalData.flightOne.departure
    params.userEmail = user.email
    params = { ...params, adult: modalData.adult, child: modalData.child, infant: modalData.infant }

    if (isFormValid()) {
      const userData = await saveUser(user)
      params.userId = userData.id

      params.totalFare = Number(modalData.adult) * Number(modalData.flightOne.fareOne) + Number(modalData.child) * Number(modalData.flightOne.fareTwo) + Number(modalData.infant) * Number(modalData.flightOne.fareThree)

      bookTicket(params).then((resp) => {
        pnrOne = resp.pnr;
        bookService.savePassengers(resp, passengers)
        if (modalData.tripType == 2) {
          params.PNR = ""
          params.booked_at = now.toLocaleDateString('en-CA') + 'T' + now.getHours() + ':' + now.getMinutes()
          params.scheduleId = modalData.flightTwo.id
          params.schedule_time = modalData.flightTwo.departure
          params.totalFare = Number(modalData.adult) * Number(modalData.flightTwo.fareOne) + Number(modalData.child) * Number(modalData.flightTwo.fareTwo) + Number(modalData.infant) * Number(modalData.flightTwo.fareThree)
          bookTicket(params).then((response) => {
            pnrTwo = response.pnr
            bookService.savePassengers(response, passengers)
            previewPnr(pnrOne, pnrTwo)
          })
        } else {
          previewPnr(pnrOne, null)
        }
        toastSuccess('Ticket booked successfully')
      })
    }
  }

  const changePhone = (
    isValid,
    value,
    selectedCountryData) => {
      let dom = document.querySelector("input[type=tel]")
    if (isValid) {
      setUser({ 
        ...user,
        contact:value, 
        extension: selectedCountryData.dialCode, 
        iso: selectedCountryData.iso2 
      })
      setNumberValid(true)
      dom.removeAttribute('style')
    } else {
      dom.style.borderColor = 'red'
      setNumberValid(false)
    }
  }

  const formatPrice = (amount) => {
    return amount.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
    })
  }
  
  return (
    <>
      <Modal show={isOpen} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Card>
            <Card.Body>
              <Card.Title style={{fontWeight: '600', marginBottom: '4.5cm'}}>Fare Summary</Card.Title>
                <hr style={{marginTop: '2rem'}}/>
                <span style={{fontSize: '14px'}}>Adult(s) - </span><span style={{fontSize: '14px'}}>{ modalData.adult + ' X ₹' + price.adult}</span>&emsp; &ndash; &emsp;<span>{ formatPrice(Number(modalData.adult) * price.adult) }</span> <br />
                {(() => modalData.child != 0 ? (
                  <>
                    <span style={{fontSize: '14px'}}>Child(s) - </span><span style={{fontSize: '14px'}}>{ modalData.child + ' X ₹' + price.child}</span>&emsp; &ndash; &emsp;<span>{ formatPrice(Number(modalData.child) * price.child) }</span><br />
                  </>
                ) : null )()} 
                {(() => modalData.infant != 0 ? (
                  <>
                    <span style={{fontSize: '14px'}}>Infant(s) - </span><span style={{fontSize: '14px'}}>{ modalData.infant + ' X ₹' + price.infant}</span>&emsp; &ndash; &emsp;<span>{ formatPrice(Number(modalData.infant) * price.infant) }</span>
                  </>
                ) : null)()}

                <hr />
                <span>Total &emsp;  &ndash;</span>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<span>{ formatPrice(price.total) }</span>

              {/* </Card.Text> */}
            </Card.Body>
            </Card>
            <Form>
                <Form.Label>Booking details will be sent to</Form.Label>
                <br /><br />
                <Form.Row>
                    <Form.Group as={Col} className="mb-2" controlId="">
                        <Form.Label style={{fontWeight: '400'}}>Phone Number</Form.Label>
                        <br />
                        <IntlTelInput
                          defaultCountry={'in'}
                          onPhoneNumberChange={changePhone}
                          containerClassName="intl-tel-input"
                          inputClassName="form-control"
                        />
                    </Form.Group>
                    <Form.Group as={Col} className="mb-2" controlId="emailId">
                        <Form.Label style={{fontWeight: '400'}}>Email</Form.Label>
                        <Form.Control type="email" placeholder="Enter Email" onChange={setUserEmail} />
                    </Form.Group>
                </Form.Row>
                <br /><br />
                <Form.Label>Passenger Details</Form.Label>
                {(() => {
                  return passengers && passengers.map((user, index) => {
                    return (
                      <Form.Row key={index}>
                        <Form.Label style={{fontWeight: '400'}}>{ user.category + " " + user.userKey}</Form.Label>
                        <Form.Group as={Col} className="mb-2" controlId={ 'name_' + index }>
                          <Form.Control type="text" placeholder="Enter Name" onChange={(e) => handleChange(e, index, 'name') } />
                        </Form.Group>
                        <Form.Group as={Col} className="mb-2" controlId={ 'gender_' + index } >
                          <Form.Control as={'select'} onChange={(e) => handleChange(e, index, 'gender')}>
                            <option>Select Gender</option>
                            <option value={'male'}>Male</option>
                            <option value={'female'}>Female</option>
                          </Form.Control>
                        </Form.Group>
                        <Form.Group as={Col} className="mb-2" controlId={ 'age_' + index }>
                          <Form.Control type="number" placeholder="Age" onChange={(e) => handleChange(e, index, 'age') } />
                        </Form.Group>

                        <Form.Group as={Col} className="mb-2" controlId={ 'meal_' + index }>
                          <Form.Control as={'select'} onChange={(e) => handleChange(e, index, 'meal')}>
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
          <Button variant="primary" onClick={buyTicket}>
              Buy Ticket
          </Button>
        </Modal.Footer>
        <ToastContainer />
      </Modal>
    </>
  )
}

export default BookModal