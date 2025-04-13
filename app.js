const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=5&page=1&sparkline=true';

async function getCryptoData() {
  const response = await fetch(API_URL);
  const data = await response.json();
  return data;
}

function generateTimestamps(priceData) {
  const now = new Date();
  const intervalMs = (24 * 60 * 60 * 1000) / priceData.length; // Evenly spread over 24h
  return priceData.map((_, i) => {
    const time = new Date(now.getTime() - (priceData.length - i) * intervalMs);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
}

function createChart(canvasId, label, priceData) {
  const timeLabels = generateTimestamps(priceData);

  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeLabels,
      datasets: [{
        label: `${label} (24h)`,
        data: priceData,
        fill: true,
        borderColor: '#00c9a7',
        backgroundColor: 'rgba(0, 201, 167, 0.1)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { color: '#ccc', maxTicksLimit: 8 },
          title: {
            display: true,
            text: 'Time (last 24h)',
            color: '#ccc'
          }
        },
        y: {
          ticks: {
            color: '#ccc',
            callback: value => '$' + value.toFixed(2)
          },
          title: {
            display: true,
            text: 'Price (EUR)',
            color: '#ccc'
          }
        }
      },
      plugins: {
        legend: {
          labels: { color: '#fff' }
        }
      }
    }
  });
}

async function renderCharts() {
  const cryptos = await getCryptoData();
  const container = document.getElementById('charts');

  cryptos.forEach((crypto, i) => {
    const id = 'chart-' + i;
    const div = document.createElement('div');
    div.className = 'chart-container';
    div.innerHTML = `
      <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
      <canvas id="${id}"></canvas>
    `;
    container.appendChild(div);

    // Use only the last 288 points (24h at 5-minute intervals)
    const last24hPrices = crypto.sparkline_in_7d.price.slice(-288);
    createChart(id, crypto.name, last24hPrices);
  });
}

renderCharts();

//cognito
import { UserManager } from "oidc-client-ts";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_X4e3klbf1",
    client_id: "65gfd0pbgfh6nanp5dtd4qdk40",
    redirect_uri: "https://d84l1y8p4kdic.cloudfront.net",
    response_type: "code",
    scope: "phone openid email"
};

// create a UserManager instance
export const userManager = new UserManager({
    ...cognitoAuthConfig,
});

export async function signOutRedirect () {
    const clientId = "65gfd0pbgfh6nanp5dtd4qdk40";
    const logoutUri = "<logout uri>";
    const cognitoDomain = "https://<user pool domain>";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};
