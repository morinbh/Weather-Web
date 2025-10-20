// 🔑 הכניסי את ה-API key שלך כאן
const apiKey = "425c7a1aeb6c4ab1f82dddcb0ac5c1a8";

// שליפת האלמנטים מה-HTML
const searchButton = document.getElementById("search");
const cityInput = document.getElementById("city");
const resultDiv = document.getElementById("result");

// פונקציה לשינוי רקע לפי סוג מזג האוויר
function setBackground(weatherMain) {
  const body = document.body;

  switch (weatherMain) {
    case "Clear":
      body.style.background = "linear-gradient(to top, #fceabb, #f8b500)";
      break;
    case "Clouds":
      body.style.background = "linear-gradient(to top, #bdc3c7, #2c3e50)";
      break;
    case "Rain":
    case "Drizzle":
      body.style.background = "linear-gradient(to top, #4e54c8, #8f94fb)";
      break;
    case "Thunderstorm":
      body.style.background =
        "linear-gradient(to top, #0f2027, #203a43, #2c5364)";
      break;
    case "Snow":
      body.style.background = "linear-gradient(to top, #e6e9f0, #eef1f5)";
      break;
    case "Mist":
    case "Fog":
      body.style.background = "linear-gradient(to top, #606c88, #3f4c6b)";
      break;
    default:
      body.style.background =
        "linear-gradient(135deg, #6fb1fc, #4364f7, #0052d4)";
  }
}

// פונקציה שמקבלת שם עיר ומציגה את הנתונים
async function getWeather(city) {
  try {
    // 1️⃣ Geocoding API כדי לתמוך בשמות עיר בעברית
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      city
    )}&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData[0]) {
      resultDiv.innerHTML = "City not found";
      return;
    }

    const { lat, lon } = geoData[0];

    // 2️⃣ קריאה ל-Weather API ו-Forecast API לפי קואורדינטות
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(url),
      fetch(forecastUrl),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      resultDiv.innerHTML = "City not found";
      return;
    }

    const data = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // שינוי רקע לפי מזג האוויר הנוכחי
    const weatherMain = data.weather[0].main;
    setBackground(weatherMain);

    // תצוגת מזג האוויר הנוכחי
    resultDiv.innerHTML = `
      <h2>${data.name}</h2>
      <p>🌡 טמפרטורה: ${Math.round(
        data.main?.temp ?? 0
      )}°C (מרגיש כמו ${Math.round(data.main?.feels_like ?? 0)}°C)</p>
      <p>☁ ${data.weather[0].description}</p>
      <img src="https://openweathermap.org/img/wn/${
        data.weather[0].icon
      }@2x.png" alt="${data.weather[0].description}">
    `;

    // -------------------------
    // תחזית ל-5 ימים קדימה
    // -------------------------
    const dailyForecasts = forecastData.list.filter((item) =>
      item.dt_txt.includes("12:00:00")
    );

    let forecastHTML =
      "<h3>תחזית ל-5 ימים קדימה</h3><div class='forecast-container'>";

    dailyForecasts.forEach((day) => {
      const dateObj = new Date(day.dt_txt);
      const options = { weekday: "short" };
      let dayName = dateObj
        .toLocaleDateString("he-IL", options)
        .replace("יום ", "");
      const dayDate = dateObj.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "short",
      });
      const date = `${dayName} ${dayDate}`;

      forecastHTML += `
        <div class="forecast-day">
          <p>${date}</p>
          <img src="https://openweathermap.org/img/wn/${
            day.weather[0].icon
          }.png" alt="${day.weather[0].description}">
          <p>${Math.round(day.main?.temp ?? 0)}°C</p>
          <p>${day.weather[0].main}</p>
        </div>
      `;
    });

    forecastHTML += "</div>";
    resultDiv.innerHTML += forecastHTML;
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "Error fetching data";
  }
}

// חיבור לפעולה על הכפתור
searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    resultDiv.innerHTML = "Please enter a city name";
  }
});
