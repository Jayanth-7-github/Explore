import React, { useState, useEffect } from "react";

function App() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null); // New state for selected place
  const [editMode, setEditMode] = useState(false);
  const [editCity, setEditCity] = useState(null);
  const [editError, setEditError] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [addCity, setAddCity] = useState({
    name: "",
    radius: "",
    places: [{ id: 1, name: "", description: "" }],
  });
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetch("https://explore-2u3c.onrender.com/api/cities")
      .then((res) => res.json())
      .then((data) => setCities(data));
  }, []);

  // Filter cities by search (for home)
  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter places by search (when city selected)
  const filteredPlaces = selectedCity
    ? selectedCity.places.filter(
        (place) =>
          place.name.toLowerCase().includes(search.toLowerCase()) ||
          place.description.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Local edit state for place's restaurants/hotels
  const [editRestaurants, setEditRestaurants] = useState(false);
  const [editHotels, setEditHotels] = useState(false);
  const [restaurantsDraft, setRestaurantsDraft] = useState([]);
  const [hotelsDraft, setHotelsDraft] = useState([]);

  // When selectedPlace changes, reset edit states
  useEffect(() => {
    setEditRestaurants(false);
    setEditHotels(false);
    setRestaurantsDraft(selectedPlace?.restaurants || []);
    setHotelsDraft(selectedPlace?.hotels || []);
  }, [selectedPlace]);

  // Save handler for restaurants/hotels
  const handleSavePlaceEdits = async (type) => {
    if (!selectedCity || !selectedPlace) return;
    // Update the place in the city object
    const updatedCity = { ...selectedCity };
    updatedCity.places = updatedCity.places.map((p) =>
      p.id === selectedPlace.id
        ? {
            ...p,
            restaurants:
              type === "restaurants" ? restaurantsDraft : p.restaurants,
            hotels: type === "hotels" ? hotelsDraft : p.hotels,
          }
        : p
    );
    try {
      const res = await fetch(
        `https://explore-2u3c.onrender.com/api/cities/${updatedCity.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedCity),
        }
      );
      if (!res.ok) {
        alert("Failed to update place");
        return;
      }
      const updated = await res.json();
      setCities((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      setSelectedCity(updated);
      const newPlace = updated.places.find((p) => p.id === selectedPlace.id);
      setSelectedPlace(newPlace);
      if (type === "restaurants") setEditRestaurants(false);
      if (type === "hotels") setEditHotels(false);
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🗺️ Explore Famous Places in Indian Cities
      </h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder={
            selectedCity
              ? `Search in ${selectedCity.name}...`
              : "Search for a city..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Home: Show city cards and Add City button */}
      {!selectedCity && !addMode && (
        <>
          <div className="flex justify-end max-w-5xl mx-auto mb-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => {
                setAddMode(true);
                setAddCity({
                  name: "",
                  radius: "",
                  places: [{ id: 1, name: "", description: "" }],
                });
                setAddError("");
              }}
            >
              + Add City
            </button>
          </div>
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setSelectedCity(city);
                    setSearch("");
                  }}
                  className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center hover:shadow-2xl transition-shadow border-2 border-transparent hover:border-blue-400 focus:outline-none"
                >
                  <div className="text-4xl mb-2">🏙️</div>
                  <h2 className="text-xl font-bold mb-1">{city.name}</h2>
                  <span className="text-gray-500 text-xs mt-1">
                    Famous Places
                  </span>
                  {/* <p className="text-gray-600 text-sm">{city.radius}</p> */}
                  <span className="mt-3 text-blue-600 font-medium">
                    View Places
                  </span>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No cities found.
              </div>
            )}
          </div>
        </>
      )}

      {/* Add City Form */}
      {!selectedCity && addMode && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-6">
          <h2 className="text-xl font-bold mb-4 text-center">Add New City</h2>
          {addError && (
            <div className="mb-4 text-red-600 text-center">{addError}</div>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAddError("");
              try {
                const res = await fetch("https://explore-2u3c.onrender.com/api/cities", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(addCity),
                });
                if (!res.ok) {
                  const err = await res.json();
                  setAddError(err.error || "Failed to add city");
                  return;
                }
                const newCity = await res.json();
                setCities((prev) => [...prev, newCity]);
                setAddMode(false);
                setAddCity({
                  name: "",
                  radius: "",
                  places: [{ id: 1, name: "", description: "" }],
                });
              } catch (err) {
                setAddError("Network error");
              }
            }}
          >
            <div className="mb-4">
              <label className="block font-medium mb-1">City Name</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={addCity.name}
                onChange={(e) =>
                  setAddCity({ ...addCity, name: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Radius</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={addCity.radius}
                onChange={(e) =>
                  setAddCity({ ...addCity, radius: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Places</label>
              {addCity.places.map((place, idx) => (
                <div key={place.id} className="mb-2 flex gap-2 items-center">
                  <input
                    className="border px-2 py-1 rounded flex-1"
                    value={place.name}
                    onChange={(e) => {
                      const newPlaces = [...addCity.places];
                      newPlaces[idx] = {
                        ...newPlaces[idx],
                        name: e.target.value,
                      };
                      setAddCity({ ...addCity, places: newPlaces });
                    }}
                    required
                  />
                  <input
                    className="border px-2 py-1 rounded flex-1"
                    value={place.description}
                    onChange={(e) => {
                      const newPlaces = [...addCity.places];
                      newPlaces[idx] = {
                        ...newPlaces[idx],
                        description: e.target.value,
                      };
                      setAddCity({ ...addCity, places: newPlaces });
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="text-red-600 font-bold px-2"
                    onClick={() => {
                      const newPlaces = addCity.places.filter(
                        (_, i) => i !== idx
                      );
                      setAddCity({ ...addCity, places: newPlaces });
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                onClick={() => {
                  const maxId = addCity.places.reduce(
                    (max, p) => Math.max(max, p.id),
                    0
                  );
                  setAddCity({
                    ...addCity,
                    places: [
                      ...addCity.places,
                      { id: maxId + 1, name: "", description: "" },
                    ],
                  });
                }}
              >
                + Add Place
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add City
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setAddMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* City view: Show places for selected city */}
      {selectedCity && !editMode && !selectedPlace && (
        <div className="max-w-4xl mx-auto">
          <button
            className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            onClick={() => {
              setSelectedCity(null);
              setSearch("");
            }}
          >
            ← Back to Cities
          </button>
          <button
            className="mb-6 ml-4 px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition"
            onClick={() => {
              setEditMode(true);
              setEditCity({ ...selectedCity });
              setEditError("");
            }}
          >
            ✏️ Edit City
          </button>
          <h2 className="text-2xl font-bold mb-2 text-center">
            🚶 Famous Places in {selectedCity.name}
          </h2>
          <p className="text-center mb-6 font-medium">
            Please select a place to view all restaurants and hotels located
            within a 1 km radius.
          </p>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place) => (
                <button
                  key={place.id}
                  className="bg-white shadow-md p-4 rounded-xl hover:shadow-lg transition-shadow text-left"
                  onClick={() => setSelectedPlace(place)}
                >
                  <h3 className="text-lg font-semibold mb-1">{place.name}</h3>
                  <p className="text-gray-600">{place.description}</p>
                  <span className="text-blue-600 text-sm mt-2 inline-block">
                    View Restaurants & Hotels
                  </span>
                </button>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">
                No places found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Place details view: Show restaurants and hotels for selected place */}
      {selectedCity && selectedPlace && !editMode && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-6">
          <button
            className="mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            onClick={() => setSelectedPlace(null)}
          >
            ← Back to Places
          </button>
          <h2 className="text-2xl font-bold mb-2 text-center">
            {selectedPlace.name}
          </h2>
          <p className="text-center mb-4">{selectedPlace.description}</p>
          {/* Restaurants Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Nearby Restaurants</h3>
              {!editRestaurants && (
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => {
                    setEditRestaurants(true);
                    setRestaurantsDraft(selectedPlace.restaurants || []);
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            {editRestaurants ? (
              <div>
                {restaurantsDraft.map((r, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      className="border px-2 py-1 rounded flex-1"
                      value={r}
                      onChange={(e) => {
                        const arr = [...restaurantsDraft];
                        arr[i] = e.target.value;
                        setRestaurantsDraft(arr);
                      }}
                    />
                    <button
                      className="text-red-600 font-bold px-2"
                      onClick={() => {
                        setRestaurantsDraft(
                          restaurantsDraft.filter((_, idx) => idx !== i)
                        );
                      }}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  type="button"
                  onClick={() => setRestaurantsDraft([...restaurantsDraft, ""])}
                >
                  + Add Restaurant
                </button>
                <div className="flex gap-2 mt-3">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    type="button"
                    onClick={() => handleSavePlaceEdits("restaurants")}
                  >
                    Save
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    type="button"
                    onClick={() => {
                      setEditRestaurants(false);
                      setRestaurantsDraft(selectedPlace.restaurants || []);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedPlace.restaurants &&
              selectedPlace.restaurants.length > 0 ? (
              <ul className="list-disc list-inside">
                {selectedPlace.restaurants.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No restaurants listed.</div>
            )}
          </div>
          {/* Hotels Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Nearby Hotels</h3>
              {!editHotels && (
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => {
                    setEditHotels(true);
                    setHotelsDraft(selectedPlace.hotels || []);
                  }}
                >
                  Edit
                </button>
              )}
            </div>
            {editHotels ? (
              <div>
                {hotelsDraft.map((h, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      className="border px-2 py-1 rounded flex-1"
                      value={h}
                      onChange={(e) => {
                        const arr = [...hotelsDraft];
                        arr[i] = e.target.value;
                        setHotelsDraft(arr);
                      }}
                    />
                    <button
                      className="text-red-600 font-bold px-2"
                      onClick={() => {
                        setHotelsDraft(
                          hotelsDraft.filter((_, idx) => idx !== i)
                        );
                      }}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                  type="button"
                  onClick={() => setHotelsDraft([...hotelsDraft, ""])}
                >
                  + Add Hotel
                </button>
                <div className="flex gap-2 mt-3">
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    type="button"
                    onClick={() => handleSavePlaceEdits("hotels")}
                  >
                    Save
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    type="button"
                    onClick={() => {
                      setEditHotels(false);
                      setHotelsDraft(selectedPlace.hotels || []);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedPlace.hotels && selectedPlace.hotels.length > 0 ? (
              <ul className="list-disc list-inside">
                {selectedPlace.hotels.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">No hotels listed.</div>
            )}
          </div>
        </div>
      )}

      {/* Edit City Form */}
      {selectedCity && editMode && editCity && (
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-6">
          <h2 className="text-xl font-bold mb-4 text-center">Edit City</h2>
          {editError && (
            <div className="mb-4 text-red-600 text-center">{editError}</div>
          )}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setEditError("");
              try {
                const res = await fetch(
                  `https://explore-2u3c.onrender.com/api/cities/${editCity.id}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editCity),
                  }
                );
                if (!res.ok) {
                  const err = await res.json();
                  setEditError(err.error || "Failed to update city");
                  return;
                }
                const updated = await res.json();
                // Update cities in state
                setCities((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c))
                );
                setSelectedCity(updated);
                setEditMode(false);
              } catch (err) {
                setEditError("Network error");
              }
            }}
          >
            <div className="mb-4">
              <label className="block font-medium mb-1">City Name</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={editCity.name}
                onChange={(e) =>
                  setEditCity({ ...editCity, name: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Radius</label>
              <input
                className="w-full border px-3 py-2 rounded"
                value={editCity.radius}
                onChange={(e) =>
                  setEditCity({ ...editCity, radius: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Places</label>
              {editCity.places.map((place, idx) => (
                <div key={place.id} className="mb-2 flex gap-2 items-center">
                  <input
                    className="border px-2 py-1 rounded flex-1"
                    value={place.name}
                    onChange={(e) => {
                      const newPlaces = [...editCity.places];
                      newPlaces[idx] = {
                        ...newPlaces[idx],
                        name: e.target.value,
                      };
                      setEditCity({ ...editCity, places: newPlaces });
                    }}
                    required
                  />
                  <input
                    className="border px-2 py-1 rounded flex-1"
                    value={place.description}
                    onChange={(e) => {
                      const newPlaces = [...editCity.places];
                      newPlaces[idx] = {
                        ...newPlaces[idx],
                        description: e.target.value,
                      };
                      setEditCity({ ...editCity, places: newPlaces });
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="text-red-600 font-bold px-2"
                    onClick={() => {
                      const newPlaces = editCity.places.filter(
                        (_, i) => i !== idx
                      );
                      setEditCity({ ...editCity, places: newPlaces });
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                onClick={() => {
                  const maxId = editCity.places.reduce(
                    (max, p) => Math.max(max, p.id),
                    0
                  );
                  setEditCity({
                    ...editCity,
                    places: [
                      ...editCity.places,
                      { id: maxId + 1, name: "", description: "" },
                    ],
                  });
                }}
              >
                + Add Place
              </button>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
