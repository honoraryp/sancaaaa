import { useState } from 'react'
import ApiCalendar from 'react-google-calendar-api';
import './App.css'

let header = document.getElementById("my_header");

function App() {
  
  const [loggedIn, setLoggedIn] = useState(false)

  function changeLoggedIn() {
    setLoggedIn(!loggedIn)
  }

  const config = {
    clientId: '778032292314-3nau8dk3vbn5nbpn8njcsrp396h8idvo.apps.googleusercontent.com',
    apiKey: 'AIzaSyA5nt6FIMdKaXpUx1Em_M_EKaxnb3zryV0',
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    discoveryDocs: [
      'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
    ],
  };
  
  const apiCalendar = new ApiCalendar(config);

  async function listUpcomingEvents() {
    let events;
    let outputs = [];
    try {
      let calendar_list = await apiCalendar.listCalendars();
      const dieciminutifa = Date.now()-1000*60*60*24; //un giorno prima
      const tradieciminuti = Date.now()+1000*60*60*24; //un giorno dopo
      for(let i=0; i<calendar_list.result.items.length; i++){
        let cal = calendar_list.result.items[i];
        await apiCalendar.listEvents({
          calendarId: cal.id,
          // timeMin: new Date(dieciminutifa).toISOString(),
          // timeMax: new Date(tradieciminuti).toISOString(),
          showDeleted: false,
          singleEvents: true,
          orderBy: 'startTime'
        }).then(({ result }) => {
            events = result.items
        });
        let processedEvents = events.map(e => mapEventObject(e));
        let ev= processedEvents.map((event, i) => createEvent(event, i)).join('')
        outputs.push(ev);
        
      }
      document.getElementById("events-container").innerHTML = outputs.join('');
      createTitle();

    } catch (err) {
      console.log(err.message)
    }

    if (!events || events.length == 0) {
      document.getElementById('events-container').innerHTML = 'No events found.';
      return;
    }
  }

  
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
          listUpcomingEvents
        }}> Sign In </button>
      )}

    </div>
  )
}


const getRandomNumBetween = (min, max) => Math.floor(Math.random() * (max-min +1)) + min;
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
  const location = event.organizer.displayName ;
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
  return {
    name: event.summary,
    start: startDate,
    end: endDate,
    dateRange,
    location
  }
}

function createEvent(e, i){
  const colors = ['blue', 'amber', 'indigo', 'pink', 'rose'];
  const colorScheme = colors[getRandomNumBetween(0, colors.length - 1)];
  return `<article class="bg-white shadow-xl shadow-slate-200 rounded-lg">
  <div class="p-2 shadow bg-${colorScheme}-500 text-indigo-50 upper grid place-items-center rounded-t-lg">
    <p class="text-3xl font-bold uppercase">${e.name}</p>
  </div>
  <div class="p-2 md:p-4 lg:p-6 grid gap-2 md:gap-4">
    <h2 class="font-bold text-2xl">Ore ${e.dateRange}  ${e.location}</h2>
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
