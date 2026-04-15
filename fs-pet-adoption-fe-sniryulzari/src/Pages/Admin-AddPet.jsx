import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { addPet } from "../api/admin";
import Spinner from "../components/Spinner";

const INITIAL_STATE = {
  type: "", breed: "", name: "", adoptionStatus: "",
  height: "", weight: "", color: "", bio: "",
  hypoallergenic: "", dietaryRestrictions: "",
};

const AdminAddPet = () => {
  const [newPetInfo, setNewPetInfo] = useState(INITIAL_STATE);
  const [petImage, setPetImage]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handlePetInfo = (e) => {
    setNewPetInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(newPetInfo).forEach(([key, val]) => formData.append(key, val));
      if (petImage) formData.append("petImage", petImage);

      const res = await addPet(formData);
      if (res.data?.name) {
        setNewPetInfo(INITIAL_STATE);
        toast.success("Pet added successfully!", { position: toast.POSITION.TOP_RIGHT });
        navigate("/admin-Dashboard");
      }
    } catch {
      toast.error("Failed to add pet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-add-pet-container">
      <h1 className="admin-add-pet-header">Add Pet</h1>
      <Form className="admin-add-pet-form">
        <Row className="add-pet-row mb-3">
          <Form.Group as={Col} xs={12} sm={6} lg={4} className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" onChange={handlePetInfo}>
              <option value="">Select Type of Pet</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Horse">Horse</option>
              <option value="Dolphin">Dolphin</option>
              <option value="Tiger">Tiger</option>
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} lg={4} className="mb-3">
            <Form.Label>Breed</Form.Label>
            <Form.Control name="breed" onChange={handlePetInfo} type="text" placeholder="Breed of Pet" />
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} lg={4} className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" onChange={handlePetInfo} type="text" placeholder="Name" />
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} lg={4} className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Select name="color" onChange={handlePetInfo}>
              <option value="">Select Pet Color</option>
              <option value="White">White</option>
              <option value="Black">Black</option>
              <option value="Brown">Brown</option>
              <option value="Grey">Grey</option>
              <option value="Orange">Orange</option>
              <option value="Golden">Golden</option>
              <option value="MixColors">Mix Colors</option>
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} lg={4} className="mb-3">
            <Form.Label>Height (cm)</Form.Label>
            <Form.Control name="height" onChange={handlePetInfo} type="number" placeholder="Enter Height" />
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} lg={4} className="mb-3">
            <Form.Label>Weight (kg)</Form.Label>
            <Form.Control name="weight" onChange={handlePetInfo} type="number" placeholder="Enter Weight" />
          </Form.Group>
        </Row>

        <Row className="add-pet-row mb-3">
          <Form.Group as={Col} xs={12} sm={6} className="mb-3">
            <Form.Label>Hypoallergenic</Form.Label>
            <Form.Select name="hypoallergenic" onChange={handlePetInfo}>
              <option value="">Hypoallergenic?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} className="mb-3">
            <Form.Label>Adoption Status</Form.Label>
            <Form.Select name="adoptionStatus" onChange={handlePetInfo}>
              <option value="">Select Adoption Status</option>
              <option value="Adopted">Adopted</option>
              <option value="Fostered">Fostered</option>
              <option value="Available">Available</option>
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} xs={12} className="mb-3">
            <Form.Label>Dietary Restrictions</Form.Label>
            <Form.Control name="dietaryRestrictions" onChange={handlePetInfo} type="text" placeholder="Dietary Restrictions" />
          </Form.Group>
        </Row>

        <Row className="add-pet-row mb-3">
          <Form.Group as={Col} xs={12} sm={6} className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={(e) => setPetImage(e.target.files[0])} />
          </Form.Group>
          <Form.Group as={Col} xs={12} sm={6} className="mb-3">
            <Form.Label>Bio</Form.Label>
            <Form.Control name="bio" onChange={handlePetInfo} as="textarea" rows={3} placeholder="Bio" />
          </Form.Group>
        </Row>

        <div className="add-pet-buttons-container">
          <button className="add-pet-buttons" type="submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner size="1.1rem" inline /> : "Add Pet"}
          </button>
          <button className="add-pet-buttons" type="button" onClick={() => navigate("/admin-Dashboard")} disabled={submitting}>Dashboard</button>
        </div>
      </Form>
    </div>
  );
};

export default AdminAddPet;
