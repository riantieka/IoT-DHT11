from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(
    title="IoT Monitoring Suhu & Kelembapan",
    description="REST API untuk menerima data DHT22 dari ESP32"
)


class SensorData(BaseModel):
    temperature: float
    humidity: float


data_terakhir = {
    "temperature": None,
    "humidity": None
}


@app.get("/")
def root():
    return {
        "message": "REST API IoT Monitoring aktif"
    }


@app.post("/api/sensor-data")
def receive_sensor_data(data: SensorData):
    data_terakhir["temperature"] = data.temperature
    data_terakhir["humidity"] = data.humidity

    return {
        "message": "Data sensor berhasil diterima",
        "data": {
            "temperature": data.temperature,
            "humidity": data.humidity
        }
    }


@app.get("/api/sensor-data/latest")
def get_latest_data():
    return data_terakhir