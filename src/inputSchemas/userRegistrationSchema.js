const yup = require('yup');


// Yup schema for user registration validation
 const userRegistrationSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters long'),
  email: yup.string().required('Email is required').email('Must be a valid email'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
  role: yup.string().required('Role is required').oneOf(['admin', 'manager', 'user'], 'Role must be either admin, manager, or user'),
});

module.exports= {userRegistrationSchema}