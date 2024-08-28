async function getWeather(station) {
    placeholders(station);
    if (document.querySelector(".sidebar.open")) {
        toggleSidebar();
    }
    try {
        const response = await fetch('https://api.weather.gov/stations/' + station + '/observations');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const st = data.features[0].properties.station.replace(/^https:\/\/api\.weather\.gov\/stations\//, '');

        const stationResp = await fetch(`https://api.weather.gov/stations/${station}`);
        const stationData = await stationResp.json();
        const name = stationData.properties.name;

        let desc
        if (data.features[0].properties.textDescription) {
            desc = data.features[0].properties.textDescription;
        } else {
            desc = data.features[1].properties.textDescription;
        }

        let temperature
        if (data.features[0].properties.temperature.value) {
            temperature = data.features[0].properties.temperature.value;
        } else {
            temperature = data.features[1].properties.temperature.value;
        }

        if (desc === "Fog/Mist") {
            document.body.className = '';
            document.body.classList.add('fog');
        } else if (desc === "Mostly Cloudy") {
            document.body.className = '';
            document.body.classList.add('cloudy');
        } else if (desc === "Mostly Clear") {
            document.body.className = '';
            document.body.classList.add('clear');
        } else if (desc === "Light Rain") {
            document.body.className = '';
            document.body.classList.add('rain');
        } else {
            document.body.className = '';
            if (desc) {
                document.body.classList.add(desc.toLowerCase().replace(/\s+/g, '-'));
            }
        }

        const meta = document.querySelector('meta[name="theme-color"]');
        meta.setAttribute('content', getComputedStyle(document.body).getPropertyValue('--back'));

        const barometricPressure = data.features[0].properties.barometricPressure.value;
        const windSpeed = data.features[0].properties.windSpeed.value;
        const windDirection = data.features[0].properties.windDirection.value;
        const visibility = data.features[0].properties.visibility.value;
        const heatIndex = data.features[4].properties.heatIndex.value;
        const dewpoint = data.features[4].properties.dewpoint.value;
        const relativeHumidity = data.features[4].properties.relativeHumidity.value;
        const precipitationLast6Hours = data.features[4].properties.precipitationLast6Hours.value;
        
        document.getElementById("temperature").innerText = Math.round(temperature);
        document.getElementById("loc").innerText = st;
        document.getElementById("location-full").innerText = name;
        document.getElementById("description").innerText = desc;

        document.getElementById("barometricPressure").querySelector(".tile-value").innerText = Math.round(barometricPressure * 0.0002953);
        document.getElementById("windSpeed").querySelector(".tile-value").innerText = Math.round(windSpeed);
        document.getElementById("windSpeed").querySelector(".compass").style.transform = `rotate(${windDirection}deg)`;
        document.getElementById("visibility").querySelector(".tile-value").innerText = Math.round(visibility / 1000);
        document.getElementById("heatIndex").querySelector(".tile-value").innerHTML = `<span class="str"><span>${Math.round(heatIndex)}</span><span class="symbol small">°</span></span>`;
        document.getElementById("dewpoint").querySelector(".tile-value").innerHTML = `<span class="str"><span>${Math.round(dewpoint)}</span><span class="symbol small">°</span></span>`;
        document.getElementById("relativeHumidity").querySelector(".tile-value").innerText = Math.round(relativeHumidity) + '%';
        document.getElementById("precipitationLast6Hours").querySelector(".tile-value").innerHTML = `<span class='str'><span>${Math.round(precipitationLast6Hours)}</span><span class='symbol small'>"</span></span>`;

        const latitude = data.features[0].geometry.coordinates[1];
        const longitude = data.features[0].geometry.coordinates[0];
        const pointsUrl = `https://api.weather.gov/points/${latitude},${longitude}`;
        const pointsResponse = await fetch(pointsUrl);
        const pointsData = await pointsResponse.json();
        const { gridId, gridX, gridY } = pointsData.properties;

        const forecastUrl = `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast/hourly`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        const periods = forecastData.properties.periods;
        const todayForecast = periods.filter(period => new Date(period.startTime).getDate() === new Date().getDate());
        
        const highTemp = Math.max(...todayForecast.map(period => period.temperature));
        const lowTemp = Math.min(...todayForecast.map(period => period.temperature));

        document.getElementById("high-temp").innerText = `${Math.round(convertToC(highTemp))}°`;
        document.getElementById("low-temp").innerText = `${Math.round(convertToC(lowTemp))}°`;

        const forecastContainer = document.getElementById('forecast');
        forecastContainer.innerHTML = '';
        
        const now = new Date();
        const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        let maxChanceOfRain = 0;
        
        forecastData.properties.periods
            .filter(period => new Date(period.startTime) <= next24Hours)
            .forEach(period => {
                const date = new Date(period.startTime);
                const hours = date.getHours();
                const formattedHour = hours % 12 || 12;
                const ampm = hours >= 12 ? 'PM' : 'AM';
        
                const forecastDiv = document.createElement('div');
                forecastDiv.innerHTML = `
                    <span class="forcast-temp">${Math.round(convertToC(period.temperature))}<span class="symbol">°</span></span>
                    <span class="forcast-time">${formattedHour}${ampm}</span>
                `;
                forecastContainer.appendChild(forecastDiv);

                if (period.probabilityOfPrecipitation.value > maxChanceOfRain) {
                    maxChanceOfRain = period.probabilityOfPrecipitation.value;
                }
            });
        document.getElementById("chanceOfRain").querySelector(".tile-value").innerText = maxChanceOfRain + '%';
    } catch (error) {
        console.error('Error fetching temperature:', error);
    }
}

function placeholders(station) {
    document.getElementById("temperature").innerText = '--';
    document.getElementById("loc").innerText = station;
    document.getElementById("location-full").innerText = '####';
    document.getElementById("description").innerText = '####';
    document.getElementById("low-temp").innerText = '--';
    document.getElementById("high-temp").innerText = '--';

    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    document.getElementById("barometricPressure").querySelector(".tile-value").innerText = '--';
    document.getElementById("windSpeed").querySelector(".tile-value").innerText = '--';
    document.getElementById("visibility").querySelector(".tile-value").innerText = '--';
    document.getElementById("heatIndex").querySelector(".tile-value").innerHTML = `<span class="str">--</span>`;
    document.getElementById("dewpoint").querySelector(".tile-value").innerHTML = `<span class="str">--</span>`;
    document.getElementById("relativeHumidity").querySelector(".tile-value").innerText = '--';
    document.getElementById("precipitationLast6Hours").querySelector(".tile-value").innerHTML = `--`;
}

function toggleSidebar() {
    if (document.querySelector(".sidebar.open")) {
        document.querySelector(".sidebar").classList.remove("open")
    } else {
        document.querySelector(".sidebar").classList.add("open")
    }
}

function getMoonPhase(date) {
    // Reference date: January 11, 2024
    const referenceDate = new Date('2024-01-11');
    
    const diffTime = date - referenceDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const lunarCycle = 29.53059;
    
    const moonPhase = (diffDays % lunarCycle) / lunarCycle;
    
    return moonPhase;
}

function setMoon() {
    const date = new Date();
    const phase = getMoonPhase(date);

    let illumination;
    if (phase <= 0.5) {
        illumination = phase * 2 * 100;
    } else {
        illumination = (1 - phase) * 2 * 100;
    }
    
    let phaseName;
    if (phase === 0 || phase === 1) {
        phaseName = "New Moon";
    } else if (phase > 0 && phase < 0.25) {
        phaseName = "Waxing Crescent";
    } else if (phase === 0.25) {
        phaseName = "First Quarter";
    } else if (phase > 0.25 && phase < 0.5) {
        phaseName = "Waxing Gibbous";
    } else if (phase === 0.5) {
        phaseName = "Full Moon";
    } else if (phase > 0.5 && phase < 0.75) {
        phaseName = "Waning Gibbous";
    } else if (phase === 0.75) {
        phaseName = "Last Quarter";
    } else if (phase > 0.75 && phase < 1) {
        phaseName = "Waning Crescent";
    }
    
    const r = document.querySelector(':root');
    const percentage = Math.round(illumination);
    
    r.style.setProperty('--phase', `${percentage}%`);
    r.style.setProperty('--flip', phase <= 0.5 ? '0deg' : '180deg');

    document.getElementById("moon").querySelector(".tile-value").innerText = `${Math.round(illumination)}%`;
    document.getElementById('moon-icon').style.setProperty('--phase', `${illumination}%`);
    document.getElementById('moon-icon').style.setProperty('--flip', phase <= 0.5 ? '0deg' : '180deg');

    document.getElementById("moon").querySelector(".tile-unit").innerText = phaseName;
}

function convertToC(f) {
    return (f - 32) * 5 / 9;
}

async function searchStations(query) {
    if (query) {
        document.querySelector('.sidebar-main').innerHTML = '';
        document.getElementById('search-input').value = '';

        const results = document.createElement('div');
        results.className = 'results';

        results.innerHTML = `
            <span class="saved-loc-name">
                Results for "${query}"
            </span>
            <span class="loading"></span>
        `;

        document.querySelector('.sidebar-main').appendChild(results);
        try {
            const locationResponse = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`);
            const locationData = await locationResponse.json();

            if (locationData.length > 0) {
                const { lat, lon } = locationData[0];

                const stationsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}/stations`);
                const stationsData = await stationsResponse.json();
                const stations = stationsData.features;

                if (stations.length > 0) {
                    for (const station of stations) {
                        const stationId = station.properties.stationIdentifier;

                        try {
                            const observationResponse = await fetch(`https://api.weather.gov/stations/${stationId}/observations/`);
                            const data = await observationResponse.json();
                            let temperature
                            if (data.features[0].properties.temperature.value) {
                                temperature = data.features[0].properties.temperature.value;
                            } else {
                                temperature = data.features[1].properties.temperature.value;
                            }

                            const stationResp = await fetch(`https://api.weather.gov/stations/${stationId}`);
                            const stationData = await stationResp.json();
                            const name = stationData.properties.name;

                            const savedLocDiv = document.createElement('div');
                            savedLocDiv.className = 'saved-loc';
                            savedLocDiv.id = stationId;
                            savedLocDiv.onclick = () => getWeather(stationId);

                            savedLocDiv.innerHTML = `
                                <span class="saved-loc-name">
                                    ${stationId} - ${name}
                                </span>
                                <div class="saved-loc-title">
                                    <span id="loc-temp">${temperature ? Math.round(temperature) : 'N/A'}°</span>
                                </div>
                            `;

                            document.querySelector('.sidebar-main').appendChild(savedLocDiv);
                        } catch (error) {
                            console.error('Error fetching temperature data:', error);
                        }
                    }
                    document.querySelectorAll('.loading').forEach(element => element.remove());
                } else {
                    console.error('No weather stations found');
                }
            } else {
                console.error('Location not found');
            }
        } catch (error) {
            console.error('Error fetching location coordinates:', error);
        }
    } else {
        console.log('No location entered');
    }
}

setMoon();

getWeather('KPHX');