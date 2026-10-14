import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getSensorData = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/sensor_data?select=*&order=created_at.desc&limit=20`,
        {
          headers: {
            apikey: SUPABASE_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      setData(result);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data dari Supabase.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSensorData();

    // Refresh setiap 5 detik
    const interval = setInterval(getSensorData, 5000);

    return () => clearInterval(interval);
  }, []);

  // Data terbaru
  const latest = data[0];

  // Grafik dari data lama → terbaru
  const chartData = [...data]
    .reverse()
    .map((item) => ({
      time: new Date(item.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      temperature: Number(item.temperature),
      humidity: Number(item.humidity),
    }));

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>IoT Monitoring</h1>
          <p>Monitoring Suhu & Kelembapan Lab RPL</p>
        </div>

        <div className="status">
          <span></span>
          Online
        </div>
      </header>

      {loading && data.length === 0 && (
        <div className="loading">Memuat data sensor...</div>
      )}

      {error && <div className="error">{error}</div>}

      {latest && (
        <>
          {/* Kartu data terbaru */}
          <section className="cards">
            <div className="card temperature">
              <div className="card-icon">🌡️</div>
              <div>
                <p>Suhu</p>
                <h2>{Number(latest.temperature).toFixed(2)} °C</h2>
              </div>
            </div>

            <div className="card humidity">
              <div className="card-icon">💧</div>
              <div>
                <p>Kelembapan</p>
                <h2>{Number(latest.humidity).toFixed(2)} %</h2>
              </div>
            </div>
          </section>

          {/* Waktu data terakhir */}
          <div className="last-update">
            <span>Data terakhir diperbarui:</span>
            <strong>
              {new Date(latest.created_at).toLocaleString("id-ID")}
            </strong>
          </div>

          {/* Grafik */}
          <section className="section">
            <div className="section-header">
              <div>
                <h2>Grafik Monitoring</h2>
                <p>Riwayat 20 data sensor terakhir</p>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="time" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="temperature"
                    name="Suhu (°C)"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />

                  <Line
                    type="monotone"
                    dataKey="humidity"
                    name="Kelembapan (%)"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Tabel riwayat */}
          <section className="section">
            <div className="section-header">
              <div>
                <h2>Riwayat Data Sensor</h2>
                <p>Data terbaru ditampilkan paling atas</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Suhu</th>
                    <th>Kelembapan</th>
                    <th>Waktu</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>
                          {Number(item.temperature).toFixed(2)} °C
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {Number(item.humidity).toFixed(2)} %
                        </strong>
                      </td>

                      <td>
                        {new Date(item.created_at).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default App;