import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Col, Row } from "react-bootstrap";
import { UsersContext } from "../Context/Context-Users";
import SearchPetCard from "../components/Search-PetCard";
import { getAdoptedPetInfo, getFosteredPetInfo } from "../api/pets";
import { toast } from "react-toastify";

function AdminUserPets() {
  const [pets, setPets]     = useState([]);
  const [loading, setLoading] = useState(true);

  const { userPets } = useContext(UsersContext);
  const navigate = useNavigate();

  useEffect(() => {
    const { adoptPet = [], fosterPet = [] } = userPets;

    // Fixed: was two separate sequential for-loops (N+1). Now all pet fetches
    // run in parallel and state is set once after all responses arrive.
    Promise.all([
      ...adoptPet.map((id) => getAdoptedPetInfo(id)),
      ...fosterPet.map((id) => getFosteredPetInfo(id)),
    ])
      .then((results) => setPets(results.map((r) => r.data).filter((d) => d?._id)))
      .catch(() => toast.error("Failed to load user's pets."))
      .finally(() => setLoading(false));
  }, [userPets]);

  if (loading) return <div className="admin-user-pets-container"><p>Loading...</p></div>;

  return (
    <div className="admin-user-pets-container">
      <button className="back-button" onClick={() => navigate(-1)}><IoArrowBack size="1.1em" /></button>
      <h1 className="my-pets-header">
        Pets owned by {userPets.firstName} {userPets.lastName}
      </h1>
      <Row xs={1} md={2} lg={3} xl={4} className="search-pet-results">
        {pets.map((pet) => (
          <Col
            key={pet._id}
            onClick={() => navigate(`/petcard?petId=${pet._id}`)}
            className="search-pet-results-column"
          >
            <SearchPetCard {...pet} id={pet._id} />
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default AdminUserPets;
