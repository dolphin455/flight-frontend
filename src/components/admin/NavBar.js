import React, { Fragment } from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { checkAuth } from '../../utilities/checkAuth'

function NavBar() {
    const navigate = useNavigate()
    let [isAuthenticated, setIsAuthenticated] = useState(true)
    const location = useLocation()
    useEffect(() => {
        console.log('-----------');
        setIsAuthenticated(checkAuth())
        if (!isAuthenticated) {
            navigate('/admin')
        }
    }, [location])

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/admin')
    }

  return (
    <Fragment>
        <nav className="main-header navbar navbar-expand navbar-white">
            <ul className="navbar-nav">
                <li className='nav-item'>
                    <span className="brand-text font-weight-bold" style={{ fontSize: '20px' }}>Flight Booking | Admin</span>
                </li>
                <li className="nav-item">
                    {/* <a className="nav-link" data-widget="pushmenu" href="#" role="button"><i className="fas fa-bars" /></a> */}
                </li>
                
            </ul>
                {/* Right Side */}
            {(() => 
                isAuthenticated ?  (
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item d-none d-sm-inline-block">
                            <NavLink to={'schedule'} className="nav-link">Manage Schedule</NavLink>
                        </li>
                        {/* <li className="nav-item d-none d-sm-inline-block">
                            <NavLink to={'discounts'} className="nav-link">Manage Discount</NavLink>
                        </li> */}
                        <li className="nav-item d-none d-sm-inline-block">
                            <NavLink to={'airlines'} className="nav-link">Manage Airlines</NavLink>
                        </li>
                        <li className="nav-item d-none d-sm-inline-block">
                            <NavLink to={'airports'} className="nav-link">Manage Airports</NavLink>
                        </li>
                        <li className="nav-item d-none d-sm-inline-block">
                            <NavLink to={'countries'} className="nav-link">Manage Countries</NavLink>
                        </li>
                        <li className="nav-item d-none d-sm-inline-block">
                            <NavLink to={'reports'} className="nav-link">Reports</NavLink>
                        </li>

                        <li className="nav-item">
                            <a className="nav-link" data-widget="control-sidebar" data-slide="true" href="#" role="button" onClick={logout}>
                                Logout
                            </a>
                        </li>
                    </ul>
                ) : null
            )()}
        </nav>
    </Fragment>
  )
}

export default NavBar