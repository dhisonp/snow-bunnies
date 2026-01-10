import { type DailyWeather } from "@/lib/types/weather";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_HISTORY_URL = "https://archive-api.open-meteo.com/v1/archive";

export async function getResortForecast(
  lat: number,
  lon: number,
  start: string,
  end: string
): Promise<{
  weather: DailyWeather[];
  timezone: string;
  utcOffsetSeconds: number;
}> {
  // Guard: Ensure start date is not in the past (simple UTC check)
  const today = new Date().toISOString().split("T")[0];
  if (start < today) {
    throw new Error(
      `getResortForecast called with past date ${start}. Use getResortHistory instead.`
    );
  }

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

  const res = await fetch(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch weather forecast");
  }

  const data = await res.json();
  const daily = data.daily;

  const weather = daily.time.map((date: string, i: number) => ({
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

  return {
    weather,
    timezone: data.timezone,
    utcOffsetSeconds: data.utc_offset_seconds,
  };
}

export async function getResortHistory(
  lat: number,
  lon: number,
  start: string,
  end: string
): Promise<{
  weather: DailyWeather[];
  timezone: string;
  utcOffsetSeconds: number;
}> {
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
      // History doesn't have precipitation_probability_max
      "weather_code",
      "wind_speed_10m_max",
      // Archive usually has precipitation_hours or et0_fao_evapotranspiration,
      // but let's check if uv_index_max is supported.
      // Often short_wave_radiation is used instead, but let's try uv_index_max or default.
    ].join(","),
    timezone: "auto",
  });

  const res = await fetch(`${OPEN_METEO_HISTORY_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch weather history");
  }

  const data = await res.json();
  const daily = data.daily;

  const weather = daily.time.map((date: string, i: number) => ({
    date,
    tempMax: daily.temperature_2m_max[i],
    tempMin: daily.temperature_2m_min[i],
    precipitationSum: daily.precipitation_sum[i],
    snowfallSum: daily.snowfall_sum[i],
    precipitationProbability: 0, // Not available in history
    weatherCode: daily.weather_code[i],
    windSpeedMax: daily.wind_speed_10m_max[i],
    uvIndexMax: 0, // Often missing in archive, setting default
  }));

  return {
    weather,
    timezone: data.timezone,
    utcOffsetSeconds: data.utc_offset_seconds,
  };
}
