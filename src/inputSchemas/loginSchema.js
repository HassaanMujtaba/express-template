const yup = require('yup');


 const loginSchema = yup.object().shape({
  credentials: yup.string().required('Email or username is required'),
  password: yup.string().required('Password is required'),
});

module.exports={loginSchema}