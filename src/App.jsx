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
}

function App() {
  
  const [loggedIn, setLoggedIn] = useState(false)

  function changeLoggedIn() {
    setLoggedIn(!loggedIn)
  }

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
      const dieciminutifa = Date.now(); //un giorno prima
      const stasera = new Date();
      stasera.setUTCHours(23,59,59,999);
      const tradieciminuti = Date.now()+1000*60*60*24; //un giorno dopo
      for(let i=0; i<calendar_list.result.items.length; i++){
        let cal = calendar_list.result.items[i];
        if(cal.id == "it.italian#holiday@group.v.calendar.google.com" || cal.id == "addressbook#contacts@group.v.calendar.google.com"){
          continue;
        }
        // console.log(cal)
        await apiCalendar.listEvents({
          calendarId: cal.id,
          timeMin: new Date(dieciminutifa).toISOString(),
          timeMax: new Date(tradieciminuti).toISOString(),
          // timeMax: stasera.toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: 'startTime'
        }).then(({ result }) => {
            events = result.items
        });
        let processedEvents = events.map(e => mapEventObject(e));
        // let ev = processedEvents.map(e => createEvent(e)).join('');
        if(processedEvents.length>0){
          outputs.push(processedEvents);
        }
        // console.log(processedEvents)
        
        // for(let j=0; j<processedEvents.length; j++){
        //   let time;
        //   try{
        //     if(processedEvents[j].dateRange.length < 5){
        //       time = "0"+processedEvents[j].dateRange;
        //     }
        //     else{
        //       time = processedEvents[j].dateRange;
        //     }
        //     dict[time] = processedEvents[j];
        //   }catch(err){ 
        //     continue;
        //   }
        // }
      }
      // let sorted = sortOnKeys(dict);
      
      // console.log(outputs)
      let notSorted = [].concat(...outputs)
      // sorted.sort()
      // sortArrayOfCalendarEventsChronologically(sorted)
      console.log(notSorted)
      // console.log(sorted[0].inizio)
      notSorted.sort(
        (eventA, eventB) => ( eventA.inizio - eventB.inizio )
      )
      console.log(notSorted)
      sorted = notSorted
      // console.log(outputs)
      for(var i in sorted){
        // let evs = sorted[key];
        sorted[i]= createEvent(sorted[i]);
        // sorted.push(ev);
      }
      // console.log(outputs)
      document.getElementById("events-container").innerHTML = sorted.join('');
      createTitle();
      // try{
      //   document.getElementById('root').remove()
      // }catch(err){}
      // console.log(events)

    } catch (err) {
      console.log(err.message)
    }

    if (!sorted || sorted.length == 0) {
      document.getElementById('events-container').innerHTML = 'No events found.';
      return;
    }
  }

  // setInterval(() => {
  //   listUpcomingEvents();
  // }, 1000*60*5);

  return (
    <div className="App">
      
      {loggedIn ? (
        <div>
          <button id="events_button" onClick={listUpcomingEvents}>Events</button>
        </div>
      ) : (
        <button id="signin_button" onClick={() => {
          apiCalendar.handleAuthClick()
          changeLoggedIn()
        }}> Sign In </button>
      )}

    </div>
  )
}

function sortArrayOfCalendarEventsChronologically(array) {
  if (!array || array.length == 0) {
    return 0;
  }
  var temp = [];
  let mid=Math.floor((array.length)/2);
  temp.push(array[mid]);
  for(var i=0; i<array.length; i++){
    
  }
  return temp;
}

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
  const location = event.organizer.displayName;
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
  console.log(event.summary, inizio)
  ? new Date(event.end.dateTime)
  : new Date(`${event.end.date}T00:00:00`)
  return {
    name: event.summary.toUpperCase(),
    start: startDate,
    end: endDate,
    dateRange,
    location,
    inizio
  }
}

function createEvent(e){
  let colorScheme = "teal-500";
  try{
    if(e.location.toLowerCase() == "sala 23" || e.location.toLowerCase() == "sala 22" || e.location.toLowerCase() == "sala 25"){
      colorScheme = "amber-300";
    }
    else if(e.location.toLowerCase() == "sala 18" || e.location.toLowerCase() == "sala 16"){
      colorScheme = "orange-500";
    }
    else if(e.location.toLowerCase() == "salone" || e.location.toLowerCase() == "sala verde" || e.location.toLowerCase() == "sala giochi"){
      colorScheme = "sky-300";
    }
    else if(e.location.toLowerCase() == "aula 3" || e.location.toLowerCase() == "sala 15 (universitaria)"|| e.location.toLowerCase() == "sala 15(universitaria)"|| e.location.toLowerCase() == "sala 15"){
      colorScheme = "lime-600";
    }
    else if(e.location.toLowerCase() == "biblioteca" || e.location.toLowerCase() == "sala 39"){
      colorScheme = "red-400";
    }
    else if(e.location.toLowerCase() == "teatro" || e.location.toLowerCase() == "polivalente" || e.location.toLowerCase() == "teatro polivalente" ){
      colorScheme = "fuchsia-400";
    }
  }catch(err){}
  // console.log(e)
  return `<article class="bg-white shadow-xl shadow-slate-200 rounded-lg">
          <div class="grid-cols-6 p-2 shadow bg-${colorScheme} text-justify text-gray-950 grid rounded-lg">
            <div> 
              <p class="text-left text-2xl">Ore ${e.dateRange}</p>
            </div>
            <div class="col-start-2 col-end-5"> 
              <p class="text-center text-3xl font-bold uppercase">${e.name}</p>
            </div>
            <div class="col-start-5 col-end-7"> 
              <p class="text-center text-2xl">${e.location}</p>
              <p class="text-center text-2xl">${luoghi[e.location]}</p>
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