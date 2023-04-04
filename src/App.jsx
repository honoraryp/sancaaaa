import { useState } from 'react'
import ApiCalendar from 'react-google-calendar-api';
import './App.css'

let header = document.getElementById("my_header");
let luoghi = {
  "sala 23" : "(Piano terra, corridoio Giallo)",
  "sala 22" : "(Piano terra, corridoio Giallo)",
  "sala 18" : "(Piano terra, corridoio Arancio)",
  "sala 16" : "(Piano terra, corridoio Arancio)",
  "salone" : "(Piano terra, in fondo al corridoio, porta a destra)",
  "sala giochi" : "(Piano terra, in fondo al corridoio, porta a destra)",
  "sala verde" : "(Piano terra, in fondo al corridoio dopo il Salone)",
  "biblioteca" : "(Primo piano, salite le scale a destra)",
  "sala 39" : "(Piano interrato, a destra in fondo al corridoio)",
  "polivalente" : "(Piano terra, porta a destra all'ingresso)",
  "teatro" : "(Piano terra, porta a destra all'ingresso)",
  "aula 3" : "(Primo piano, corridoio Verde)",
  "":""
}

let description;
const ora = Date.now() + 3600000;

function App() {

  const config = {
    clientId: '778032292314-ghr3kfa9g97t69oq6kel1js3148c83gi.apps.googleusercontent.com',
    apiKey: 'AIzaSyA2Vh8wdc7F3sh3S_SxmT7y3UwOEs1Ypks',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    discoveryDocs: [
      'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    ],
  };

  const apiCalendar = new ApiCalendar(config);

  async function listUpcomingEvents() {
    let events;
    let outputs = [];
    let sorted = [];
    try {
      let calendar_list = await apiCalendar.listCalendars();
       //un giorno prima
      const stasera = new Date();
      stasera.setUTCHours(23,59,59,999);
      for(let i=0; i<calendar_list.result.items.length; i++){
        let cal = calendar_list.result.items[i];
        if(cal.id == "it.italian#holiday@group.v.calendar.google.com" || cal.id == "addressbook#contacts@group.v.calendar.google.com"){
          continue;
        }
        description= cal.description
        await apiCalendar.listEvents({
          calendarId: cal.id,
          timeMin: new Date(ora).toISOString(),
          timeMax: stasera.toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: 'startTime'
        }).then(({ result }) => {
            events = result.items
        });
        let processedEvents = events.map(e => mapEventObject(e));
        if(processedEvents.length>0){
          outputs.push(processedEvents);
        }
      }

      let notSorted = [].concat(...outputs)
      notSorted.sort(
        (eventA, eventB) => ( eventA.inizio - eventB.inizio )
      )
      sorted = notSorted;
      for(var i in sorted){
        sorted[i]= createEvent(sorted[i]);
      }
      document.getElementById("events-container").innerHTML = sorted.join('');
      createTitle();
      try{
        document.getElementById('root').remove()
      }catch(err){}

    } catch (err) {
      console.log(err.message)
    }

    if (!sorted || sorted.length == 0) {
      document.getElementById('events-container').innerHTML = 'No events found.';
      return;
    }
  }

  return (
    <div className="App">
      <div id="buttons">
        <button id="signin_button" onClick={() => {
          apiCalendar.tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
              throw (resp);
            }
            console.log("user logged in")
            console.log("Running setInterval...")
            setInterval(() => {
              listUpcomingEvents();
              console.log("Updated events")
            }, 1000*60*10);
            listUpcomingEvents()
            // pageScroll()
          };
          apiCalendar.handleAuthClick()
        }}> Sign In </button>
        <button id="events_button" onClick={() => {
          listUpcomingEvents()
        }
        }>Refresh events</button>
      </div>
    </div>
  )
}

// function pageScroll() {
//   window.scrollBy(0,1);
//   scrolldelay = setTimeout(pageScroll,10);
//   window.scrollBy(0,-1);
//   scrolldelay = setTimeout(pageScroll,-10);
// }

const getDayOfWeek = (weekday) => ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"][weekday];
const getMonth = (month) => ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'][month];

const getHour = (hour) => hour;
const getMinute = (minute) => (minute === 0 ? "00" : minute);

