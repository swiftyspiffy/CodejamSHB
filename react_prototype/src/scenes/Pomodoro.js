import { useEffect, useState } from "react";
//import { useDispatch } from "react-redux";

const Pomodoros = () => {
  //const dispatch = useDispatch();
  const [pomodoros, setPomodoros] = useState([]);

  const getPomodoros = async () => {
    const response = await fetch(
      "https://worker.swiftyspiffy.workers.dev/?action=list_pomodoros",
      {
        method: "GET",
        headers: { "content-type": "application/json;charset=UTF-8" },
      }
    );

    let pomodoros = await response.json();
    setPomodoros(pomodoros);

    console.log(pomodoros); // this is an object, data is under message > msg > array needed

    const pomodoroList = JSON.stringify(pomodoros);
    console.log(pomodoroList); // this is a string with just the data
  };

  useEffect(() => {
    getPomodoros();
  }, []); //eslint-disable-line react-hooks/exhaustive-deps
  // empty array so it is only called once

  return <>{/* Return styled pomodoro from above */}</>;
};

export default Pomodoros;
