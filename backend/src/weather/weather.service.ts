import { Injectable } from '@nestjs/common';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  icon: string;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  weatherDescription: string;
  icon: string;
}

const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: '快晴', icon: '☀️' },
  1: { description: '晴れ', icon: '🌤️' },
  2: { description: 'くもり', icon: '⛅' },
  3: { description: '曇天', icon: '☁️' },
  45: { description: '霧', icon: '🌫️' },
  48: { description: '濃霧', icon: '🌫️' },
  51: { description: '小雨', icon: '🌧️' },
  53: { description: '雨', icon: '🌧️' },
  55: { description: '強雨', icon: '🌧️' },
  61: { description: '弱い雨', icon: '🌧️' },
  63: { description: '雨', icon: '🌧️' },
  65: { description: '大雨', icon: '🌧️' },
  71: { description: '小雪', icon: '🌨️' },
  73: { description: '雪', icon: '❄️' },
  75: { description: '大雪', icon: '❄️' },
  77: { description: 'あられ', icon: '🌨️' },
  80: { description: 'にわか雨', icon: '🌦️' },
  81: { description: 'にわか雨', icon: '🌦️' },
  82: { description: '激しいにわか雨', icon: '⛈️' },
  85: { description: 'にわか雪', icon: '🌨️' },
  86: { description: '激しいにわか雪', icon: '🌨️' },
  95: { description: '雷雨', icon: '⛈️' },
  96: { description: '雹を伴う雷雨', icon: '⛈️' },
  99: { description: '激しい雷雨', icon: '⛈️' },
};

@Injectable()
export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';

  /**
   * 現在の天気を取得
   */
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData> {
    const url = `${this.baseUrl}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=Asia/Tokyo`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const current = data.current;
      const weatherCode = current.weather_code;
      const weatherInfo = WEATHER_CODES[weatherCode] || { description: '不明', icon: '❓' };

      return {
        temperature: current.temperature_2m,
        weatherCode,
        weatherDescription: weatherInfo.description,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        icon: weatherInfo.icon,
      };
    } catch (error) {
      console.error('Weather API error:', error);
      throw new Error('天気情報の取得に失敗しました');
    }
  }

  /**
   * 週間天気予報を取得
   */
  async getWeeklyForecast(latitude: number, longitude: number): Promise<DailyForecast[]> {
    const url = `${this.baseUrl}?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Tokyo`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      const daily = data.daily;
      const forecasts: DailyForecast[] = [];

      for (let i = 0; i < daily.time.length; i++) {
        const weatherCode = daily.weather_code[i];
        const weatherInfo = WEATHER_CODES[weatherCode] || { description: '不明', icon: '❓' };

        forecasts.push({
          date: daily.time[i],
          maxTemp: daily.temperature_2m_max[i],
          minTemp: daily.temperature_2m_min[i],
          weatherCode,
          weatherDescription: weatherInfo.description,
          icon: weatherInfo.icon,
        });
      }

      return forecasts;
    } catch (error) {
      console.error('Weather forecast API error:', error);
      throw new Error('天気予報の取得に失敗しました');
    }
  }

  /**
   * 現場の天気を取得（現場の緯度経度から）
   */
  async getSiteWeather(siteLatitude: number, siteLongitude: number) {
    const [current, forecast] = await Promise.all([
      this.getCurrentWeather(siteLatitude, siteLongitude),
      this.getWeeklyForecast(siteLatitude, siteLongitude),
    ]);

    return { current, forecast };
  }
}
