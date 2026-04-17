import React, { useContext } from "react";
import { PetContext } from "../Context/Context-Pets";
import { Row, Col } from "react-bootstrap";
import SearchPetCard from "./Search-PetCard";

function SearchPetsCardList() {
  const { petSearchRes } = useContext(PetContext);

  return (
    <section>
      <Row xs={1} md={2} lg={3} xl={4} className="search-pet-results g-4">
        {petSearchRes.map((pet, i) => (
          <Col key={pet._id} className="pet-card-result">
            {/* Spread the pet object instead of passing 11 individual props */}
            <SearchPetCard {...pet} id={pet._id} index={i} />
          </Col>
        ))}
      </Row>
    </section>
  );
}

export default SearchPetsCardList;
