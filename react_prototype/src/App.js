import React, { useEffect, useState } from "react";

import "./App.css";

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
      userName: "Michael",
      goal: "react app",
      mode: "focus",
      pomos: 3,
      duration: 3,
      shortBreak: 1,
      longBreak: 2,
      longBreakInterval: 3,
      time: 0,
      count: Math.floor(Math.random() * 100),
      currPomo: 0,
    },
  ]);

  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [nameSet, setNameSet] = useState(
    new Set(["Michael", "Jason", "Emma", "Olivia"])
  );
  const [newName, setNewName] = useState(`!claim name 'next app' 2 5 2 3 2`);

  const [messages, setMessages] = useState([
    "chat start",
    "!action name 'some words here' 3 25 5 15 3",
  ]);

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

          if (timer.mode === "focus" && timer.time === timer.duration) {
            console.log(timer.currPomo + 1);
            console.log(timer.longBreakInterval);
            console.log((timer.currPomo + 1) % timer.longBreakInterval);
            console.log(
              `changing from focus to ${
                (timer.currPomo + 1) % timer.longBreakInterval === 0
                  ? "long break"
                  : "short break"
              }`
            );
            return {
              ...timer,
              mode:
                (timer.currPomo + 1) % timer.longBreakInterval === 0
                  ? "long break"
                  : "short break",
              currPomo: timer.currPomo + 1,
              time: 0,
            };
          } else if (
            timer.mode === "short break" &&
            timer.time === timer.shortBreak
          ) {
            console.log("changing from short break to focus");
            return {
              ...timer,
              mode: "focus",
              time: 0,
            };
          } else if (
            timer.mode === "long break" &&
            timer.time === timer.longBreak
          ) {
            console.log("changing from long break to focus");
            return {
              ...timer,
              mode: "focus",
              time: 0,
            };
          } else {
            if (timer.count >= 999) {
              return {
                ...timer,
                count: (timer.count + elapsed) % 100,
                time: timer.time + 1,
              };
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
    setMessages((prevMessages) => [...prevMessages, newName]);
    if (!nameSet.has(newName)) {
      setTimers((prevTimers) => [
        ...prevTimers,
        {
          name: newName,
          mode: "focus",
          time: 0,
          count: Math.floor(Math.random() * 100),
          currCycle: 0,
        },
      ]);
      setNameSet((prevNameSet) => new Set(prevNameSet).add(newName));
      setNewName("");
    }
  };

  const handleChatMessage = (event) => {
    event.preventDefault();

    if (newName.split(" ")[0] === "!claim") {
      const result = dissectString(newName);
      setMessages((prevMessages) => [...prevMessages, newName]);
      console.log(result);
      if (!nameSet.has(result.userName)) {
        setTimers((prevTimers) => [
          ...prevTimers,
          {
            userName: result.userName,
            goal: result.goal,
            mode: "focus",
            pomos: result.pomos,
            duration: result.duration,
            shortBreak: result.shortBreak,
            longBreak: result.longBreak,
            longBreakInterval: result.longBreakInterval,
            time: 0,
            count: 1,
            currPomo: 0,
          },
        ]);
      }
    }

    setNameSet((prevNameSet) => new Set(prevNameSet).add(newName));
    setNewName("");
  };

  function validClaim(result) {
    let totalPomoTime = result.duration * result.pomos;
    return true;
  }

  function dissectString(input) {
    console.log(input);
    const result = [];
    let currentWord = "";
    let inQuotes = false;
    let quoteChar = "";

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (char === " " && !inQuotes) {
        if (currentWord) {
          result.push(currentWord);
          currentWord = "";
        }
      } else if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = "";
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
    ans.duration = parseInt(result[4]);
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
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  }

  /*
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
*/

  const [isViewActive, setIsViewActive] = useState();

  const handleViewClick = (id) => {
    setIsViewActive(id !== isViewActive ? id : null);
  };

  return (
    <div className="w-2/4 text-white">
      <div className="grid grid-cols-3 gap-4 ml-2 mt-2">
        {/* Sidebar */}
        <div
          className="p-5 bg-black outline outline-offset-2 outline-black text-center"
          style={{ height: 300, maxHeight: 300 }}
        >
          <h1 className="font-bold text-2xl mb-10">Pomodoro App</h1>
          <button
            className="w-full rounded bg-purple-700 transition-colors duration-150 hover:bg-purple-800 px-5 py-2 mb-2"
            onClick={() => handleViewClick("streamerView")}
          >
            Streamer
          </button>
          <div />
          <button
            className="w-full rounded bg-sky-500 transition-colors duration-150 hover:bg-sky-600 px-5 py-2 mb-2"
            onClick={() => handleViewClick("communityView")}
          >
            Community
          </button>
          <div />
          <button
            className="w-full rounded bg-orange-400 transition-colors duration-150 hover:bg-orange-500 px-5 py-2 mb-2"
            id="personalView"
            isViewActive={isViewActive}
            setIsViewActive={setIsViewActive}
            onClick={() => handleViewClick("personalView")}
          >
            Personal
          </button>
        </div>

        {/* Content Box */}

        {/* Streamer View */}
        {isViewActive === "streamerView" && (
          <div
            className="p-2 col-span-2 bg-black outline outline-offset-2 outline-black"
            style={{ height: 400, maxHeight: 400 }}
          >
            <div className="streamerView m-5 text-gray-800">
              <StreamerPomodoroView />
            </div>
          </div>
        )}

        {/* Community View */}
        {isViewActive === "communityView" && (
          <div
            className="p-2 col-span-2 bg-black outline outline-offset-2 outline-black"
            style={{
              height: 400,
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            <div className="communityView m-5" isViewActive={isViewActive}>
              <div className="w-full mb-5">
                <h2 className="font-2xl font-bold text-center">
                  Active Pomodoros in this Community
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <CommunityPomodoroView />
              </div>
            </div>
          </div>
        )}

        {/* Personal View */}
        {isViewActive === "personalView" && (
          <div
            className="p-2 col-span-2 bg-black outline outline-offset-2 outline-black"
            style={{ height: 400, maxHeight: 400 }}
          >
            <div className="personalView m-5 text-gray-800">
              <PersonalPomodoroView />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function StreamerPomodoroView() {
    return (
      <div className="bg-white max-w-xs overflow-hidden rounded-lg object-center mx-auto">
        <div className="px-6 py-4">
          <div className="w-full mb-5">
            <h2 className="font-2xl font-bold text-center">
              Streamer's Active Pomodoro
            </h2>
          </div>
          <h2 className="font-xl text-center">
            <span className="font-semibold">Mode:</span> Focus
          </h2>
          <p className="timer mb-3 text-7xl font-semibold tracking-tight text-center">
            25:00
          </p>
          <div className="flex mb-4">
            <div className="flex-none w-1/2 text-center">
              <p className="font-semibold">Short Break</p>
              <p>5:00</p>
            </div>
            <div className="flex-1 w-1/2 text-center">
              <p className="font-semibold">Long Break</p>
              <p>15:00</p>
            </div>
          </div>
          <div className="h-0.5 mb-4 bg-gray-600"></div>
          <div className="w-full mb-5 text-center">
            <p className="font-semibold">Goal</p>
            <p>Lorem ipsum</p>
          </div>
        </div>
      </div>
    );
  }

  function CommunityPomodoroView() {
    return (
      <div className="bg-white w-full overflow-hidden rounded-lg object-center mx-auto">
        <div className="flex px-6 py-4 items-center">
          <div className="flex-none w-1/4 timer tracking-tight text-gray-800 text-left">
            <p className="text-l font-bold">25:00</p>
            <p className="text-l font-semibold">Focus</p>
          </div>
          <div className="flex-1 w-3/4 text-gray-700 text-xs">
            <p>
              <span className="font-bold">User:</span> viewer <br />
              <span className="font-bold">Goal:</span> Lorem ipsum <br />
              <span className="font-bold">Short Break:</span> 5:00 <br />
              <span className="font-bold">Long Break:</span> 15:00
            </p>
          </div>
        </div>
      </div>
    );
  }

  function PersonalPomodoroView() {
    return (
      <div className="bg-white max-w-xs overflow-hidden rounded-lg object-center mx-auto">
        <div className="px-6 py-4">
          <div className="w-full mb-5">
            <h2 className="font-2xl font-bold text-center">
              Create Your Own Pomodoro
            </h2>
          </div>
          <h2 className="font-xl text-center">
            <span className="font-semibold">Mode:</span> Focus
          </h2>
          <p className="timer mb-3 text-7xl font-semibold tracking-tight text-center">
            25:00
          </p>
          <div className="flex mb-4">
            <div className="flex-none w-1/2 text-center">
              <p className="font-semibold">Short Break</p>
              <p>5:00</p>
            </div>
            <div className="flex-1 w-1/2 text-center">
              <p className="font-semibold">Long Break</p>
              <p>15:00</p>
            </div>
          </div>
          <div className="h-0.5 mb-4 bg-gray-600"></div>
          <div className="w-full mb-5 text-center">
            <p className="font-semibold">Goal</p>
            <p>Lorem ipsum</p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
