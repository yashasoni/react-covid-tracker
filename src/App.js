import React, {useEffect, useState} from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card, CardContent
} from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import  {sortData, prettyPrintStat} from './util';
import LineGraph from './LineGraph';
import './App.css';
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796})
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");
  const [mapCountries, setMapCountries] = useState([])
  //https://disease.sh/v3/covid-19/countries
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data)
    })
  }, [])
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2
        }))
        const sortedData = sortData(data)
        setTableData(sortedData)
        setCountries(countries)
        setMapCountries(data)
      })
    }
    getCountriesData();
  }, [])
  const onCountryChange = async (event)=>{
    const countryCode = event.target.value;
    //console.log("yoooo", countryCode);
    
    const url = countryCode === 'worldwide' 
    ? 'https://disease.sh/v3/covid-19/all' 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    
    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode)
      setCountryInfo(data)
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  }
  console.log(countryInfo);
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" onChange={onCountryChange} value={country}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              )) }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox 
            isRed
            active={casesType==="cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases" 
            cases={prettyPrintStat(countryInfo.todayCases)} 
            total={prettyPrintStat(countryInfo.cases)}/>
          <InfoBox 
            onClick={(e) => setCasesType("recovered")}
            active={casesType==="recovered"}
            title="Recovered" 
            cases={prettyPrintStat(countryInfo.todayRecovered)} 
            total={prettyPrintStat(countryInfo.recovered)}/>
          <InfoBox 
            isRed
            onClick={(e) => setCasesType("deaths")}
            active={casesType==="deaths"}
            title="Deaths" 
            cases={prettyPrintStat(countryInfo.todayDeaths)} 
            total={prettyPrintStat(countryInfo.deaths)}/>
        </div>
        
        {/* Map */}
        <Map
        casesType={casesType}
        countries = {mapCountries}
        center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live cases by countries</h3>
          {/* Table */}
          <Table countries = {tableData} />
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          {/* Graph */}
          <LineGraph className="app__graph" casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
      
  );
}

export default App;
