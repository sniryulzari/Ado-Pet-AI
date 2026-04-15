import { useContext, useState } from "react";
import { Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { UsersContext } from "../Context/Context-Users";
import { login, getUserInfo } from "../api/users";

function LoginForm({ handleLoginClose, handleShow }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const { setIsLoggedIn, setFirstName, setLastName, setIsAdmin } =
    useContext(UsersContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      if (res.data?.id) {
        // Fetch full user profile so we get isAdmin immediately — without this,
        // admin users would stay on isAdmin:false until the next page refresh.
        const infoRes = await getUserInfo();
        const user = infoRes.data;
        localStorage.setItem("userFirstName", JSON.stringify(user.firstName));
        localStorage.setItem("userLastName",  JSON.stringify(user.lastName));
        setIsLoggedIn(true);
        setIsAdmin(user.isAdmin === true);
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        handleLoginClose();
        toast.success("Login successful!", { position: toast.POSITION.BOTTOM_RIGHT });
      }
    } catch {
      toast.error("Invalid email or password.", { position: toast.POSITION.TOP_RIGHT });
    }
  };

  return (
    <Form className="loginForm">
      <h1 className="login-header">Welcome Back!</h1>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>
      <div className="login-modal-bottom">
        <div className="login-buttons">
          <button className="signup-login-btn" type="submit" onClick={handleLogin}>
            Log In
          </button>
          <button className="signup-login-btn" type="button" onClick={handleLoginClose}>
            Close
          </button>
        </div>
        <span className="link-signup" onClick={handleShow}>Not a member? Sign up</span>
      </div>
    </Form>
  );
}

export default LoginForm;
