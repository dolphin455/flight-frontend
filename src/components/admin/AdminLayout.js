import React from 'react'
import { Outlet } from 'react-router-dom'

function AdminLayout() {
    
    return (
        <>
            <div className='content-wrapper'>
                <div className="content-header">
                    <div className="container-fluid">
                        <div className="row mb-2">
                            
                        </div>
                    </div>
                </div>
                <section className="content">
                    <div className="container-fluid">
                        <div className="row justify-content-center">
                            <Outlet />
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default AdminLayout