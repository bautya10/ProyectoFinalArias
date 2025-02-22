const baseUrl = "https://api.coingecko.com/api/v3";
const respaldo = {
    usd: { value: 1 },
    eur: { value: 0.92 },
    btc: { value: 0.000025 },
    eth: { value: 0.00035 },
    ars: { value: 870 }
};

let exchangeRates = {};

async function loadExchangeRates() {
    try {
        const response = await fetch(`${baseUrl}/exchange_rates`);
        const data = await response.json();
        
        if (data.rates) {
            exchangeRates = data.rates;
        } else {
            throw new Error("No se pudieron cargar las tasas de cambio.");
        }
    } catch (error) {
        console.warn("Error en la API, usando datos locales.", error);
        exchangeRates = respaldo;
    }
    loadCurrencies();
}

function loadCurrencies() {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");

    const options = Object.keys(exchangeRates).map(currency => {
        const option = new Option(currency.toUpperCase(), currency);
        fromSelect.appendChild(option.cloneNode(true));
        return option;
    });

    options.forEach(option => toSelect.appendChild(option));

    $('.currency-select').select2();
}

function convertCurrency(amount, from, to) {
    if (exchangeRates[from] && exchangeRates[to]) {
        return (amount * exchangeRates[to].value / exchangeRates[from].value).toFixed(8);
    }
    return null;
}

document.getElementById("converter-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById("amount").value);
    const from = document.getElementById("from").value;
    const to = document.getElementById("to").value;
    
    if (isNaN(amount) || amount <= 0) {
        return Swal.fire("Error", "Ingrese una cantidad válida.", "error");
    }
    
    const result = convertCurrency(amount, from, to);
    if (result !== null) {
        document.getElementById("result").innerHTML = `<strong>${amount} ${from.toUpperCase()} = ${result} ${to.toUpperCase()}</strong>`;
    } else {
        Swal.fire("Error", "Conversión no disponible.", "error");
    }
});

document.getElementById("swap-button").addEventListener("click", function () {
    const fromSelect = document.getElementById("from");
    const toSelect = document.getElementById("to");

    const fromValue = fromSelect.value;
    const toValue = toSelect.value;

    fromSelect.value = toValue;
    toSelect.value = fromValue;

    $('#from').trigger('change');
    $('#to').trigger('change');
});

loadExchangeRates();
