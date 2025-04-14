import { userManager, signOutRedirect } from '../auth.js';

window.global = window;

window.onload = async function () {
  if (window.location.search.includes("code=")) {
    try {
      const user = await userManager.signinRedirectCallback();
      console.log("Processed redirect callback. Logged in user:", user);
      window.history.replaceState({}, document.title, "/");
    } catch (err) {
      console.error("Failed to handle redirect callback:", err);
    }
  }

  checkIfUserIsAuthenticated();
};

// Sign-In Button Logic
document.getElementById("signIn").addEventListener("click", async () => {
  await userManager.signinRedirect();
});

// Sign-Out Button Logic
document.getElementById("signOut").addEventListener("click", async () => {
  await signOutRedirect();
});

// Charts
async function renderCharts() {
  const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=5&page=1&sparkline=true';

  async function getCryptoData() {
    const response = await fetch(API_URL);
    return await response.json();
  }

  function generateTimestamps(priceData) {
    const now = new Date();
    const intervalMs = (24 * 60 * 60 * 1000) / priceData.length;
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
              callback: value => '€' + value.toFixed(2)
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

    const last24hPrices = crypto.sparkline_in_7d.price.slice(-288);
    createChart(id, crypto.name, last24hPrices);
  });
}

async function checkIfUserIsAuthenticated() {
  console.log("Check if user is authenticated called");

  try {
    const user = await userManager.getUser();
    console.log("userManager.getUser() returned:", user);

    if (user && !user.expired) {
      console.log("User is authenticated:", user);
      renderCharts();
      document.getElementById("cryptoForm").classList.remove("hidden");
    } else {
      console.log("User is not authenticated");
      document.getElementById("cryptoForm").classList.add("hidden");
    }
  } catch (err) {
    console.error("Error retrieving user:", err);
  }
}

// crypto form
document.addEventListener("DOMContentLoaded", function () {
  const cryptoForm = document.querySelector("#cryptoForm form");
  cryptoForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const url = "https://rev2k5bdik.execute-api.us-east-1.amazonaws.com/dev/user"
    const coin = document.getElementById("coin").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const high_threshold = parseFloat(document.getElementById("high_threshold").value);
    const low_threshold = parseFloat(document.getElementById("low_threshold").value);

    userManager.getUser().then(user => {
      if (user) {
        let username = user.profile["cognito:username"];
        console.log("Username:", username);
        // Prepare the data 
        const data = {
          username: username,
          coin: coin,
          amount: amount,
          high_threshold: high_threshold,
          low_threshold: low_threshold
        };

        // Send the data via PUT request
        fetch(url, {
          method: "PUT", 
          headers: {
            "Content-Type": "application/json" 
          },
          body: JSON.stringify(data) 
        })
        .then(response => response.json()) 
        .then(data => {
          console.log("Success:", data); 
        })
        .catch((error) => {
          console.error("Error:", error); 
        });
      } else {
        console.log("No user is currently signed in.");
      }
    });

    console.log({ coin, amount, high_threshold, low_threshold });
    cryptoForm.reset();
  });
});

