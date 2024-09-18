import spacy

# Load the medium-sized English model provided by spaCy
nlp = spacy.load("en_core_web_md")


class WeatherLocationQueryHandler:
    def __init__(self, query) -> None:
        """
        Class to initialize the WeatherLocationQueryHandler instance.

        Parameters:
        query (str): The user query to be processed.
        """
        # Define the weather-related keywords using spaCy
        self.weather_nlp = nlp(
            "Weather current temperature conditions in a city ? sunny windy raining cloudy"
        )
        self.query = query

    def get_response(self):
        """
        process user query to check its relatedness with weather
        and extract location

        Returns:
        str: Response to the user query.
        """
        statement = nlp(self.query)
        min_similarity = 0.5

        # Check if the user query is related to weather conditions in a location
        if not self.weather_nlp.similarity(statement) >= min_similarity:
            return "Sorry I don't understand that. Please rephrase your statement including the desired location."

        # Extract any geographical entities mentioned in the query
        for ent in statement.ents:
            if not ent.label_ == "GPE":
                return "Please include a location to check for weather"
            location = ent.text
            if location is None:
                return "Something went wrong. Please try again"
            return location, f"Weather Information for {location}"

        return "Please include a location to check for weather"


if __name__ == "__main__":
    # Example usage
    query = input("Hey, Im weatha, enter you weather query with location?\n")
    bot = WeatherLocationQueryHandler(query=query)
    response = bot.get_response()
    print(response)
