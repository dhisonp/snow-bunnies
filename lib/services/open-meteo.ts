import { type DailyWeather } from "@/lib/types/weather";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export async function getResortForecast(
  lat: number,
  lon: number,
  start: string,
  end: string
): Promise<DailyWeather[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: start,
    end_date: end,
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "snowfall_sum",
      "precipitation_probability_max",
      "weather_code",
      "wind_speed_10m_max",
      "uv_index_max",
    ].join(","),
    timezone: "auto",
  });

  const res = await fetch(`${OPEN_METEO_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await res.json();
  const daily = data.daily;

  // Open-Meteo returns column-oriented arrays (time: [], temp: [], etc.)
  // We need to zip them into row-oriented objects
  return daily.time.map((date: string, i: number) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    precipitationSum: daily.precipitation_sum[i],
    snowfallSum: daily.snowfall_sum[i],
    precipitationProbability: daily.precipitation_probability_max[i],
    weatherCode: daily.weather_code[i],
    windSpeedMax: daily.wind_speed_10m_max[i],
    uvIndexMax: daily.uv_index_max[i],
  }));
}
