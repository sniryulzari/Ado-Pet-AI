import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { FaDog, FaCat, FaHorse } from "react-icons/fa";
import { GiDolphin, GiTigerHead } from "react-icons/gi";
import Spinner from "../components/Spinner";
import SearchPetCard from "../components/Search-PetCard";
import Footer from "../components/Footer";
import { searchPets } from "../api/pets";
import { toast } from "react-toastify";

const PETS_PER_PAGE = 9;

const INITIAL_FILTERS = {
  name: "",
  type: "",
  status: "",
  minHeight: "",
  maxHeight: "",
};

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current]);
  if (current > 1) set.add(current - 1);
  if (current < total) set.add(current + 1);
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}

const SearchPets = () => {
  const [allPets, setAllPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    name:      searchParams.get("name")      ?? "",
    type:      searchParams.get("type")      ?? "",
    status:    searchParams.get("status")    ?? "",
    minHeight: searchParams.get("minHeight") ?? "",
    maxHeight: searchParams.get("maxHeight") ?? "",
  });
  const [page, setPage] = useState(Math.max(1, Number(searchParams.get("page")) || 1));

  const gridRef = useRef(null);

  // Load all pets once on mount
  useEffect(() => {
    searchPets({})
      .then((res) => setAllPets(res.data))
      .catch(() => toast.error("Failed to load pets. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  // Persist filters + page to URL so navigating back restores state
  useEffect(() => {
    const params = {};
    if (filters.name)      params.name      = filters.name;
    if (filters.type)      params.type      = filters.type;
    if (filters.status)    params.status    = filters.status;
    if (filters.minHeight) params.minHeight = filters.minHeight;
    if (filters.maxHeight) params.maxHeight = filters.maxHeight;
    if (page > 1)          params.page      = String(page);
    setSearchParams(params, { replace: true });
  }, [filters, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredPets = useMemo(() => {
    const nameQ      = filters.name.trim().toLowerCase();
    const minH       = filters.minHeight !== "" ? Number(filters.minHeight) : null;
    const maxH       = filters.maxHeight !== "" ? Number(filters.maxHeight) : null;

    return allPets.filter((pet) => {
      if (nameQ && !pet.name.toLowerCase().includes(nameQ)) return false;
      if (filters.type   && pet.type           !== filters.type)   return false;
      if (filters.status && pet.adoptionStatus !== filters.status) return false;
      if (minH !== null && pet.height < minH) return false;
      if (maxH !== null && pet.height > maxH) return false;
      return true;
    });
  }, [allPets, filters]);

  const totalPages   = Math.max(1, Math.ceil(filteredPets.length / PETS_PER_PAGE));
  const safePage     = Math.min(page, totalPages);
  const startIndex   = (safePage - 1) * PETS_PER_PAGE;
  const paginatedPets = filteredPets.slice(startIndex, startIndex + PETS_PER_PAGE);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function toggleType(type) {
    updateFilter("type", filters.type === type ? "" : type);
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  const hasActiveFilters =
    filters.name || filters.type || filters.status || filters.minHeight || filters.maxHeight;

  const typeIconProps = (type) => ({
    className: `pet-icon ${type.toLowerCase()}-icon`,
    size: "3.5em",
    title: type,
    style: filters.type === type
      ? { border: "2px solid #393d72", borderRadius: "16px", padding: "0.4rem", background: "rgba(57,61,114,0.06)" }
      : { border: "2px solid transparent", padding: "0.4rem" },
    onClick: () => toggleType(type),
  });

  return (
    <div className="search-page-container">
      <div className="search-container">
        <div className="search-header">
          <h1 className="search-header-text">Browse Pets</h1>
        </div>

        {/* ── Filter bar ── */}
        <div className="browse-filter-bar">

          {/* Row 1: type icons */}
          <div className="browse-type-row">
            <span className="browse-filter-label">Type</span>
            <div className="browse-type-icons">
              <button
                className={`browse-type-all-btn${filters.type === "" ? " active" : ""}`}
                onClick={() => updateFilter("type", "")}
              >
                All
              </button>
              <FaDog       {...typeIconProps("Dog")} />
              <FaCat       {...typeIconProps("Cat")} />
              <FaHorse     {...typeIconProps("Horse")} />
              <GiDolphin   {...typeIconProps("Dolphin")} />
              <GiTigerHead {...typeIconProps("Tiger")} />
            </div>
          </div>

          {/* Row 2: text/select/range controls */}
          <div className="browse-filter-row">
            <div className="browse-filter-group">
              <label className="browse-filter-label">Search by name</label>
              <input
                type="text"
                className="browse-filter-input"
                placeholder="e.g. Buddy"
                value={filters.name}
                onChange={(e) => updateFilter("name", e.target.value)}
              />
            </div>

            <div className="browse-filter-group">
              <label className="browse-filter-label">Status</label>
              <select
                className="browse-filter-select"
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
              >
                <option value="">All</option>
                <option value="Available">Available</option>
                <option value="Adopted">Adopted</option>
                <option value="Fostered">Fostered</option>
              </select>
            </div>

            <div className="browse-filter-group">
              <label className="browse-filter-label">Height (cm)</label>
              <div className="browse-range-inputs">
                <input
                  type="number"
                  className="browse-filter-input browse-range-input"
                  placeholder="Min"
                  min={0}
                  value={filters.minHeight}
                  onChange={(e) => updateFilter("minHeight", e.target.value)}
                />
                <span className="browse-range-sep">–</span>
                <input
                  type="number"
                  className="browse-filter-input browse-range-input"
                  placeholder="Max"
                  min={0}
                  value={filters.maxHeight}
                  onChange={(e) => updateFilter("maxHeight", e.target.value)}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <button className="browse-clear-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="browse-result-count">
            Showing <strong>{filteredPets.length}</strong> pet{filteredPets.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        <section ref={gridRef} className="browse-grid-section">
          {loading ? (
            <Spinner />
          ) : filteredPets.length === 0 ? (
            <div className="browse-empty-state">
              <div className="browse-empty-paw">🐾</div>
              <h2 className="browse-empty-title">No pets found</h2>
              <p className="browse-empty-text">
                Try adjusting your filters or{" "}
                <button className="browse-empty-reset" onClick={clearFilters}>
                  clear all filters
                </button>{" "}
                to see all available pets.
              </p>
            </div>
          ) : (
            <>
              <Row xs={1} md={2} lg={3} className="search-pet-results g-4">
                {paginatedPets.map((pet) => (
                  <Col key={pet._id} className="pet-card-result">
                    <SearchPetCard {...pet} id={pet._id} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="browse-pagination">
                  <button
                    className="browse-page-btn browse-page-nav"
                    onClick={() => handlePageChange(safePage - 1)}
                    disabled={safePage <= 1}
                  >
                    ← Prev
                  </button>

                  {getPageNumbers(safePage, totalPages).map((item, idx) =>
                    item === "…" ? (
                      <span key={`ellipsis-${idx}`} className="browse-page-ellipsis">…</span>
                    ) : (
                      <button
                        key={item}
                        className={`browse-page-btn${item === safePage ? " active" : ""}`}
                        onClick={() => handlePageChange(item)}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    className="browse-page-btn browse-page-nav"
                    onClick={() => handlePageChange(safePage + 1)}
                    disabled={safePage >= totalPages}
                  >
                    Next →
                  </button>

                  <span className="browse-page-indicator">
                    Page {safePage} of {totalPages}
                  </span>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPets;
