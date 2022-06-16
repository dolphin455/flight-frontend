import { useEffect, useState } from 'react';
import { Modal, Button, Form, ButtonGroup, ToggleButton, Image } from 'react-bootstrap'
import { toastError, toastSuccess } from '../../../utilities/toaster'
import Swal from 'sweetalert2'
import { ToastContainer } from 'react-toastify';
import AirlineService from '../../../services/AirlineService';
import './Airline.css'
import { useNavigate } from 'react-router-dom'
import { checkAuth } from '../../../utilities/checkAuth'

let tempFlightList = []
function AirlineList () {

    const [show, setShow] = useState(false)
    let [checkLogo, setLogo] = useState(false)
    const airlineService = new AirlineService
    let navigate = useNavigate()
    const [airline, setAirline] = useState({
        id: null,
        name: '',
        logo: '',
        address: '',
        isBlocked: 1
    })
    let [editmode, setEditMode] = useState(false)
    let [airlines, setAirlines] = useState([])

    useEffect(() => {
        const getList = async () => {
            airlineService.getList().then(resp => {
                tempFlightList = [ ...resp ]
                setAirlines(resp)
            })
        }
        getList()
        if (!checkAuth()) {
            navigate('/admin')
        }
        
    }, [])

    const handleClose = () => {
        setLogo(true)
        setShow(false)
    }

    const addAirline = () => {
        setAirline({
            id: null,
            name: '',
            logo: '',
            address: '',
            isBlocked: 1
        })
        setShow(true)
        setEditMode(false)
    }
    
    const handleChange = (e) => {
        if (e.target.id == 'logo') {
            setAirline({
                ...airline,
                logo: e.target.files[0]
            })
            setLogo(true)
        } else {
            setAirline({
                ...airline,
                [e.target.id]: e.target.value
            })
        }
    }

    const deleteAirline = (row) => {
        airlineService.delete(row).then(resp => {
            let flights = [ ...airlines ]
            let index = flights.findIndex(f => f.id === row.id)
            if (index >= 0) {
                flights.splice(index, 1)
            }
            toastError(`${row.name} airline has been deleted`, {
                position: "top-right",
                autoClose: 1000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            setAirlines(flights)
            tempFlightList = flights
        })
    }

    const openDeleteModal = (row) => {
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
                deleteAirline(row)
            }
        })
    }

    const checkAirline = () => {
        let isValid = true
        if (airline.name == "") {
            toastError("Name is empty")
            isValid = false
        } else if (airline.logo == "") {
            toastError("Select a Logo for the Airline")
            isValid = false
        } else if (airline.address == "") {
            toastError("Address is Empty")
            isValid = false
        }
        return isValid
    }

    const uploadImage = () => {
        const formData = new FormData()
        formData.append("logo", airline.logo)
        return airlineService.uploadImage(formData)
    }

    const saveAirline = async (e) => {
        e.preventDefault()
        if (checkAirline()) {
            let fileName = await uploadImage()
            if (fileName && fileName.name != "") {
                airlineService.save(airline, fileName.name).then(resp => {
                    toastSuccess("Airline added Succesfuly")
                    let flightList = airlines
                    flightList.push(resp)
                    setAirlines(flightList)
                    setShow(false)
                    tempFlightList = flightList
                })
            }
        }
    }

    const updateAirline = async (e) => {
        e.preventDefault()
        let flightList = [...airlines]
        let fName = airline.logo
        if (checkAirline()) {
            if (checkLogo) {
                let fileName = await uploadImage()
                if (fileName && fileName.name != "") {
                    fName = fileName.name
                }
            }
            airlineService.update(airline, fName).then(resp => {
                let index = flightList.findIndex(item => item.id === resp.id)
                if (index !== -1) {
                    flightList[index] = { ...resp }
                    setAirlines(flightList)
                    flightList = flightList
                    setShow(false)
                    toastSuccess("Airline updated Succesfuly")
                }
                setLogo(false)
            })
        }
    }

    const toggleStatus = (row, isBlocked) => {
        if (isBlocked !== row.isBlocked) {
            let param = row
            param.isBlocked = isBlocked
            airlineService.updateStatus(param).then((resp) => {
                if(resp) {
                    let index = airlines.findIndex((item) => item.id == row.id)
                    if (index !== -1) {
                        let tempAirlines = [...airlines]
                        tempAirlines[index].isBlocked = param.isBlocked
                        setAirlines(tempAirlines)
                        tempFlightList = tempAirlines
                        toastSuccess(`Airline ${isBlocked === 1 ? 'Unblocked' : 'Blocked'}`)
                    }
                }
            })
        }
    }

    const openEditModal = (item) => {
        setAirline({
            ...airline,
            id: item.id,
            logo: item.logo,
            name: item.name,
            address: item.hqAddress
        })
        setEditMode(true)
        setShow(true)
    }

    const lookupAirline = (e) => {
        let name = e.target.value
        if (name) {
            airlineService.search(e.target.value).then((resp) => {
                setAirlines(resp)  
            })
        } else {
            setAirlines(tempFlightList)
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="card" style={{width: 1000}}>
                        <div className="card-header">
                            <h3 className="card-title">Airline List</h3>
                            <div className="card-tools">
                                <div className="input-group input-group-sm" style={{ width: 328 }}>
                                    <Button variant='primary' className='btn btn-primary btn-sm' onClick={addAirline}>Add Airline</Button>&nbsp; &nbsp;
                                    <input type="text" name="table_search" className="form-control float-right" placeholder="Search" onChange={lookupAirline} />
                                </div>
                            </div>
                        </div>
                       
                        <div className="card-body table-responsive p-0">
                            <table className="table table-hover text-nowrap">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Logo</th>
                                        <th>Name</th>
                                        <th>Address</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {airlines && airlines.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <Image src={process.env.REACT_APP_IMAGE_URL + item.logo} style={{width: '62px'}} />
                                                </td>
                                                <td>{item.name}</td>
                                                <td>{item.hqAddress}</td>
                                                <td>
                                                    <ButtonGroup className='mb-2'>
                                                        <ToggleButton 
                                                        className='status_toggle btn btn-sm'
                                                        key={index} 
                                                        id={'radio-one-' + index}
                                                        type='radio' 
                                                        variant='outline-success'
                                                        name={`toggle-radio-one-${index}`}
                                                        value={1}
                                                        onChange={() => toggleStatus(item, 1)}
                                                        checked={item.isBlocked == 1}
                                                        >Unblock</ToggleButton>
                                                    </ButtonGroup>
                                                    &nbsp;&nbsp;
                                                    <ButtonGroup className='mb-2'>
                                                        <ToggleButton 
                                                        key={index + 1} 
                                                        className='status_toggle btn btn-sm'
                                                        id={`radio-two-${index}`}
                                                        type='radio' 
                                                        variant='outline-danger'
                                                        name={`toggle-radio-two-${index}`}
                                                        value={0}
                                                        onChange={() => toggleStatus(item, 0)}
                                                        checked={item.isBlocked == 0}
                                                        >Block</ToggleButton>
                                                    </ButtonGroup>
                                                </td>
                                                <td>
                                                    <a href="#" data-toggle="tooltip" data-placement="top" title="Edit" onClick={() => openEditModal(item) }><i className="far fa-edit" style={{cursor: 'pointer'}}></i></a>

                                                    <a href="#" data-toggle="tooltip" data-placement="top" title="Delete" onClick={() => openDeleteModal(item) }><i className="far fa-trash-alt" style={{color: "red"}}></i></a>
                                                </td>
                                            </tr>
                                        )
                                    })
                                    }
                                </tbody>
                            </table>
                            <Modal show={show} onHide={handleClose}>
                                <Modal.Header closeButton>
                                <Modal.Title>{ editmode ? 'Update Airline' : 'New Airline Add' }</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-2" controlId="name">
                                            <Form.Label>Airline Name</Form.Label>
                                            <Form.Control type="text" placeholder="Enter Name" value={airline.name} onChange={handleChange} />
                                        </Form.Group>
                                        <Form.Group className="mb-2" controlId="logo">
                                            <Form.Label>Upload Logo</Form.Label>
                                            <Form.Control type="file" onChange={handleChange} />
                                            {/* <Form.Control as="textarea" rows={3} placeholder='Enter Logo URL' value={airline.logo} onChange={handleChange} onBlur={handleChange} /> */}
                                        </Form.Group>
                                        <Form.Group className="mb-2" controlId="address">
                                            <Form.Label>Contact Address</Form.Label>
                                            <Form.Control type="text" placeholder="Enter Address" value={airline.address} onChange={handleChange} />
                                        </Form.Group>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                
                                { editmode ? <EditButton onClick={updateAirline} /> : <AddButton onClick={saveAirline} /> }
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    )
}

const EditButton = (props) => (
    <Button variant='primary' onClick={props.onClick}>
        Update Airline
    </Button>
)

const AddButton = (props) => (
    <Button variant='primary' onClick={props.onClick}>
        Add Airline
    </Button>
)

export default AirlineList