import React, { useEffect, useState } from 'react';

import './App.css';

const FOCUS_TIME = 20;
const SHORT_BREAK = 3;
const LONG_BREAK = 5;
const MAX_CYCLE = 3;

/*
{
  userName: result.name,
  goal: result.goal,
  mode: 'focus',
  pomos: result.pomos,
  shortBreak: result.shortBreak,
  longBreak: result.longBreak,
  longBreakInterval: result.longBreakInterval,
  time: 0,
  count: 1,
  currCycle: 0
} */

/*
    { name: 'Jason', mode: 'focus', time: 0, count: Math.floor(Math.random() * 100), currCycle: 1 },
    { name: 'Emma', mode: 'focus', time: 0, count: Math.floor(Math.random() * 100), currCycle: 1 },
    { name: 'Olivia', mode: 'focus', time: 0, count: Math.floor(Math.random() * 100), currCycle: 1 }, */

function App() {
  //name !claim 'next app' 2 5 2 3 2
  const [timers, setTimers] = useState([
    {
      userName: 'Michael',
      goal: 'react app',
      mode: 'focus',
      pomos: 3,
      pomo: 3,
      shortBreak: 1,
      longBreak: 2,
      longBreakInterval: 3,
      time: 0,
      count: Math.floor(Math.random() * 100),
      currPomo: 0
    }
  ]);

  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [nameSet, setNameSet] = useState(new Set(['Michael', 'Jason', 'Emma', 'Olivia']));
  const [newName, setNewName] = useState(`!claim name 'next app' 2 5 2 3 2`);

  const [messages, setMessages] = useState(
    [
      "chat start",
      "!action name 'some words here' 3 25 5 15 3"
    ]
  );

  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor(now - lastUpdate);
      setTotalTime(totalTime + elapsed);
      // console.log("elapsed", elapsed, "total time", totalTime, "now", now, "lastUpdate", lastUpdate);
      setLastUpdate(now);

      setTimers((prevTimers) =>
        prevTimers.map((timer) => {
          if (timer.currPomo === timer.pomos) {
            return timer;
          }

          if (timer.mode === 'focus' && timer.time === timer.pomo) {
            console.log(timer.currPomo + 1);
            console.log(timer.longBreakInterval);
            console.log((timer.currPomo + 1) % timer.longBreakInterval);
            console.log(`changing from focus to ${(timer.currPomo + 1) % timer.longBreakInterval === 0 ? 'long break' : 'short break'}`);
            return {
              ...timer,
              mode: (timer.currPomo + 1) % timer.longBreakInterval === 0 ? 'long break' : 'short break',
              currPomo: timer.currPomo + 1,
              time: 0,
            };
          } else if (timer.mode === 'short break' && timer.time === timer.shortBreak) {
            console.log("changing from short break to focus");
            return {
              ...timer,
              mode: 'focus',
              time: 0,
            };
          } else if (timer.mode === 'long break' && timer.time === timer.longBreak) {
            console.log("changing from long break to focus");
            return {
              ...timer,
              mode: 'focus',
              time: 0,
            };
          } else {
            if (timer.count >= 999) {
              return { ...timer, count: (timer.count + elapsed) % 100, time: timer.time + 1 };
            } else {
              return { ...timer, count: timer.count + elapsed };
            }
          }
        })
      );
    }, 10);
    // console.log(timers[0]);
    // console.log(messages);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  const handleNewNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNewNameSubmit = (event) => {
    event.preventDefault();
    setMessages((prevMessages) => [
      ...prevMessages,
      newName
    ]);
    if (!nameSet.has(newName)) {
      setTimers((prevTimers) => [
        ...prevTimers,
        { name: newName, mode: 'focus', time: 0, count: Math.floor(Math.random() * 100), currCycle: 0 },
      ]);
      setNameSet((prevNameSet) => new Set(prevNameSet).add(newName));
      setNewName('');
    }
  };

  const handleChatMessage = (event) => {
    event.preventDefault();

    if (newName.split(' ')[0] === '!claim') {
      const result = dissectString(newName);
      setMessages((prevMessages) => [
        ...prevMessages,
        newName
      ]);
      console.log(result);
      if (!nameSet.has(result.userName)) {
        setTimers((prevTimers) => [
          ...prevTimers,
          {
            userName: result.userName,
            goal: result.goal,
            mode: 'focus',
            pomos: result.pomos,
            pomo: result.pomo,
            shortBreak: result.shortBreak,
            longBreak: result.longBreak,
            longBreakInterval: result.longBreakInterval,
            time: 0,
            count: 1,
            currPomo: 0
          },
        ]);
      }
    }

    setNameSet((prevNameSet) => new Set(prevNameSet).add(newName));
    setNewName('');
  }

  function validClaim(result) {
    let totalPomoTime = result.pomo * result.pomos;
    return true;
  }

  function dissectString(input) {
    console.log(input);
    const result = [];
    let currentWord = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (char === ' ' && !inQuotes) {
        if (currentWord) {
          result.push(currentWord);
          currentWord = '';
        }
      } else if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
      } else {
        currentWord += char;
      }
    }

    if (currentWord) {
      result.push(currentWord);
    }

    console.log(result);

    let ans = {};

    ans.userName = result[0];
    ans.action = result[1].slice(1);
    ans.goal = result[2];
    ans.pomos = parseInt(result[3]);
    ans.pomo = parseInt(result[4]);
    ans.shortBreak = parseInt(result[5]);
    ans.longBreak = parseInt(result[6]);
    ans.longBreakInterval = parseInt(result[7]);
    ans.currPomo = 0;

    console.log(ans);

    return ans;
  }


  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }


  return (
    <div className="flex flex-row">
      <table className="w-1/2 bg-[red] text-center" style={{ border: "1px solid" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid" }}>Name</th>
            <th style={{ border: "1px solid" }}>Goal</th>
            <th style={{ border: "1px solid" }}>Current</th>
            <th style={{ border: "1px solid" }}>Mode</th>
            <th style={{ border: "1px solid" }}>Time</th>
            <th style={{ border: "1px solid" }}>Count</th>
          </tr>
        </thead>
        <tbody>
          {timers.map((timer, key) => (
            <tr key={timer.name}>
              <td style={{ border: "1px solid" }}>{timer.userName}</td>
              <td style={{ border: "1px solid" }}>{timer.goal}</td>
              <td style={{ border: "1px solid" }}>{"" + (timer.currPomo + 1)}</td>
              <td style={{ border: "1px solid" }}>{timer.mode}</td>
              <td style={{ border: "1px solid" }}>{formatTime(timer.time)}</td>
              <td style={{ border: "1px solid" }}>{timer.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-col bg-[red] flex-grow ml-[20px]">
        <div className="flex flex-col h-[300px]" style={{ overflowY: "scroll" }}>
          {
            messages.map((message, key) => {
              return <h1 key={key}>{message}</h1>
            })
          }
        </div>
        <form className="flex flex-row bg-[orange]" onSubmit={handleChatMessage}>
          <input className="flex flex-grow" type="text" value={newName} onChange={handleNewNameChange} />
          <button type="submit">Add Timer</button>
        </form>
      </div>
    </div>
  );
}

export default App;
