const ilSecSelect = document.querySelector("#ilSec")
const ilceSecSelect = document.querySelector("#ilceSec")
const gosterBtn = document.querySelector("#gosterButton")
const resultDiv = document.querySelector("#resultDiv")

async function ilGetir(){
    const response = await (await fetch("https://turkiyeapi.dev/api/v1/provinces")).json()
    for(let il of Object.entries(response.data)){
        const ilOptions = document.createElement("option")
        ilOptions.innerHTML = il[1].name
        ilSecSelect.appendChild(ilOptions)
    }
    ilSecSelect.addEventListener("change",ilceGetir)
}
ilGetir()

async function ilceGetir(e){
    const ilceBosBirak = document.createElement("option")
    ilceBosBirak.style = "background-color: #836958; color: white; font-weight: bold;"
    ilceBosBirak.textContent = "İlçe seçme - Boş bırak"
    ilceSecSelect.innerHTML = ``
    ilceSecSelect.appendChild(ilceBosBirak)
    const response = await (await fetch(`https://turkiyeapi.dev/api/v1/provinces?name=${e.target.value}`)).json()
    const illerListe = []
    for(const ilce of Object.entries(response.data)){
        illerListe.push(ilce[1].districts)
    }
    illerListe[0].forEach(element => {
        const ilceOptions = document.createElement("option")
        ilceOptions.innerHTML = element.name
        ilceSecSelect.appendChild(ilceOptions)
    });
    gosterBtn.addEventListener("click",konumGetir)
}

async function konumGetir(){
    let url = ""
    if(ilceSecSelect.value == "İlçe seçme - Boş bırak"){
        url = `https://nominatim.openstreetmap.org/search?county=${ilSecSelect.value}&country=Turkey&format=json`
    }
    else{
        url = `https://nominatim.openstreetmap.org/search?city=${ilceSecSelect.value}&county=${ilSecSelect.value}&country=Turkey&format=json`
    }
   const konumData = await (await fetch(url)).json()
   let lat = konumData[0].lat
   let lon = konumData[0].lon
   havaDurumuGetir(lat,lon)
}

function clearData(){
    const currentData = document.querySelectorAll("#currentContainer")
    const dayData = document.querySelectorAll("#dayContainer")
    currentData.forEach((e)=>e.remove())
    dayData.forEach((e)=>e.remove())
}

const gunler = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

async function havaDurumuGetir(lat,lon){
    clearData()
    const data = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&forecast_days=7&timezone=auto`)).json()
    const weathercode = Object.entries(data.daily)[4][1]
    const wCodes = await (await fetch("../weathercode.json")).json()
    const temperature_2m_max = Object.entries(data.daily)[1][1]
    const temperature_2m_min = Object.entries(data.daily)[2][1]
    const bugun = new Date();
    let textGap = ""
    if(String(ilSecSelect.value).length + String(ilceSecSelect.value).length <=16){
        textGap = '&nbsp;'.repeat(4)
    }else{
        textGap = ""
    }
    let iconClassList = []
    let codeTest = []
    for(let i=0; i<7; i++){
        for(const code of Object.entries(wCodes)){
            if((code[0]) == weathercode[i]){
                iconClassList.push(code[1].icon_class)
                codeTest.push(code[1].description)
            }
        }
        console.log(codeTest);
        const tarih = new Date();
        tarih.setDate(bugun.getDate() + i);
        const gunIndex = tarih.getDay();
        if(i===0){
            const currentData = document.createElement("div")
            currentData.id = "currentContainer"
            currentData.className = "container"
            let h1Tag = ""
            if(ilceSecSelect.value == "İlçe seçme - Boş bırak"){
                h1Tag = `<h1 style="padding-left: 180px; display: inline;">${ilSecSelect.value + '&nbsp;'.repeat(20)}</h1>`
            }else{
                if(textGap == ""){
                    h1Size = "29px"
                }else{
                    h1Size = "2.5rem"
                }
                h1Tag = `<h1 style="padding-left: 180px; display: inline; font-size: ${h1Size};">${ilSecSelect.value}, ${ilceSecSelect.value + textGap}</h1>`
            }
            currentData.innerHTML =
            `
            ${h1Tag}
            <i style="margin-left: 10px;" class="weather-icon-big ${iconClassList[i]}"></i>
            <p style="font-size: 60px; font-weight: bold; display: inline; padding-left: 30px; color: #a17c63;">${((temperature_2m_min[i] + (temperature_2m_max[i] * 1.2))/2).toFixed(1)}°</p>
            <p style="font-size: 24px; font-weight: bold; display: inline;">Min: ${temperature_2m_min[i]}°</p>
            <p style="font-size: 24px; font-weight: bold; display: inline; padding-left: 10px;">Max: ${temperature_2m_max[i]}°</p>
            <p style="font-size: 28px; font-weight: bold; display: inline; padding-left: 12px; margin-right: 115px;">${codeTest[i]}</p>
            <p style="font-size: 28px; font-weight: bold; display: inline; color: #a17c63;">2025-07-12 - ${gunler[gunIndex]}</p>
            `
            resultDiv.appendChild(currentData)
        }else{
            const dayData = document.createElement("div")
            dayData.id = "dayContainer"
            dayData.className = "container"
            let h1Tag = ""
            if(ilceSecSelect.value == "İlçe seçme - Boş bırak"){
                h1Tag = `<h1 style="padding-left: 180px; display: inline;">${ilSecSelect.value + '&nbsp;'.repeat(20)}</h1>`
            }else{
                if(textGap == ""){
                    h1Size = "29px"
                }else{
                    h1Size = "2.5rem"
                }
                h1Tag = `<h1 style="padding-left: 180px; display: inline; font-size: ${h1Size};">${ilSecSelect.value}, ${ilceSecSelect.value + textGap}</h1>`
            }
            dayData.innerHTML =
            `
            ${h1Tag}
            <i style="margin-left: 20px; padding-right: 52px;" class="weather-icon ${iconClassList[i]}"></i>
            <p style="font-size: 50px; font-weight: bold; display: inline; padding-left: 30px; color: #a17c63;">${((temperature_2m_min[i] + (temperature_2m_max[i] * 1.2))/2).toFixed(1)}°</p>
            <p style="font-size: 22px; font-weight: bold; display: inline;">Min: ${temperature_2m_min[i]}°</p>
            <p style="font-size: 22px; font-weight: bold; display: inline; padding-left: 10px; margin-right: 10px;">Max: ${temperature_2m_max[i]}°</p>
            <p style="font-size: 22px; font-weight: bold; display: inline; padding-left: 17px; margin-right: 115px;">${codeTest[i]}</p>
            <p style="font-size: 22px; font-weight: bold; display: inline; color: #a17c63;">2025-07-12 - ${gunler[gunIndex]}</p>
            `
            resultDiv.appendChild(dayData)
        }
    }
}