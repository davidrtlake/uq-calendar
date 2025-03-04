import "./Day.css";

interface Props {
  title: string;
  url: string;
  start_date: Date;
}

const Day = ({ title, url, start_date }: Props) => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <>
      <h4>
        {monthNames[start_date.getMonth()]} {start_date.getDate()}
      </h4>
      <h4 className="truncate">{title}</h4>
      <p>{url}</p>
    </>
  );
};

export default Day;
