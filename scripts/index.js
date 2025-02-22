const ApiHandler = {
    baseUrl: "https://api.coingecko.com/api/v3",
    respaldo: {
        usd: { value: 1 },
        eur: { value: 0.92 },
        btc: { value: 0.000025 },
        eth: { value: 0.00035 },
        ars: { value: 870 }
    },
    async loadExchangeRates() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

            const response = await fetch(`${this.baseUrl}/exchange_rates`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Error en la respuesta de la API");
            const data = await response.json();
            return data.rates || this.respaldo;
        } catch (error) {
            console.warn("Error en la API, usando datos locales.", error);
            return this.respaldo;
        }
    }
};

const DomHandler = {
    loadCurrencies(exchangeRates) {
        const fromSelect = document.getElementById("from");
        const toSelect = document.getElementById("to");

        fromSelect.innerHTML = '<option value="" disabled selected>Seleccione su moneda/criptomoneda</option>';
        toSelect.innerHTML = '<option value="" disabled selected>Seleccione su moneda/criptomoneda</option>';

        Object.keys(exchangeRates).forEach(currency => {
            const option = new Option(currency.toUpperCase(), currency);
            fromSelect.appendChild(option.cloneNode(true));
            toSelect.appendChild(option);
        });

        $('.currency-select').select2();
    },

    setupEventListeners() {
        document.getElementById("converter-form")?.addEventListener("submit", async function (e) {
            e.preventDefault();

            const amount = parseFloat(document.getElementById("amount").value);
            const from = document.getElementById("from").value;
            const to = document.getElementById("to").value;

            if (isNaN(amount) || amount <= 0) {
                return Swal.fire("Error", "Ingrese una cantidad válida.", "error");
            }

            const result = convertCurrency(amount, from, to);
            const resultElement = document.getElementById("result");
            if (result !== null && resultElement) {
                resultElement.innerHTML = `
                    <div class="result-box">
                        <strong>${amount} ${from.toUpperCase()} = ${result} ${to.toUpperCase()}</strong>
                    </div>
                `;
            } else {
                Swal.fire("Error", "Conversión no disponible.", "error");
            }
        });

        document.getElementById("swap-button")?.addEventListener("click", function () {
            const fromSelect = document.getElementById("from");
            const toSelect = document.getElementById("to");

            const fromValue = fromSelect.value;
            const toValue = toSelect.value;

            fromSelect.value = toValue;
            toSelect.value = fromValue;

            $('#from').trigger('change');
            $('#to').trigger('change');
        });
    }
};

function convertCurrency(amount, from, to) {
    return exchangeRates[from] && exchangeRates[to]
        ? (amount * exchangeRates[to].value / exchangeRates[from].value).toFixed(8)
        : null;
}

let exchangeRates = {};

async function init() {
    exchangeRates = await ApiHandler.loadExchangeRates();
    DomHandler.loadCurrencies(exchangeRates);
    DomHandler.setupEventListeners();
}

init();