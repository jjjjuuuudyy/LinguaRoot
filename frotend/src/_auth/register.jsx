import RegisterForm from '../../components/_auth/registerForm'
import "../../static/css/_auth/index_register.css"

const App = ({ }) => {
    return (
        <>
            <div className='register-page'>
                <RegisterForm />
            </div>
        </>
    );
};
export default App;