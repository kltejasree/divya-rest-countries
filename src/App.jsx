import { useState, useEffect } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import RegionFilter from "./components/RegionFilter";
import CountryList from "./components/CountryList";
import CountryDetails from "./components/CountryDetails";

const App = () => {
  const API_KEY = import.meta.env.VITE_REST_COUNTRIES_API_KEY;

  const [countries, setCountries] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion]=useState("");
  const [selectedCountry, setSelectedCountry]=useState(null);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const fields =
          "names,codes.alpha_2,flag.description,population,region,subregion,tlds,currencies,languages,borders,capitals"

        const limit = 100;
        let offset = 0;
        let allCountries = [];

        while (true) {
          const res = await fetch(
            `https://api.restcountries.com/countries/v5?response_fields=${fields}&limit=${limit}&offset=${offset}`,
            {
              headers: {
                Authorization: `Bearer ${API_KEY}`,
              },
            },
          );

          if (!res.ok) {
            throw new Error("Failed to fecth countries");
          }

          const data = await res.json();

          const pageCountries = data.data.objects;

          allCountries = [...allCountries, ...pageCountries];

          if (pageCountries.length < limit) {
            break;
          }

          offset += limit;
        }
        const countriesWithFlags = allCountries.filter(
          (country) =>
            country.codes?.alpha_2 && country.codes.alpha_2.trim() !== "",
        );

        setCountries(countriesWithFlags);
      } catch (error) {
        console.error("Error fetching countries", error);
      }
    };

    fetchCountries();
  }, []);

  const filteredCountries = countries.filter((country) =>{
  
    const matchSearch=country.names.common.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRegion= selectedRegion===""|| country.region===selectedRegion;
  
    return matchRegion && matchSearch;
  }
  );

  return (
    <div className={darkMode?"dark":""}>
      <div
        className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white"
      >
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mx-auto max-w-360 px-6 py-3">
          

          {selectedCountry?(
            <CountryDetails
              country={selectedCountry}
              onBack={()=>setSelectedCountry(null)}/>
              
          ):(
            <>
             <div className="flex items-center justify-between ">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <RegionFilter selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion}/>
          </div>
            <CountryList countries={filteredCountries} 
            onCountryClick={(country)=>setSelectedCountry(country)}
            />
            </>
          )}

          
          
        </main>
      </div>
    </div>
  );
};

export default App;
