import React from 'react';
import { Outlet,Navigate } from 'react-router-dom';

const AuthLayout = () => {
    const isAuthenticated=false;

    return (
        <>
            {isAuthenticated?
            (<Navigate to="/"/>):(
                <>
                    <section className='flex flex-1 justify-center items-center flex-col py-10'>
                        {/* outlet means the content that has to be rendered for the page that we are on */}
                        <Outlet/>
                    </section>

                    <img className='hidden xl:block h-screen w-1/2 object-cover bg-no-repeat'
                     src='/assets/images/side-img.svg'
                    />
                </>
            )
            }
        </>
    )
}

export default AuthLayout