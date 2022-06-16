import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'
import { toastError, toastSuccess } from '../../utilities/toaster'
import Swal from 'sweetalert2'
import { ToastContainer } from 'react-toastify';
import CountryService from '../../services/CountryService'
import { checkAuth } from '../../utilities/checkAuth';
import { useNavigate } from 'react-router-dom';

let tempCountryList = []
function Country () {
    const [show, setShow] = useState(false)
    const countryService = new CountryService
    let navigate = useNavigate()
    const [country, setCountry] = useState({
        id: null,
        name: ''
    })
    let [editmode, setEditMode] = useState(false)
    let [countries, setCountries] = useState([])


    useEffect(() => {
        const getList = async () => {
            countryService.getList().then(resp => {
                tempCountryList = [ ...resp ]
                setCountries(resp)
            })
        }
        getList()

        if (!checkAuth()) {
            navigate('/admin')
        }
        
    }, [])

    const handleClose = () => setShow(false);

    const addCountry = () => {
        setCountry({
            id: null,
            name: ''
        })
        setShow(true)
        setEditMode(false)
    }

    
    const handleChange = (e) => {
        setCountry({
            ...country,
            [e.target.id]: e.target.value
        })
    }

    const deleteCountry = (row) => {
        countryService.delete(row).then(resp => {
            let data = [ ...countries ]
            let index = data.findIndex(f => f.id === row.id)
            if (index >= 0) {
                data.splice(index, 1)
            }
            toastError(`${row.name} has been deleted`, {
                position: "top-right",
                autoClose: 1000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            })
            setCountries(data)
            tempCountryList = data
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
                deleteCountry(row)
            }
        })
    }

    const saveCountry = (e) => {
        e.preventDefault()
        if(country.name != "") {
            countryService.save(country).then(resp => {
                toastSuccess("Country added Succesfuly")
                let data = countries
                data.push(resp)
                setCountries(data)
                setShow(false)
                tempCountryList = data
            })
        } else {
            toastError("Enter Country Name")
        }
    }

    const updateCountry = () => {
        let data = [...countries]
        if(country.name != "") {
            countryService.update(country).then(resp => {
                let index = data.findIndex(item => item.id === country.id)
                if (index !== -1) {
                    data[index] = { ...country }
                    setCountries(data)
                    data = data
                    tempCountryList = data
                    setShow(false)
                    toastSuccess("Country updated Succesfuly")
                }
            })
        } else {
            toastError("Enter Country Name")
        }
    }

    const openEditModal = (item) => {
        setCountry({
            ...country,
            id: item.id,
            name: item.name
        })
        setEditMode(true)
        setShow(true)
    }

    const lookupCountry = (e) => {
        let name = e.target.value
        if (name) {
            countryService.search(e.target.value).then((resp) => {
                setCountries(resp)
            })
        } else {
            setCountries(tempCountryList)
        }
    }

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="card" style={{width: '620px'}}>
                        <div className="card-header">
                            <h3 className="card-title">Countries</h3>
                            <div className="card-tools">
                                <div className="input-group input-group-sm" style={{ width: 250 }}>
                                    <Button variant='primary' className='btn btn-primary btn-sm' style={{height: 32, width: 67}} onClick={addCountry}>Add</Button>&nbsp;&nbsp;
                                    <input type="text" name="table_search" className="form-control float-right" placeholder="Search" onChange={lookupCountry} />
                                    
                                </div>
                            </div>
                        </div>
                       
                        <div className="card-body table-responsive p-0">
                            <table className="table table-hover text-nowrap">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {countries && countries.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.name}</td>
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
                                <Modal.Title>{ editmode ? 'Update Country' : 'New Country Add' }</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Form.Group className="mb-2" controlId="name">
                                            <Form.Label>Country Name</Form.Label>
                                            <Form.Control type="text" placeholder="Enter Name" value={country.name} onChange={handleChange} />
                                        </Form.Group>
                                    </Form>
                                </Modal.Body>
                                <Modal.Footer>
                                <Button variant="secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                
                                { editmode ? <EditButton onClick={updateCountry} /> : <AddButton onClick={saveCountry} /> }
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
        Update Country
    </Button>
)

const AddButton = (props) => (
    <Button variant='primary' onClick={props.onClick}>
        Add Country
    </Button>
)

export default Country