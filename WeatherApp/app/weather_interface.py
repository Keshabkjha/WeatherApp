from app.weather_data_fetcher import WeatherDataFetcher
from app.weather_location_query_handler import WeatherLocationQueryHandler
import asyncio
import os
import streamlit as st
import altair as alt

class WeatherApp:
    """
    WeatherApp class to display weather information and forecast  using streamlit.
    """

    def __init__(self):
        """
        Initialize WeatherApp class.
        """
        self.data = None

    def get_weather_details_for_location(self, location):
        """
        Method to fectch weather details for a given location.

        Parameters:
        - location (str): The name of the location for which weather data is queried.

        Returns:
        - weather_data (dict): Dictionary containing weather data for the specified location.
        """
        if os.name == "nt":
            asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

        weather = WeatherDataFetcher(location=location)
        weather_data = asyncio.run(weather.get_weather())
        return weather_data

    def display_current_weather_data(self):
        """
        Method to display current weather data.
        """
        st.header(f"Today is {self.data['description']}", divider="gray")
        with st.expander("View current weather details", expanded=True):
            temperature_column, feels_like_column = st.columns(2)
            with temperature_column:
                st.header(f"{self.data['temperature']}°")
                st.write("Temperature (C)")

            with feels_like_column:
                st.header(f"{self.data['feels_like']}°")
                st.write("Feels Like (C)")

            visibility_column, wind_speed_column = st.columns(2)
            with visibility_column:
                st.header(self.data["visibility"])
                st.write("Visibility (km)")

            with wind_speed_column:
                st.header(self.data["wind_speed"])
                st.write("Wind Speed (kmph)")

    def display_hourly_temperature_trend(self):
        """
        Method to display hourly temperature forecasts trend
        of the retrieved daily forecasts
        """
        df = self.data["hourly_forecasts"]
        with st.expander("View Hourly Temperature Trend", expanded=False):
            chart = (
                alt.Chart(df)
                .mark_line()
                .encode(
                    x="DateTime:T",
                    y="Temperature:Q",
                    color=alt.Color(
                        "yearmonthdate(Date):O", legend=alt.Legend(title="Date")
                    ),
                    tooltip=["DateTime:T", "Temperature:Q"],
                )
                .properties(title="Hourly Temperature Forecast", width=700, height=400)
                .configure_axis(labelAngle=45)
            )
            st.altair_chart(chart, use_container_width=True)

    def display_hourly_weather_information(self):
        """
        Method to display hourly weather details in tabular format
        """
        df = self.data["hourly_forecasts"]
        with st.expander("View Hourly Weather Details", expanded=False):
            df_display = df.rename(
                columns={
                    "Temperature": "Temperature (°C)",
                    "DateTime": "Date and Time",
                    "Humidity": "Humidity (%)",
                    "Wind_Speed": "Wind Speed (km/h)",
                }
            )
            st.write(
                df_display[
                    [
                        "Date and Time",
                        "Temperature (°C)",
                        "Humidity (%)",
                        "Wind Speed (km/h)",
                    ]
                ].to_markdown(index=False)
            )

    def display_temperature_comparison(self):
        """
        Method to display min and max temperature comparison for the coming days.
        """
        with st.expander("See Daily Temperature Spikes", expanded=False):
            df = self.data["daily_forecasts"]
            chart = (
                alt.Chart(df, title="Temperature Data")
                .mark_bar(opacity=1)
                .encode(
                    column=alt.Column(
                        "Date:T",
                        title="Date",
                        spacing=60,
                        header=alt.Header(labelOrient="bottom"),
                    ),
                    x=alt.X(
                        "Temperature Variant",
                        sort=[
                            "Highest Temperature",
                            "Lowest Temperature",
                            "Current Temperature",
                        ],
                        axis=None,
                    ),
                    y=alt.Y("value:Q", title="Temperature (°C)"),
                    color=alt.Color("Temperature Variant"),
                    size=alt.value(30),
                )
                .configure_view(stroke="transparent")
            )

            st.altair_chart(chart)

    def handle_response_from_queryhandler(self, response):
        """
        Method to handle response given by WeatherLocationQueryHanlder

        Parameters:
        - response (str): response returned by WeatherLocationQueryHanlder
        """
        if not isinstance(response, tuple):
            st.warning(response)
            return
        query_location, processor_response = response
        st.write(f"### {processor_response}")
        self.data = self.get_weather_details_for_location(location=query_location)
        if self.data:
            self.display_current_weather_data()
            self.display_temperature_comparison()
            self.display_hourly_temperature_trend()
            self.display_hourly_weather_information()

    def handle_user_query(self, query):
        """
        method to handle query from user input

        Parameters:
        - query (str): the user query to be processed.
        """
        if not isinstance(query, str):
            st.warning("Please enter your weather related query with location")
            return
        response = WeatherLocationQueryHandler(query).get_response()
        self.handle_response_from_queryhandler(response)

    def main_window(self):
        """
        Method to display the main window of the weather app.
        """
        st.title("Hello! I'm Weatha the weather bot")
        logo_path = os.path.join(os.getcwd(), "app", "static", "weather-app-icon.jpg")
        if os.path.exists(logo_path):
            st.image(logo_path, width=50)
        query = st.chat_input("Please enter your weather related query with location")
        if query:
            self.handle_user_query(query)


if __name__ == "__main__":
    app = WeatherApp()
    app.main_window()
