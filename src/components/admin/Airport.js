import { useEffect, useState } from 'react';
import { Modal, Button, Form, Col } from 'react-bootstrap'
import { toastError, toastSuccess } from '../../utilities/toaster'
import Swal from 'sweetalert2'
import { ToastContainer } from 'react-toastify';
import AirportService from '../../services/AirportService'
import CountryService from '../../services/CountryService'
import { checkAuth } from '../../utilities/checkAuth';
import { useNavigate } from 'react-router-dom';

let tempAirportList = []
function Airport () {

    const [show, setShow] = useState(false)
    const airportService = new AirportService
    const countryService = new CountryService
    let navigate = useNavigate()
    const [airport, setAirport] = useState({
        id: null,
        name: '',
        countryId: 0,
    })
    let [editmode, setEditMode] = useState(false)
    let [airports, setAirports] = useState([])
    let [countries, setCountries] = useState([])

    useEffect(() => {
        const getList = async () => {
            airportService.getList().then(resp => {
                tempAirportList = [ ...resp ]
                setAirports(resp)
            })
            countryService.getList().then(resp => {
                setCountries(resp)
            })
        }
        getList()

        if (!checkAuth()) {
            navigate('/admin')
        }
        
    }, [])

    const checkAirport = () => {
        if (airport.name == "") {
            return false
        }
        if (airport.countryId == 0) {
            return false
        }
        return true
    }

    const handleClose = () => setShow(false);

    const addAirport = () => {
        setAirport({
            id: null,
            name: '',
            countryId: 0,
        })
        setShow(true)
        setEditMode(false)
    }

    
    const handleChange = (e) => {
        setAirport({
            ...airport,
            [e.target.id]: e.target.value
        })
    }

    const deleteAirport = (row) => {
        airportService.delete(row).then(resp => {
            let data = [ ...airports ]
            let index = data.findIndex(f => f.id === row.id)
            if (index >= 0) {
                data.splice(index, 1)
            }
            toastError(`${row.name} Airport has been deleted`, {
                position: "top-right",
                autoClose: 1000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            setAirports(data)
            tempAirportList = data
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
                deleteAirport(row)
            }
        })
    }

    const saveAirport = (e) => {
        e.preventDefault()
        if (checkAirport()) {
            airportService.save(airport).then(resp => {
                toastSuccess("Airport added Succesfuly", {
                    position: "top-right",
                    autoClose: 1000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
                let data = airports
                data.push(resp)
                setAirports(data)
                setShow(false)
                tempAirportList = data
            })
        } else {
            toastError("Entries are empty")
        }
    }

    const updateAirport = () => {
        let data = [...airports]
        if (checkAirport()) {
            airportService.update(airport).then(resp => {
                let index = data.findIndex(item => item.id === airport.id)
                if (index !== -1) {
                    data[index] = { ...resp }
                    setAirports(data)
                    data = data
                    setShow(false)
                    toastSuccess("Airport updated Succesfuly", {
                        position: "top-right",
                        autoClose: 1000,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    })
                }
            })
        } else {
            toastError("Entries are empty")
        }
    }

    const openEditModal = (item) => {
        setAirport({
            ...airport,
            id: item.id,
            name: item.name,
            countryId: item.country.id
        })
        setEditMode(true)
        setShow(true)
    }

    const lookupAirport = (e) => {
        let name = e.target.value
        if (name) {
            airportService.search(e.target.value).then((resp) => {
                setAirports(resp)  
            })
        } else {
            setAirports(tempAirportList)
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="card" style={{width: '620px'}}>
                        <div className="card-header">
                            <h3 className="card-title">Airport List</h3>
                            <div className="card-tools">
                                <div className="input-group input-group-sm" style={{ width: 250 }}>
                                    <Button variant='primary' className='btn btn-primary btn-sm' style={{height: 32, width: 67}} onClick={addAirport}>Add</Button>&nbsp;&nbsp;
                                    <input type="text" name="table_search" className="form-control float-right" placeholder="Search" onChange={lookupAirport} />
                                    
                                </div>
                            </div>
                        </div>
                       
                        <div className="card-body table-responsive p-0">
                            <table className="table table-hover text-nowrap">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Country</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {airports && airports.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.name}</td>
                                                <td>{item.country.name}</td>
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
                                <Modal.Title>{ editmode ? 'Update Airport' : 'New Airport Add' }</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-2" controlId="name">
                                            <Form.Label>Airport Name</Form.Label>
                                            <Form.Control type="text" placeholder="Enter Name" value={airport.name} onChange={handleChange} />
                                        </Form.Group>

                                        <Form.Group as={Col} className="mb-2" controlId="countryId">
                                            <Form.Label>Country</Form.Label>

                                            <Form.Control as={'select'} value={airport.countryId} onChange={handleChange}>
                                                <option>Select Country</option>
                                                {(() => {
                                                    return countries && countries.map((item, index) => {
                                                        return <option value={item.id} key={index}> { item.name } </option>
                                                    })
                                                })()}
                                            </Form.Control>
                                        </Form.Group>
                                        
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                
                                { editmode ? <EditButton onClick={updateAirport} /> : <AddButton onClick={saveAirport} /> }
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
        Update Airport
    </Button>
)

const AddButton = (props) => (
    <Button variant='primary' onClick={props.onClick}>
        Add Airport
    </Button>
)

export default Airport