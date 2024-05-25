let beginNumberDiv = document.getElementById("beginNumberDiv");
    let endNumberDiv = document.getElementById("endNumberDiv");
    let streetLabel = document.getElementById("streetLabel");
    let cityLabel = document.getElementById("cityLabel");
    let kindSelect = document.getElementById("kind");

    beginNumberDiv.style.display = "none";
    endNumberDiv.style.display = "none";

    if(kindSelect.value === "village") {
        beginNumberDiv.style.display = "none";
        endNumberDiv.style.display = "none";
        cityLabel.innerHTML = `Edytuj miejscowość (ci)`;
    } else if(kindSelect.value === "market"){
            beginNumberDiv.style.display = "none";
            endNumberDiv.style.display = "none";
            streetLabel.innerText = "Edytuj ulicę (e)"
            cityLabel.innerHTML = `Edytuj miejscowość`;
    } else {
        beginNumberDiv.style.display = "block";
        endNumberDiv.style.display = "block";
    }


    document.getElementById("kind").addEventListener('change', (event) => {
        if(event.target.value === "city"){
            beginNumberDiv.style.display = "block";
            endNumberDiv.style.display = "block";
        } else if(event.target.value === "village") {
            beginNumberDiv.style.display = "none";
            endNumberDiv.style.display = "none";
            cityLabel.innerHTML = `Miejscowość (ci po przecinku) <span class="text-danger" style="font-size: 13px;">*wymagane</span>`;
        } else if(event.target.value === "market"){
            beginNumberDiv.style.display = "none";
            endNumberDiv.style.display = "none";
            streetLabel.innerText = "Ulica (e po przecinku)"
            cityLabel.innerHTML = `Miejscowość <span class="text-danger" style="font-size: 13px;">*wymagane</span`;
        }
    })