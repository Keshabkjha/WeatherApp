import python_weather
import asyncio
import os
import pandas as pd


class WeatherDataFetcher:
    """
    A class to fetch weather data for a specific location.

    Attributes:
        location (str): The location for which weather data is fetched.
        weather_data: The fetched weather data.
        daily_forecasts: The daily weather forecasts.
        hourly_forecasts: The aggregated hourly weather forecasts for each day.
    """

    def __init__(self, location="New York"):
        """
        Initializes WeatherDataFetcher with the specified location.

        Args:
            location (str, optional): The location for which weather data
            is fetched. Defaults to 'New York'.
        """
        self.location = location
        self.weather_data = None
        self.daily_forecasts = None
        self.hourly_forecasts = None

    async def fetch_weather(self):
        """
        Fetches weather data for the specified location using the python_weather API.
        """
        async with python_weather.Client() as client:
            self.weather_data = await client.get(location=self.location)
            self.daily_forecasts = [day for day in self.weather_data.daily_forecasts]
            self.hourly_forecasts = {
                day.date: [hourly_data for hourly_data in day.hourly_forecasts]
                for day in self.daily_forecasts
            }

    def get_daily_forecasts(self):
        """
        Process the weather information associated with the daily
        forecasts into a pandas DataFrame

        Returns:
            pandas.DataFrame or None: DataFrame containing daily weather forecasts.
        """
        if self.weather_data is None:
            return
        forecasts = {
            "Date": [],
            "Highest Temperature": [],
            "Lowest Temperature": [],
            "Temperature": [],
        }

        for day in self.daily_forecasts:
            forecasts["Date"].append(day.date)
            forecasts["Highest Temperature"].append(day.highest_temperature)
            forecasts["Lowest Temperature"].append(day.lowest_temperature)
            forecasts["Temperature"].append(day.temperature)

        df = pd.DataFrame(forecasts)
        temperature_df = df.melt(
            id_vars=["Date"], var_name="Temperature Variant", value_name="value"
        )
        temperature_df["Date"] = pd.to_datetime(temperature_df["Date"])

        return temperature_df

    def get_hourly_forecasts(self):
        """
        Process and aggregates the weather information associated
        with the hourly forecasts of each day into a
        pandas DataFrame

        Returns:
            pandas.DataFrame or None: DataFrame containing hourly weather forecasts.
        """
        if self.weather_data is None:
            return
        hourly_forecasts = {
            "Date": [],
            "Hour": [],
            "Feels_Like": [],
            "Humidity": [],
            "Temperature": [],
            "Description": [],
            "Wind_Speed": [],
        }

        for date, hourly_data in self.hourly_forecasts.items():
            for hour in hourly_data:
                hourly_forecasts["Date"].append(date)
                hourly_forecasts["Hour"].append(hour.time)
                hourly_forecasts["Feels_Like"].append(hour.feels_like)
                hourly_forecasts["Humidity"].append(hour.humidity)
                hourly_forecasts["Temperature"].append(hour.temperature)
                hourly_forecasts["Description"].append(hour.description)
                hourly_forecasts["Wind_Speed"].append(hour.wind_speed)

        df = pd.DataFrame(hourly_forecasts)
        df["DateTime"] = pd.to_datetime(
            df["Date"].astype(str) + " " + df["Hour"].astype(str)
        )

        return df

    async def get_weather(self):
        """
        Method to fetch weather and return current temp, description,
        feels like, wind speed, visibility, processed daily
        and hourly forecasts in a dictionary.

        Returns:
            dict: Dictionary containing weather data.
        """
        await self.fetch_weather()
        return {
            "temperature": self.weather_data.temperature,
            "description": self.weather_data.description,
            "feels_like": self.weather_data.feels_like,
            "wind_speed": self.weather_data.wind_speed,
            "visibility": self.weather_data.visibility,
            "daily_forecasts": self.get_daily_forecasts(),
            "hourly_forecasts": self.get_hourly_forecasts(),
        }


if __name__ == "__main__":
    # Example usage
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    location = input("Enter location name: ")
    weather = WeatherDataFetcher(location)
    weather_data = asyncio.run(weather.get_weather())
    print(weather_data)
