import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Get('current')
    async getCurrentWeather(
        @Query('lat') lat: string,
        @Query('lon') lon: string,
    ) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('無効な緯度経度です');
        }

        return this.weatherService.getCurrentWeather(latitude, longitude);
    }

    @Get('forecast')
    async getWeeklyForecast(
        @Query('lat') lat: string,
        @Query('lon') lon: string,
    ) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('無効な緯度経度です');
        }

        return this.weatherService.getWeeklyForecast(latitude, longitude);
    }

    @Get('site')
    async getSiteWeather(
        @Query('lat') lat: string,
        @Query('lon') lon: string,
    ) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (isNaN(latitude) || isNaN(longitude)) {
            throw new Error('無効な緯度経度です');
        }

        return this.weatherService.getSiteWeather(latitude, longitude);
    }
}
