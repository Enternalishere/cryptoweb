import { useRouter } from 'next/router';

export default function CryptoDetail({ crypto }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">{id.toUpperCase()} Details</h1>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Current Stats</h2>
        <p>Price: ${crypto.market_data.current_price.usd}</p>
        <p>24h Change: {crypto.market_data.price_change_percentage_24h.toFixed(2)}%</p>
        <p>Market Cap: ${crypto.market_data.market_cap.usd.toLocaleString()}</p>
        <h2 className="text-xl font-semibold mt-4 mb-2">Historical Data (Last 7 Days)</h2>
        <table className="w-full text-left">
          <thead>
            <tr><th>Date</th><th>Price (USD)</th></tr>
          </thead>
          <tbody>
            {crypto.market_data.price_history.map(([timestamp, price], i) => (
              <tr key={i}><td>{new Date(timestamp).toLocaleDateString()}</td><td>${price.toFixed(2)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${params.id}?market_data=true`);
  const data = await res.json();
  const historyRes = await fetch(`https://api.coingecko.com/api/v3/coins/${params.id}/market_chart?vs_currency=usd&days=7`);
  const historyData = await historyRes.json();
  data.market_data.price_history = historyData.prices.slice(-7); // Last 7 days
  return { props: { crypto: data } };
}