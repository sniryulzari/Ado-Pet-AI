import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Form, Col, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { PetContext } from "../Context/Context-Pets";
import { getPetById, editPet } from "../api/admin";
import Spinner from "../components/Spinner";

const INITIAL_STATE = {
  type: "", breed: "", name: "", adoptionStatus: "",
  height: "", weight: "", color: "", bio: "",
  hypoallergenic: "", dietaryRestrictions: "",
};

export default function AdminEditPet() {
  const { petId } = useContext(PetContext);
  const [newPetInfo, setNewPetInfo] = useState(INITIAL_STATE);
  const [petImage, setPetImage]     = useState(null);
  const [loading, setLoading]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    getPetById(petId)
      .then((res) => setNewPetInfo(res.data))
      .catch(() => toast.error("Failed to load pet details."))
      .finally(() => setLoading(false));
  }, [petId]);

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

      await editPet(formData);
      toast.success("Pet updated successfully!", { position: toast.POSITION.TOP_RIGHT });
      navigate("/admin-Dashboard");
    } catch {
      toast.error("Failed to update pet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="admin-edit-pet-container">
      <button className="back-button" onClick={() => navigate(-1)}><IoArrowBack size="1.1em" /></button>
      <div className="admin-edit-pet-header-container">
        <h1 className="admin-edit-pet-header">Edit Pet</h1>
        {newPetInfo.imageUrl && <img className="pet-img" src={newPetInfo.imageUrl} alt="pet" />}
      </div>
      <Form className="admin-add-pet-form">
        <Row className="edit-pet-row">
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select name="type" onChange={handlePetInfo} value={newPetInfo.type}>
              <option value="">Select Type of Pet</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Horse">Horse</option>
              <option value="Dolphin">Dolphin</option>
              <option value="Tiger">Tiger</option>
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Breed</Form.Label>
            <Form.Control name="breed" onChange={handlePetInfo} type="text" value={newPetInfo.breed} />
          </Form.Group>
        </Row>

        <Row className="edit-pet-row">
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" onChange={handlePetInfo} type="text" value={newPetInfo.name} />
          </Form.Group>
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Adoption Status</Form.Label>
            <Form.Select name="adoptionStatus" onChange={handlePetInfo} value={newPetInfo.adoptionStatus}>
              <option value="">Select Adoption Status</option>
              <option value="Adopted">Adopted</option>
              <option value="Fostered">Fostered</option>
              <option value="Available">Available</option>
            </Form.Select>
          </Form.Group>
        </Row>

        <Row className="edit-pet-row">
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Height (cm)</Form.Label>
            <Form.Control name="height" onChange={handlePetInfo} type="number" value={newPetInfo.height} />
          </Form.Group>
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Weight (kg)</Form.Label>
            <Form.Control name="weight" onChange={handlePetInfo} type="number" value={newPetInfo.weight} />
          </Form.Group>
        </Row>

        <Row className="edit-pet-row">
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Color</Form.Label>
            <Form.Select name="color" onChange={handlePetInfo} value={newPetInfo.color}>
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
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Bio</Form.Label>
            <Form.Control name="bio" onChange={handlePetInfo} as="textarea" rows={3} value={newPetInfo.bio} />
          </Form.Group>
        </Row>

        <Row className="edit-pet-row">
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Hypoallergenic</Form.Label>
            <Form.Select name="hypoallergenic" onChange={handlePetInfo} value={newPetInfo.hypoallergenic}>
              <option value="">Hypoallergenic?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Dietary Restrictions</Form.Label>
            <Form.Control name="dietaryRestrictions" onChange={handlePetInfo} type="text" value={newPetInfo.dietaryRestrictions} />
          </Form.Group>
        </Row>

        <Row className="edit-pet-row">
          <Form.Group as={Col} className="mb-3">
            <Form.Label>Replace Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={(e) => setPetImage(e.target.files[0])} />
          </Form.Group>
        </Row>

        <div className="add-pet-buttons-container">
          <button className="add-pet-buttons" type="submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner size="1.1rem" inline /> : "Save Changes"}
          </button>
          <button className="add-pet-buttons" type="button" onClick={() => navigate("/admin-Dashboard")} disabled={submitting}>Dashboard</button>
        </div>
      </Form>
    </div>
  );
}
