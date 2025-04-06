import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setWeather, setCrypto, setNews, addNotification, setLoading, setError, addFavorite } from '../redux/store';
import Link from 'next/link';
import io from 'socket.io-client';

async function fetchData(url, dispatch, action, errorMsg) {
  dispatch(setLoading(true));
  try {
    const res = await fetch(url);
    const data = await res.json();
    dispatch(action(data));
  } catch (err) {
    dispatch(setError(errorMsg));
  } finally {
    dispatch(setLoading(false));
  }
}

function useWebSocket() {
  const dispatch = useDispatch();
  const crypto = useSelector((state) => state.crypto);
  useEffect(() => {
    const socket = io('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana');
    socket.on('message', (data) => {
      const parsed = JSON.parse(data);
      Object.entries(parsed).forEach(([id, price]) => {
        const prevPrice = crypto[id]?.price || price;
        const_endian = price - prevPrice;
        if (Math.abs(change) > 50) {
          dispatch(addNotification({
            type: 'price_alert',
            message: `${id.toUpperCase()} price changed by $${change.toFixed(2)} to $${price}`,
          }));
        }
      });
    });

    // Simulate weather alerts
    const weatherAlertInterval = setInterval(() => {
      dispatch(addNotification({
        type: 'weather_alert',
        message: 'Storm warning in Tokyo!',
      }));
    }, 60000);

    return () => {
      socket.disconnect();
      clearInterval(weatherAlertInterval);
    };
  }, [dispatch, crypto]);
}

export default function Home() {
  const dispatch = useDispatch();
  const { weather, crypto, news, favorites, notifications, loading, error } = useSelector((state) => state);

  useWebSocket();

  useEffect(() => {
    const cities = ['New York', 'London', 'Tokyo'];
    Promise.all(cities.map(city =>
      fetchData(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`,
        dispatch,
        (data) => setWeather({ ...weather, [city]: { temp: data.main.temp, humidity: data.main.humidity, condition: data.weather[0].main } }),
        `Failed to fetch weather for ${city}`
      )
    ));

    fetchData(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana',
      dispatch,
      (data) => setCrypto(Object.fromEntries(data.map(c => [c.id, { price: c.current_price, change: c.price_change_percentage_24h, marketCap: c.market_cap }]))),
      'Failed to fetch crypto data'
    );

    fetchData(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_API_KEY}&q=cryptocurrency`,
      dispatch,
      (data) => setNews(data.results.slice(0, 5)),
      'Failed to fetch news'
    );

    const interval = setInterval(() => {
      cities.forEach(city => fetchData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`, dispatch, (data) => setWeather({ ...weather, [city]: { temp: data.main.temp, humidity: data.main.humidity, condition: data.weather[0].main } }), `Failed to fetch weather for ${city}`));
      fetchData('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana', dispatch, (data) => setCrypto(Object.fromEntries(data.map(c => [c.id, { price: c.current_price, change: c.price_change_percentage_24h, marketCap: c.market_cap }]))), 'Failed to fetch crypto data');
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleFavorite = (type, item) => {
    if (!favorites[type].includes(item)) dispatch(addFavorite({ type, item }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">CryptoWeather Nexus</h1>

      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {notifications.slice(0, 3).map((n, i) => (
            <div key={i} className={`p-2 rounded shadow text-white ${n.type === 'price_alert' ? 'bg-blue-500' : 'bg-red-500'}`}>
              {n.message}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Weather</h2>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {Object.entries(weather).map(([city, data]) => (
            <div key={city} className="mb-2">
              <Link href={`/city/${city}`} className="text-blue-500 hover:underline">{city}</Link>: {data.temp}°C, {data.humidity}%, {data.condition}
              <button onClick={() => handleFavorite('cities', city)} className="ml-2 text-blue-500 hover:underline focus:ring-2 focus:ring-blue-300">Favorite</button>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Cryptocurrency</h2>
          {Object.entries(crypto).map(([id, data]) => (
            <div key={id} className="mb-2">
              <Link href={`/crypto/${id}`} className="text-blue-500 hover:underline">{id.toUpperCase()}</Link>: ${data.price}, 24h: {data.change.toFixed(2)}%, Market Cap: ${data.marketCap.toLocaleString()}
              <button onClick={() => handleFavorite('cryptos', id)} className="ml-2 text-blue-500 hover:underline focus:ring-2 focus:ring-blue-300">Favorite</button>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">News</h2>
          {news.map((article, i) => (
            <p key={i} className="mb-1"><a href={article.link} target="_blank" className="text-blue-500 hover:underline">{article.title}</a></p>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Favorites</h2>
        <p>Cities: {favorites.cities.map(city => <Link key={city} href={`/city/${city}`} className="text-blue-500 hover:underline">{city}</Link>).reduce((prev, curr) => [prev, ', ', curr], []).slice(0, -1) || 'None'}</p>
        <p>Cryptos: {favorites.cryptos.map(id => <Link key={id} href={`/crypto/${id}`} className="text-blue-500 hover:underline">{id.toUpperCase()}</Link>).reduce((prev, curr) => [prev, ', ', curr], []).slice(0, -1) || 'None'}</p>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}