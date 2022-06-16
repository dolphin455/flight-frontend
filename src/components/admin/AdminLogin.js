import React, { useState } from 'react'
import AuthService from '../../services/AuthService'
import { ToastContainer } from 'react-toastify'
import { toastError, toastSuccess } from '../../utilities/toaster';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate, useNavigate } from 'react-router-dom'

function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    let authService = new AuthService
    let navigate = useNavigate()
    const handleChange = (e) => {
        if (e.target.id === 'email') {
            setEmail(e.target.value)
        } else {
            setPassword(e.target.value)
        }
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        let params = {
            email,
            password
        }
        authService.login(params).then((resp) => {
            console.log(resp)
            if(resp) {
                toastSuccess("Login Success", {
                    position: "top-right",
                    autoClose: 1000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
                navigate('schedule')
            } else {
                toastError("Invalid Credentials", {
                    position: "top-right",
                    autoClose: 1000,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                })
            }
        })
    }
    const token = localStorage.getItem('token')
    if (token) {
        return <Navigate to='schedule' />
    }
    return (
        <>
            <div className='col-md-6'>
                <div className="card card-primary">
                    <div className="card-header">
                        <h3 className="card-title">Login</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="card-body">
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Email address</label>
                                <input type="email" className="form-control" id="email" placeholder="Enter email" onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputPassword1">Password</label>
                                <input type="password" className="form-control" id="password" placeholder="Password" onChange={handleChange} />
                            </div>
                        </div>
                        {/* /.card-body */}
                        <div className="card-footer">
                            <button type="submit" className="btn btn-primary">Login</button>
                        </div>
                    </form>
                </div>

            </div>
            <ToastContainer />
        </>
    )
}

export default AdminLogin