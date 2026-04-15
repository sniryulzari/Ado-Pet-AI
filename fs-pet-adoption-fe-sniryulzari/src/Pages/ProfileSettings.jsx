import React, { useContext, useEffect, useState } from "react";
import { Form, FloatingLabel } from "react-bootstrap";
import { toast } from "react-toastify";
import { UsersContext } from "../Context/Context-Users";
import { getUserInfo, updateUserInfo } from "../api/users";

const ProfileSettings = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);
  const { setFirstName, setLastName } = useContext(UsersContext);

  useEffect(() => {
    getUserInfo()
      .then((res) => {
        const { firstName, lastName, phoneNumber, email, bio } = res.data;
        // Fixed: previously also fetched `password` (the bcrypt hash) and stored it
        // in state. Clients have no use for the hash — only the fields users can
        // actually change are populated here.
        setForm({ firstName, lastName, phoneNumber, email, bio, password: "" });
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserInfo(form);
      // Update the name displayed in the NavBar immediately after save
      setFirstName(form.firstName);
      setLastName(form.lastName);
      toast.success("Profile saved!");
    } catch {
      // Previously: silent catch with console.log — user had no idea if it worked
      toast.error("Failed to save profile. Please try again.");
    }
  };

  if (loading) return <div className="profile-settings-container"><p>Loading...</p></div>;

  return (
    <div className="profile-settings-container">
      <h1 className="profile-settings-header">Profile Settings</h1>
      <form className="profile-settings-form" onSubmit={handleSubmit}>
        <Form.Group className="profile-settings-field" controlId="formBasicFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control onChange={handleChange} name="firstName" type="text" value={form.firstName} />
        </Form.Group>

        <Form.Group className="profile-settings-field" controlId="formBasicLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control onChange={handleChange} name="lastName" type="text" value={form.lastName} />
        </Form.Group>

        <Form.Group className="profile-settings-field" controlId="formBasicPhoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control onChange={handleChange} name="phoneNumber" type="text" value={form.phoneNumber} />
        </Form.Group>

        <Form.Group className="profile-settings-field" controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control onChange={handleChange} name="email" type="email" value={form.email} />
        </Form.Group>

        <Form.Group className="profile-settings-field" controlId="formBasicPassword">
          <Form.Label>New Password (leave blank to keep current)</Form.Label>
          <Form.Control onChange={handleChange} name="password" type="password" value={form.password} />
        </Form.Group>

        <Form.Group className="profile-settings-field" controlId="formBasicTextarea">
          <Form.Label>Bio</Form.Label>
          <FloatingLabel controlId="floatingTextarea" className="profile-settings-field">
            <Form.Control as="textarea" placeholder="Tell us about yourself" onChange={handleChange} name="bio" value={form.bio} />
          </FloatingLabel>
        </Form.Group>

        <div className="profile-settings-button-container">
          <button className="profile-settings-button" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
