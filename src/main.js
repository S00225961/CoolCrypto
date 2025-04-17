import { getUserManager, signOutRedirect } from '../auth.js';
window.global = window;

//region redirect
let API_URL = "";
let HOST_URL = "";
let REGION = "";

let userManager = "";

// Configuration map
const regionConfig = {
  "us-east-1": {
    host: "https://main.diedwkmusxaeo.amplifyapp.com/",
    api: "https://rev2k5bdik.execute-api.us-east-1.amazonaws.com/dev/"
  },
  "us-west-2": {
    host: "https://main.d94v42z7ykhoh.amplifyapp.com/",
    api: "https://oew34zm0xe.execute-api.us-west-2.amazonaws.com/dev/"
  }
};

// Set global config when user selects a region
const regionSwitcher = document.getElementById("regionSwitcher");
regionSwitcher.addEventListener("change", function (e) {
  REGION = e.target.value;
  localStorage.setItem("selectedRegion", REGION);

  API_URL = regionConfig[REGION].api;
  HOST_URL = regionConfig[REGION].host;

  console.log("API:", API_URL);
  console.log("Host:", HOST_URL);
  console.log("Region:", REGION);

  // Optional: Reload the page or navigate to a new Amplify site
  window.location.href = HOST_URL;
});

// window reload
window.onload = async function () {
  const savedRegion = localStorage.getItem("selectedRegion");
  if (savedRegion && regionConfig[savedRegion]) {
    regionSwitcher.value = savedRegion;
    REGION = savedRegion;
    API_URL = regionConfig[REGION].api;
    HOST_URL = regionConfig[REGION].host;
    userManager = getUserManager(REGION);

    console.log("Loaded saved region:", REGION);
  }

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
  await signOutRedirect(REGION);
});

// Threshold btn 
document.getElementById("thresholdBtn").addEventListener("click", async () => {
  checkUserThresholds();
});

async function checkUserThresholds(){
  try {
    const user = await userManager.getUser();
    let username = user.profile["cognito:username"];
    const response = await fetch(`${API_URL}crypto/${username}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); 
    console.log('Response data:', data);
    document.getElementById('alertBox').value = JSON.stringify(data, null, 2);

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

async function triggerCryptoAlertCheck(){
  try {
    const user = await userManager.getUser();
    let username = user.profile["cognito:username"];
    const response = await fetch(`${API_URL}user/${username}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); 
    console.log('Response data:', data);
    return data;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Charts
async function renderCharts(cryptos) {
  function createChart(canvasId, label, priceDataPoints) {
    const timeLabels = priceDataPoints.map(([timestamp]) =>
      new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    const prices = priceDataPoints.map(([_, price]) => price);

    const ctx = document.getElementById(canvasId).getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: `${label} (24h)`,
            data: prices,
            fill: true,
            borderColor: '#00c9a7',
            backgroundColor: 'rgba(0, 201, 167, 0.1)',
            tension: 0.3
          }
        ]
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

  const container = document.getElementById('charts');
  container.innerHTML = ''; // Clear any existing charts

  cryptos.forEach((crypto, i) => {
    if (!crypto.price_history || crypto.price_history.length === 0) return;

    const id = 'chart-' + i;
    const div = document.createElement('div');
    div.className = 'chart-container';
    div.innerHTML = `
      <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
      <canvas id="${id}"></canvas>
    `;
    container.appendChild(div);

    createChart(id, crypto.name, crypto.price_history);
  });
}

async function checkIfUserIsAuthenticated() {
  console.log("Check if user is authenticated called");

  try {
    const user = await userManager.getUser();
    console.log("userManager.getUser() returned:", user);

    if (user && !user.expired) {
      console.log("User is authenticated:", user);
      const cryptoData = await fetchCryptoData();
      const parsedCryptos = JSON.parse(cryptoData.result.body);
      renderCharts(parsedCryptos);
      triggerCryptoAlertCheck();
      document.getElementById("cryptoForm").classList.remove("hidden");
      document.getElementById("thresholdBtn").classList.remove("hidden");
      document.getElementById("alertBox").classList.remove("hidden");
      // Make api call every 5 mins
      setInterval(checkUserThresholds, 300000);
    } else {
      console.log("User is not authenticated");
      document.getElementById("cryptoForm").classList.add("hidden");
      document.getElementById("thresholdBtn").classList.add("hidden");
      document.getElementById("alertBox").classList.add("hidden");
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

    const url = `${API_URL}user`
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
          alert("Success:", data);
          triggerCryptoAlertCheck();
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

// Trigger step function on sign in and get crypto data
async function fetchCryptoData() {
  try {
    const url = `${API_URL}crypto`
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json(); 
    console.log('Response data:', data);
    return data;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
}



