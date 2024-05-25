let preacherButton = document.getElementById("preacher");
        let cityButton = document.getElementById("city");
        let streetButton = document.getElementById("street");
        let numberButton = document.getElementById("number");
        let preacherSearch = document.getElementById("preacherSearch");
        let citySearch = document.getElementById("citySearch");
        let streetSearch = document.getElementById("streetSearch");
        let numberSearch = document.getElementById("numberSearch");
        let kindButton = document.getElementById("kind");
        let kindSearch = document.getElementById("kindSearch");

        preacherSearch.style.display = "none";
        citySearch.style.display = "none";
        streetSearch.style.display = "none";
        numberSearch.style.display = "none";
        kindSearch.style.display = "none";
        

        cityButton.addEventListener("click", function(){
            preacherSearch.style.display = "none";
            citySearch.style.display = "block";
            streetSearch.style.display = "none";
            numberSearch.style.display = "none";
            kindSearch.style.display = "none";
        })
        preacherButton.addEventListener("click", function(){
            preacherSearch.style.display = "block";
            citySearch.style.display = "none";
            streetSearch.style.display = "none";
            kindSearch.style.display = "none";
            numberSearch.style.display = "none";
        })
        streetButton.addEventListener("click", function(){
            preacherSearch.style.display = "none";
            citySearch.style.display = "none";
            streetSearch.style.display = "block";
            numberSearch.style.display = "none";
            kindSearch.style.display = "none";
        })
        numberButton.addEventListener("click", function(){
            preacherSearch.style.display = "none";
            citySearch.style.display = "none";
            streetSearch.style.display = "none";
            numberSearch.style.display = "block";
            kindSearch.style.display = "none";
        })
        kindButton.addEventListener("click", function(){
                citySearch.style.display = "none";
                streetSearch.style.display = "none";
                numberSearch.style.display = "none";
                kindSearch.style.display = "block";
                preacherSearch.style.display = "none";
        })