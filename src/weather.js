import axios from "axios";
import dotenv from "dotenv";
import express from 'express';

dotenv.config();

const apiKey = process.env.API_KEY;
const app = express();

app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.get('/weather',(req,res)=>{
  res.render('weather');
});

app.post('/weather', async (req,res)=>{
  const cityName = req.body.cityName;
  console.log(cityName);

  if(cityName){
    try {
      const cityId = await getCityId(cityName);
      console.log(cityId, 'City ID');
      if (cityId) {
        const weatherData = await getWeather(cityId);
        console.log(weatherData, 'Weather Data');
        res.json({ response: weatherData });
      } else {
        res.status(404).json({ error: 'City not found' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(400).json({ error: 'City name is required' });
  }
});

async function getCityId(cityName) {
  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/find?q=${cityName}&appid=${apiKey}`);
    return response.data.list[0]?.id;
  } catch (error) {
    console.error('Error fetching city ID:', error);
    throw error;
  }
}

async function getWeather(cityId) {
  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${apiKey}`);
    return response.data.list.map((forecast) => {
      const temperatureKelvin = forecast.main.temp;
      const temperatureCelsius = temperatureKelvin - 273.15;
      const weatherConditions = forecast.weather.map((condition) => condition.main).join(", ");
      return { temperature: temperatureCelsius.toFixed(2), weather: weatherConditions };
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

app.listen(4000, () => {
  console.log('http://localhost:4000/weather');
});