function processDate(date){
  const hour = getHour(date.getHours() === 0 ? false : getHour(date.getHours()));
  const minute = getMinute(date.getMinutes());
  const time = hour && `${hour}:${minute}`;
  return{
    day: date.getDate(),
    weekday: getDayOfWeek(date.getDay()),
    month: getMonth(date.getMonth()),
    year: date.getFullYear(),
    time,
  }
}

function mapEventObject(event){
  let location = event.organizer.displayName;
  const startDate = event.start.dateTime
  ? processDate(new Date(event.start.dateTime)) 
  : processDate(new Date(`${event.start.date}T00:00:00`))
  const endDate = event.end.dateTime 
  ? processDate(new Date(event.end.dateTime)) 
  : processDate(new Date(`${event.end.date}T00:00:00`))
  let dateRange;
  if(startDate.date !== endDate.date){
    dateRange= `${startDate.month} ${startDate.date}-${endDate.month} ${endDate.date}`;
  } else if(!startDate.time){
    dateRange = `${startDate.month} ${startDate.date}`;
  } else {
    dateRange = `${startDate.time}`;
  }
  const inizio = new Date(event.start.dateTime)
  ? new Date(event.start.dateTime)
  : new Date(`${event.start.date}T00:00:00`)
  let stato;
  if(new Date(event.end.dateTime) > new Date(ora) && new Date(event.start.dateTime) < new Date(ora)){
    stato = "Evento in corso"
  }
  else{ 
    stato = ""
  }
  return {
    name: event.summary.toUpperCase(),
    start: startDate,
    end: endDate,
    dateRange,
    location,
    inizio,
    stato,
  }
}

function createEvent(e){
  let colorScheme = "from-lush to-b-lush";
  let text = "text-slate-900";
  try{
    if(e.location.toLowerCase() == "sala 23" || e.location.toLowerCase() == "sala 22" || e.location.toLowerCase() == "sala 25"){
      colorScheme = "from-soda to-b-soda";
    }
    else if(e.location.toLowerCase() == "sala 18" || e.location.toLowerCase() == "sala 16"){
      colorScheme = "from-mars to-conquest";
    }
    else if(e.location.toLowerCase() == "salone" || e.location.toLowerCase() == "sala verde" || e.location.toLowerCase() == "sala giochi"){
      colorScheme = "from-nice-blue-light to-nice-blue";
      text = "text-slate-900"
    }
    else if(e.location.toLowerCase() == "aula 3" || e.location.toLowerCase() == "sala 15 (universitaria)"|| e.location.toLowerCase() == "sala 15(universitaria)"|| e.location.toLowerCase() == "sala 15"){
      colorScheme = "from-luscious to-lime";
    }
    else if(e.location.toLowerCase() == "biblioteca" || e.location.toLowerCase() == "sala 39"){
      colorScheme = "from-purple to-love";
      text = "text-slate-100";
    }
    else if(e.location.toLowerCase() == "teatro" || e.location.toLowerCase() == "polivalente" || e.location.toLowerCase() == "teatro polivalente" ){
      colorScheme = "from-mauve to-b-mauve";
      text = "text-slate-100";
    }
  } catch (err) {}
  return `<article class="bg-white shadow-2xl shadow-slate-200 rounded-lg">
          <div class="grid-cols-9 items-center p-3 shadow-2xl bg-gradient-to-br ${colorScheme} text-justify ${text} grid rounded-lg">
            <div> 
              <p class="text-left text-2xl">Ore ${e.dateRange}</p>
            </div>
            <div class="col-start-2 col-end-6"> 
              <p class="text-center text-3xl font-bold uppercase">${e.name}</p>
            </div>
            <div class="col-start-6 col-end-9"> 
              <p class="text-center text-2xl">${e.location}</p>
              <p class="text-center text-xl">${luoghi[e.location?.toLowerCase()]}</p>
            </div>
            <div> 
              <p class="text-center text-2xl">${e.stato}</p>
            </div>
          </div>
          </article>`
}

function createTitle(){
  let title = processDate(new Date(Date.now()));
  let titolo = title.weekday+" "+title.day+" "+title.month+" "+title.year;
  header.innerHTML = titolo;
  return 
}

export default App
