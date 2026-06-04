import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:3000/")
      .then((res) => res.json())
      .then((data) => console.log(data));
  }, []);

  return (
    <div>
      <h1>📚 Lernzeit-Manager</h1>
    </div>
  );
}

export default App;