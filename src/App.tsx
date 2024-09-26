import AuthLayout from './_auth/AuthLayout';
import SignInForm from './_auth/forms/SignInForm';
import SignUpForm from './_auth/forms/SignUpForm';
import { Home } from './_root/pages';
import RootLayout from './_root/RootLayout';
import './global.css';
import { Route,Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"


const App = () => {
    return (
        <main className='flex h-screen'>
            <Routes>
                {/* Public Routes -everyone can see */}
                <Route element={<AuthLayout/>}>
                    <Route path='/sign-in' element={<SignInForm/>}/>
                    <Route path='/sign-up' element={<SignUpForm/>}/>
                </Route>
                

                {/* Private Routes -only logged in users */}
                <Route element={<RootLayout/>}>
                    <Route index element={<Home/>}/>
                </Route>
            </Routes>
            <Toaster/>
        </main>
    )
}

export default App;