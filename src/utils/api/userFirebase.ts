import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { toast } from "react-toastify";
import { firebaseAuth } from "../../config/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "axios";

interface UserInput {
  email: string;
  password: string;
}

const userSignUp = async (
  email: UserInput["email"],
  password: UserInput["password"],
  displayName: string
) => {
  return await createUserWithEmailAndPassword(firebaseAuth, email, password)
    .then((res) => {
      toast.success("User Signed Up successfully");

      updateProfile(res.user, {
        displayName: displayName,
      })
        .then(() => {})
        .catch(() => {
          toast.error("Error on sign up.");
        });
      
      sendEmailVerification(res.user);
      return "success";
      



    })
    .catch((error) => {
      const errorCode = error.code;
 
      if (errorCode === "auth/email-already-in-use") {
        return "Email already in use.";
      } else {
        return "Error signup";
      }
    });
};

const userLogin = async (
  email: UserInput["email"],
  password: UserInput["password"]
) => {
  let data: any = {};

  try {
    const response: any = await signInWithEmailAndPassword(
      firebaseAuth,
      email,
      password
    );

    const user = response.user;
    const userVerified = response.user.emailVerified;
    const accessToken = await user.getIdToken();
 
    data = {
      access: accessToken,
      refresh: 'refreshToken',
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName,
        verify: userVerified,
      },
    };

    return data;
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code == "auth/invalid-credential") {
        return { error: "Email or Password Incorrect" };
      } else {
        return { error: "Error occurred, Please try again!" };
      }
    } else {
      return { error: "Error occurred, Please try again!!" };
    }
  }

  return data;
};

const userGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();

  let data: any = {};

  try {
    // signInWithRedirect
    const result: any = await signInWithPopup(firebaseAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    const user = result.user;

    const userIdToken = await user.getIdToken();

    if (credential) {
      data = {
        access: userIdToken,
        refresh: "",
        user: {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          verify: true
        },
      };
    }
 

    return data;
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message; 
    const credentialError = GoogleAuthProvider.credentialFromError(error);

    if (credentialError || errorCode || errorMessage) {
      return { error: "Error Occurred, Try Again!" };
    }
    data = { error: "error ocurred" };
    return data;
  }
};

const userResetPassword = async (payload: any) => {
  try {
    await sendPasswordResetEmail(firebaseAuth, payload);
    return { message: "success" };
  } catch (err) {
    return { error: err, message: "failed" };
  }
};

// Get the resetCode from the URL
const handleResetPassword = async (payload: string) => {
  const query = new URLSearchParams(location.search);
  const resetCode = query.get("oobCode"); // Firebase sends the code via query parameter

  try {
    if (!resetCode) {
      //   throw new Error('Invalid password reset link.');

      throw new Error("Invalid password reset link.");
    }
    return await confirmPasswordReset(firebaseAuth, resetCode, payload);
  } catch (err: any) {
    return err;
  }
};

const userSignInBK = async (payload: any) => {
  return axios.post("http://localhost:3000/api/auth/login", payload);
};

const userSignUpBK = async (payload: any) => {
  return axios.post("http://localhost:3000/api/auth/register", payload);
};

export {
  userSignUp,
  userLogin,
  userGoogleSignIn,
  userResetPassword,
  handleResetPassword,
  userSignInBK,
  userSignUpBK,
};
