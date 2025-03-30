const now = new Date();
let currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
const meals = ["Breakfast", "Lunch", "Snacks", "Dinner"];

function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString('en-US', options).replace(',', '');
    return date.toISOString().split('T')[0];
}

function createMealCards() {
    const container = document.getElementById("cards-container");
    container.innerHTML = "";
    document.getElementById("current-date").innerText = `${formatDate(currentDate)}`;

    meals.forEach(meal => {
        const card = `
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${meal}</h5>
                        <p class="card-text">Meal details for ${meal}</p>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

document.getElementById("prev-date").addEventListener("click", function (e) {
    e.preventDefault();
    if (currentDate.getDate() > 1) {
        currentDate.setDate(currentDate.getDate() - 1);
        createMealCards();
    }
});

document.getElementById("next-date").addEventListener("click", function (e) {
    e.preventDefault();
    if (currentDate.getDate() < daysInMonth) {
        currentDate.setDate(currentDate.getDate() + 1);
        createMealCards();
    }
});

document.addEventListener("DOMContentLoaded", createMealCards);

document.addEventListener("DOMContentLoaded", function () {
    const hostelType = document.getElementById("hostelType");
    const hostel = document.getElementById("hostel");
    const messType = document.getElementById("messType");
    const mess = document.getElementById("mess");

    const hostels = {
        mens: [
            "MH A", "MH B", "MH B ANNEX", "MH C", "MH D", "MH D ANNEX", "MH E", "MH F",
            "MH G", "MH H", "MH I", "MH J", "MH J ANNEX", "MH K", "MH L", "MH M", "MH M ANNEX",
            "MH N", "MH N ANNEX", "MH P", "MH Q", "MH R", "MH S", "MH T"
        ],
        ladies: [
            "LH A", "LH B", "LH C", "LH D", "LH E", "LH F", "LH G", "LH H", "LH J", "RGT H", "LH GH (Annex)"
        ]
    };

    const messOptions = {
        veg: ["Zenith Veg", "SRCC Veg", "Darling Veg"],
        nonveg: ["Zenith Non-Veg", "SRCC Non-Veg", "Darling Non-Veg"],
        special: ["Zenith Special", "SRCC Special", "Darling Special"]
    };
    
    

    // Update hostel dropdown based on hostel type selection
    hostelType.addEventListener("change", function () {
        hostel.innerHTML = '<option value="">Select Hostel</option>'; // Reset options

        if (hostelType.value && hostels[hostelType.value]) {
            hostels[hostelType.value].forEach(hostelName => {
                const option = document.createElement("option");
                option.value = hostelName;
                option.textContent = hostelName;
                hostel.appendChild(option);
            });
        }
    });

    // Update mess dropdown based on mess type selection
    messType.addEventListener("change", function () {
        mess.innerHTML = '<option value="">Select Mess</option>'; // Reset options

        if (messType.value && messOptions[messType.value]) {
            messOptions[messType.value].forEach(messName => {
                const option = document.createElement("option");
                option.value = messName;
                option.textContent = messName;
                mess.appendChild(option);
            });
        }
    });
});


  