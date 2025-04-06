import { useRouter } from 'next/router';

export default function CityDetail({ weather }) {
  const router = useRouter();
  const { city } = router.query;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">{city} Weather Details</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Current Weather</h2>
        <p>Temperature: {weather.current.temp}°C</p>
        <p>Humidity: {weather.current.humidity}%</p>
        <p>Condition: {weather.current.weather[0].main}</p>
        <h2 className="text-xl font-semibold mt-4 mb-2">Hourly Forecast (Simplified)</h2>
        <table className="w-full text-left">
          <thead>
            <tr><th>Hour</th><th>Temp (°C)</th><th>Condition</th></tr>
          </thead>
          <tbody>
            {weather.hourly.slice(0, 5).map((h, i) => (
              <tr key={i}><td>{new Date(h.dt * 1000).getHours()}:00</td><td>{h.temp}</td><td>{h.weather[0].main}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latLon[params.city].lat}&lon=${latLon[params.city].lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`);
  const data = await res.json();
  return {
    props: {
      weather: {
        current: data.current,
        hourly: data.hourly,
      },
    },
  };
}

const latLon = {
  'New York': { lat: 40.7128, lon: -74.0060 },
  'London': { lat: 51.5074, lon: -0.1278 },
  'Tokyo': { lat: 35.6762, lon: 139.6503 },
};