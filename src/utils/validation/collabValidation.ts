import * as yup from "yup";

// Define the ForgotPassword validation schema
const addCollaborationValidation = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Required"),
  role: yup.string(),
});

export {
    addCollaborationValidation
}